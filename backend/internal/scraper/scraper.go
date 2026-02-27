package scraper

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/stealth"

	"ecaycar/backend/models"
)

const (
	// minPrice is the minimum listing price — applied both in the URL filter
	// and as a code-level safety net.
	minPrice        = 4000
	baseListingsURL = "https://ecaytrade.com/autos-boats/autos?minprice=4000"
	cardSelector    = `a[href*="/advert/"]`
)

// Scrape launches a browser and scrapes ALL pages of the autos listing,
// applying filters and returning only qualifying car listings.
// Set MAX_PAGES env var to limit pages (e.g. MAX_PAGES=3 for testing).
func Scrape() ([]models.Listing, error) {
	headless := strings.EqualFold(os.Getenv("HEADLESS"), "true")
	maxPages := 0 // 0 = no limit
	if v := os.Getenv("MAX_PAGES"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			maxPages = n
		}
	}

	log.Printf("Launching browser (headless=%v, maxPages=%d)...", headless, maxPages)

	// Leakless(false) disables the leakless.exe helper that Windows Defender
	// incorrectly flags as malware (known false positive with go-rod on Windows).
	l := launcher.New().Headless(headless).Leakless(false)
	u, err := l.Launch()
	if err != nil {
		return nil, fmt.Errorf("launcher: %w", err)
	}

	browser := rod.New().ControlURL(u).MustConnect()
	defer func() {
		if cerr := browser.Close(); cerr != nil {
			log.Printf("browser.Close: %v", cerr)
		}
	}()

	var allListings []models.Listing
	pageNum := 1

	for {
		if maxPages > 0 && pageNum > maxPages {
			log.Printf("Reached MAX_PAGES=%d, stopping.", maxPages)
			break
		}

		url := baseListingsURL
		if pageNum > 1 {
			url = fmt.Sprintf("%s&page=%d", baseListingsURL, pageNum)
		}

		listings, hasNext, rawCount, err := scrapePage(browser, url, pageNum)
		if err != nil {
			log.Printf("[page %d] error: %v — stopping pagination", pageNum, err)
			break
		}
		// Stop only when the page returned zero raw cards (true end of listings).
		// A page full of filtered-out parts is not a stopping condition.
		if rawCount == 0 {
			log.Printf("[page %d] no raw cards found — end of listings", pageNum)
			break
		}

		allListings = append(allListings, listings...)
		log.Printf("[page %d] accepted %d listing(s) — total so far: %d", pageNum, len(listings), len(allListings))

		if !hasNext {
			log.Printf("[page %d] no next page found — done", pageNum)
			break
		}

		pageNum++

		// Human-like delay between pages (2–3.5 s)
		delay := time.Duration(2000+rand.Intn(1500)) * time.Millisecond
		log.Printf("Waiting %v before page %d...", delay, pageNum)
		time.Sleep(delay)
	}

	log.Printf("Scrape complete: %d pages, %d total listings", pageNum, len(allListings))
	return allListings, nil
}

