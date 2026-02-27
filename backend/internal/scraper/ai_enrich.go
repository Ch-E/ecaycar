package scraper

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"ecaytracker/backend/models"
)

const (
	githubModelsURL = "https://models.inference.ai.azure.com/chat/completions"
	aiModel         = "gpt-4o-mini"
)

// aiRequest is the OpenAI-compatible request body sent to GitHub Models.
type aiRequest struct {
	Model       string      `json:"model"`
	Messages    []aiMessage `json:"messages"`
	Temperature float64     `json:"temperature"`
	MaxTokens   int         `json:"max_tokens"`
	ResponseFmt responseFmt `json:"response_format"`
}

type aiMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type responseFmt struct {
	Type string `json:"type"`
}

// aiCarResult is the structured JSON the model returns for a single listing.
type aiCarResult struct {
	Make  string `json:"make"`
	Model string `json:"model"`
	Title string `json:"title"`
}

// needsEnrichment returns true when the listing's make doesn't match any known
// make, suggesting the scraper couldn't parse it cleanly.
func needsEnrichment(l models.Listing) bool {
	if l.Make == "" {
		return true
	}
	upper := strings.ToUpper(l.Make)
	for _, mk := range knownMakes {
		if strings.ToUpper(mk) == upper {
			return false
		}
	}
	return true
}

// EnrichListings calls the GitHub Models API to normalise the make, model, and
// title for listings that couldn't be cleanly parsed. Listings that already
// have a recognised make are skipped to conserve API quota.
//
// If the token is empty or the API call fails for a listing, the original
// values are preserved and a warning is logged — enrichment is best-effort.
func EnrichListings(ctx context.Context, listings []models.Listing, githubToken string) []models.Listing {
	if githubToken == "" {
		log.Println("[ai_enrich] GITHUB_TOKEN not set — skipping AI enrichment")
		return listings
	}

	client := &http.Client{Timeout: 30 * time.Second}
	enriched := make([]models.Listing, len(listings))
	copy(enriched, listings)

	var toEnrich []int
	for i, l := range enriched {
		if needsEnrichment(l) {
			toEnrich = append(toEnrich, i)
		}
	}

	if len(toEnrich) == 0 {
		log.Println("[ai_enrich] All listings have recognised makes — skipping AI enrichment")
		return enriched
	}

	log.Printf("[ai_enrich] Enriching %d/%d listings with AI...", len(toEnrich), len(listings))

	for count, i := range toEnrich {
		l := &enriched[i]
		result, err := enrichOne(ctx, client, githubToken, *l)
		if err != nil {
			log.Printf("[ai_enrich] WARNING: failed to enrich listing %s (%q): %v", l.ExternalID, l.Title, err)
			continue
		}

		if result.Make != "" {
			l.Make = result.Make
		}
		if result.Model != "" {
			l.Model = result.Model
		}
		if result.Title != "" {
			l.Title = result.Title
		}

		log.Printf("[ai_enrich] [%d/%d] %q → make=%q model=%q", count+1, len(toEnrich), l.Title, l.Make, l.Model)

		// Respect GitHub Models rate limit: ~15 req/min on free tier.
		// 4.5s gap gives ~13 req/min with headroom.
		if count < len(toEnrich)-1 {
			select {
			case <-ctx.Done():
				log.Println("[ai_enrich] context cancelled — stopping enrichment early")
				return enriched
			case <-time.After(4500 * time.Millisecond):
			}
		}
	}

	log.Printf("[ai_enrich] Enrichment complete.")
	return enriched
}

// enrichOne calls the API for a single listing and returns the parsed result.
func enrichOne(ctx context.Context, client *http.Client, token string, l models.Listing) (*aiCarResult, error) {
	prompt := fmt.Sprintf(`You are a car listing normaliser. Given a raw car listing title and partial make/model,
return the correct make, model, and a clean title.

Rules:
- "make" must be the official brand name (e.g. "Toyota", "Mercedes-Benz", "Land Rover")
- "model" must be just the model name (e.g. "Corolla", "C-Class", "Defender 110")
- "title" must be a clean, readable title (e.g. "2019 Toyota Corolla SE")
- If you cannot determine make or model with confidence, return an empty string for that field
- Return ONLY valid JSON, no explanation

Raw listing:
Title: %s
Make: %s
Model: %s
Year: %v

Return exactly this JSON:
{"make": "...", "model": "...", "title": "..."}`,
		l.Title,
		l.Make,
		l.Model,
		l.Year,
	)

	reqBody := aiRequest{
		Model: aiModel,
		Messages: []aiMessage{
			{Role: "user", Content: prompt},
		},
		Temperature: 0,
		MaxTokens:   100,
		ResponseFmt: responseFmt{Type: "json_object"},
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, githubModelsURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned %d: %s", resp.StatusCode, string(respBytes))
	}

	// Parse the OpenAI-compatible response envelope.
	var envelope struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(respBytes, &envelope); err != nil {
		return nil, fmt.Errorf("unmarshal envelope: %w", err)
	}
	if len(envelope.Choices) == 0 || envelope.Choices[0].Message.Content == "" {
		return nil, fmt.Errorf("empty response from model")
	}

	var result aiCarResult
	if err := json.Unmarshal([]byte(envelope.Choices[0].Message.Content), &result); err != nil {
		return nil, fmt.Errorf("unmarshal result: %w", err)
	}

	return &result, nil
}
