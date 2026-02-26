package main

import (
	"encoding/json"
	"log"
	"os"

	"ecaytracker/backend/internal/scraper"
)

func main() {
	log.SetOutput(os.Stderr) // keep logs on stderr so stdout stays clean JSON

	listings, err := scraper.Scrape()
	if err != nil {
		log.Fatalf("Scrape failed: %v", err)
	}

	if len(listings) == 0 {
		log.Fatal("No listings extracted — the selectors may need updating or Cloudflare blocked the request.")
	}

	log.Printf("Successfully extracted %d listing(s)", len(listings))

	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	if err := enc.Encode(listings); err != nil {
		log.Fatalf("JSON encode: %v", err)
	}
}