// scrapePage scrapes a single URL and returns filtered listings, whether
// a next page exists, and the raw (unfiltered) card count.
func scrapePage(browser *rod.Browser, url string, pageNum int) (listings []models.Listing, hasNext bool, rawCount int, err error) {
	page, err := stealth.Page(browser)
	if err != nil {
		return nil, false, 0, fmt.Errorf("stealth.Page: %w", err)
	}
	defer func() { _ = page.Close() }()

	log.Printf("[page %d] navigating to %s", pageNum, url)
	if err = page.Navigate(url); err != nil {
		return nil, false, 0, fmt.Errorf("navigate: %w", err)
	}
	// WaitLoad with a graceful timeout — some pages fire load late, which is fine
	// as long as the card selector appears afterwards.
	if werr := page.Timeout(20 * time.Second).WaitLoad(); werr != nil {
		log.Printf("[page %d] WaitLoad timed out (continuing anyway): %v", pageNum, werr)
	}

	if werr := waitForSelector(page, cardSelector, 30*time.Second); werr != nil {
		html, _ := page.HTML()
		log.Printf("[page %d] listing cards never appeared — HTML dump:\n%s", pageNum, truncate(html, 3000))
		return nil, false, 0, nil // treat as empty page, not a fatal error
	}

	// Human-like pause before extracting
	delay := time.Duration(1500+rand.Intn(1000)) * time.Millisecond
	log.Printf("[page %d] sleeping %v...", pageNum, delay)
	time.Sleep(delay)

	cards, err := extractCards(page)
	if err != nil {
		return nil, false, 0, fmt.Errorf("extractCards: %w", err)
	}
	rawCount = len(cards)
	log.Printf("[page %d] found %d raw card(s)", pageNum, rawCount)

	// Detect next page: look for a link to page N+1
	hasNext = hasNextPage(page, pageNum)

	for i, c := range cards {
		func() {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[page %d / card %d] panic: %v", pageNum, i, r)
				}
			}()
			l := ParseCard(c.Text, c.URL, c.ImgSrc)
			if l.Title == "" && l.Price == 0 {
				return
			}
			if l.Year == nil {
				log.Printf("[page %d / card %d] skip — no year: %s", pageNum, i, l.Title)
				return
			}
			if l.Price < minPrice {
				log.Printf("[page %d / card %d] skip — price too low (CI$%.0f): %s", pageNum, i, l.Price, l.Title)
				return
			}
			if strings.Contains(strings.ToLower(l.Title), "price upon request") {
				log.Printf("[page %d / card %d] skip — price upon request", pageNum, i)
				return
			}
			// Always fetch the detail page to capture all structured fields.
			fetchAndApplyDetailFields(browser, &l, pageNum, i)
			listings = append(listings, l)
		}()
	}

	return listings, hasNext, rawCount, nil
}

// detailJS is the JavaScript injected into each listing detail page.
// It extracts key→value pairs from the "Ad Details" section using three
// strategies (DOM structure, dt/dd pairs, line-by-line text), ensuring the
// best possible coverage regardless of minor HTML changes.
const detailJS = `() => {
const known = new Set([
  'body type','cylinders','make','drive','fuel type','transmission',
  'steering','exterior color','interior color','doors','on island',
  'condition','mileage','year'
]);
const fields = {};

// ── Strategy 1: container elements holding a bold label + sibling value ──
// Covers div-per-field patterns like: <div><strong>Label</strong><p>Value</p></div>
const bolds = document.querySelectorAll('strong, b, dt');
for (const el of bolds) {
  const label = el.textContent.trim().toLowerCase().replace(/:$/, '');
  if (!known.has(label)) continue;
  if (fields[label]) continue; // already found via a prior strategy
  // Try: next sibling element, parent's next sibling, or parent's next sibling's child.
  const candidates = [
    el.nextElementSibling,
    el.parentElement && el.parentElement.nextElementSibling,
    el.parentElement && el.parentElement.nextElementSibling &&
      el.parentElement.nextElementSibling.firstElementChild,
  ];
  for (const c of candidates) {
    if (c && c !== el) {
      const v = c.textContent.trim();
      if (v && v.length < 80 && !v.includes('\n')) { fields[label] = v; break; }
    }
  }
}

// ── Strategy 2: explicit dt/dd pairs ──
document.querySelectorAll('dt').forEach(dt => {
  const label = dt.textContent.trim().toLowerCase().replace(/:$/, '');
  const dd = dt.nextElementSibling;
  if (known.has(label) && dd && !fields[label]) {
    fields[label] = dd.textContent.trim();
  }
});

// ── Strategy 3: line-based parsing of innerText ──
// The listing page renders "Label\nValue" in its text, which is very reliable.
const lines = document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
for (let i = 0; i < lines.length - 1; i++) {
  const label = lines[i].toLowerCase().replace(/:$/, '');
  if (known.has(label) && !fields[label]) {
    const val = lines[i + 1];
    if (val && val.length < 80) fields[label] = val;
  }
}

return fields;
}`

