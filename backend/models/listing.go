// Package models defines the data structures for the ecaytracker application.
package models

// Listing represents a single car listing scraped from ecaytrade.com.
type Listing struct {
	Title      string  `json:"title"`
	Price      float64 `json:"price"`
	Currency   string  `json:"currency"`
	URL        string  `json:"url"`
	ExternalID string  `json:"external_id"`
	Make       string  `json:"make"`
	Model      string  `json:"model"`
	Year       int     `json:"year"`
	Mileage    string  `json:"mileage"`
	ImageURL   string  `json:"image_url"`
	Location   string  `json:"location"`
}