// fetchAndApplyDetailFields opens the listing detail page, runs detailJS to
// extract an "Ad Details" field map, then calls ApplyDetailFields to merge
// the result into the listing struct.
func fetchAndApplyDetailFields(browser *rod.Browser, l *models.Listing, pageNum, cardIdx int) {
	page, err := stealth.Page(browser)
	if err != nil {
		log.Printf("[page %d / card %d] detail stealth.Page: %v", pageNum, cardIdx, err)
		return
	}
	defer func() { _ = page.Close() }()

	if err := page.Timeout(20 * time.Second).Navigate(l.URL); err != nil {
		log.Printf("[page %d / card %d] detail navigate: %v", pageNum, cardIdx, err)
		return
	}
	if werr := page.Timeout(10 * time.Second).WaitLoad(); werr != nil {
		log.Printf("[page %d / card %d] detail WaitLoad (continuing): %v", pageNum, cardIdx, werr)
	}

	res, err := page.Eval(detailJS)
	if err != nil {
		log.Printf("[page %d / card %d] detail JS eval: %v", pageNum, cardIdx, err)
		return
	}

	// Convert the JS object into a Go map[string]string.
	fields := make(map[string]string)
	for k, v := range res.Value.Map() {
		fields[k] = v.Str()
	}

	// Also grab full body text as fallback for mileage regex.
	var fullText string
	if txt, err := page.Eval(`() => document.body.innerText`); err == nil {
		fullText = txt.Value.Str()
	}

	ApplyDetailFields(fields, fullText, l)

	log.Printf("[page %d / card %d] detail fields — mileage:%v bodyType:%q drive:%q cylinders:%q steering:%q onIsland:%v",
		pageNum, cardIdx, l.Mileage, l.BodyType, l.Drive, l.Cylinders, l.Steering, l.OnIsland)

	// Brief human-like pause.
	time.Sleep(time.Duration(400+rand.Intn(400)) * time.Millisecond)
}

// hasNextPage checks whether a link to the next page number exists in the DOM.
func hasNextPage(page *rod.Page, currentPage int) bool {
	nextPage := currentPage + 1
	result, err := page.Eval(fmt.Sprintf(`() => {
		const links = document.querySelectorAll('a[href]');
		for (const a of links) {
			const href = a.href || '';
			if (href.includes('page=%d')) return true;
			if (a.getAttribute('aria-label') === 'Next page') return true;
			if (a.rel === 'next') return true;
		}
		return false;
	}`, nextPage))
	if err != nil {
		return false
	}
	return result.Value.Bool()
}

// rawCard holds the DOM data extracted by the JS snippet.
type rawCard struct {
	URL    string
	Text   string
	ImgSrc string
}

// extractCards runs JavaScript on the page to collect all advert links.
func extractCards(page *rod.Page) ([]rawCard, error) {
	result, err := page.Eval(`() => {
const seen = new Set();
return [...document.querySelectorAll('a[href*="/advert/"]')]
.filter(a => {
if (!/\/advert\/\d+$/.test(a.href)) return false;
if (seen.has(a.href)) return false;
seen.add(a.href);
return true;
})
.map(a => {
const img = a.querySelector('img');
return {
url:    a.href,
text:   a.innerText.trim(),
imgSrc: img ? img.src : ''
};
});
}`)
	if err != nil {
		return nil, fmt.Errorf("JS eval: %w", err)
	}

	raw := result.Value
	if raw.Nil() {
		return nil, fmt.Errorf("JS eval returned null/undefined")
	}

	var cards []rawCard
	for _, item := range raw.Arr() {
		obj := item.Map()
		cards = append(cards, rawCard{
			URL:    obj["url"].Str(),
			Text:   obj["text"].Str(),
			ImgSrc: obj["imgSrc"].Str(),
		})
	}
	return cards, nil
}

// waitForSelector polls until the selector matches at least one element.
func waitForSelector(page *rod.Page, selector string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		el, err := page.Element(selector)
		if err == nil && el != nil {
			return nil
		}
		time.Sleep(500 * time.Millisecond)
	}
	return fmt.Errorf("selector %q not found within %v", selector, timeout)
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}

// ---------------------------------------------------------------------------
// PROXY FALLBACK NOTE
// ---------------------------------------------------------------------------
// If Cloudflare blocks the request even with stealth enabled, route traffic
// through a residential proxy service such as ScrapingBee:
//
//   l = launcher.New().
//       Headless(true).
//       Proxy("http://YOUR_SCRAPINGBEE_PROXY_HOST:PORT").
//       Set("--ignore-certificate-errors")
//
// ScrapingBee also offers a simple HTTP API (no browser required):
//   https://www.scrapingbee.com/documentation/
// ---------------------------------------------------------------------------
