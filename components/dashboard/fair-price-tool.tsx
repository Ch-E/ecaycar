"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { carListings } from "@/lib/mock-data"
import type { ApiListing } from "@/lib/api"
import { Calculator, TrendingDown, TrendingUp, Minus } from "lucide-react"

type AnyListing = { make: string; model: string; year: number; price: number; mileage: number }

function toAny(listings: ApiListing[]): AnyListing[] {
  return listings
    .filter((l) => l.make && l.model && l.year != null && l.price > 0 && l.mileage != null)
    .map((l) => ({ make: l.make, model: l.model, year: l.year!, price: l.price, mileage: l.mileage! }))
}

const mockListings: AnyListing[] = carListings.map((c) => ({
  make: c.make, model: c.model, year: c.year, price: c.fairPrice, mileage: c.mileage,
}))

function getMakes(listings: AnyListing[]) {
  return Array.from(new Set(listings.map((c) => c.make))).sort()
}

function getModelsForMake(listings: AnyListing[], make: string) {
  return Array.from(
    new Set(listings.filter((c) => c.make === make).map((c) => c.model))
  ).sort()
}

function getYearsForMakeModel(listings: AnyListing[], make: string, model: string) {
  return Array.from(
    new Set(
      listings
        .filter((c) => c.make === make && c.model === model)
        .map((c) => c.year)
    )
  ).sort((a, b) => b - a)
}

interface Estimation {
  estimatedPrice: number
  priceRange: [number, number]
  confidence: "High" | "Medium" | "Low"
  comparables: number
}

function estimatePrice(
  listings: AnyListing[],
  make: string,
  model: string,
  year: number,
  mileage: number
): Estimation | null {
  const comparables = listings.filter((c) => c.make === make)
  if (comparables.length === 0) return null

  const exactMatch = listings.filter(
    (c) => c.make === make && c.model === model
  )

  let basePrice: number
  let confidence: "High" | "Medium" | "Low"

  if (exactMatch.length >= 2) {
    basePrice =
      exactMatch.reduce((sum, c) => sum + c.price, 0) / exactMatch.length
    confidence = "High"
  } else if (exactMatch.length === 1) {
    basePrice = exactMatch[0].price
    confidence = "Medium"
  } else {
    basePrice =
      comparables.reduce((sum, c) => sum + c.price, 0) / comparables.length
    confidence = "Low"
  }

  // Year adjustment
  const avgYear =
    comparables.reduce((sum, c) => sum + c.year, 0) / comparables.length
  const yearDiff = year - avgYear
  basePrice += yearDiff * 1500

  // Mileage adjustment
  const avgMileage =
    comparables.reduce((sum, c) => sum + c.mileage, 0) / comparables.length
  const mileageDiff = mileage - avgMileage
  basePrice -= (mileageDiff / 10000) * 800

  const range: [number, number] = [
    Math.round(basePrice * 0.9),
    Math.round(basePrice * 1.1),
  ]

  return {
    estimatedPrice: Math.round(basePrice),
    priceRange: range,
    confidence,
    comparables: comparables.length,
  }
}

interface FairPriceToolProps {
  listings?: ApiListing[]
}

export function FairPriceTool({ listings }: FairPriceToolProps) {
  const allListings = useMemo<AnyListing[]>(
    () => (listings && listings.length > 0 ? toAny(listings) : mockListings),
    [listings]
  )

  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [mileage, setMileage] = useState("")
  const [result, setResult] = useState<Estimation | null>(null)
  const [showResult, setShowResult] = useState(false)

  const makes = useMemo(() => getMakes(allListings), [allListings])
  const models = useMemo(() => (make ? getModelsForMake(allListings, make) : []), [make, allListings])
  const years = useMemo(
    () => (make && model ? getYearsForMakeModel(allListings, make, model) : []),
    [make, model, allListings]
  )

  function handleEstimate() {
    if (!make || !mileage) return
    const est = estimatePrice(
      allListings,
      make,
      model,
      year ? parseInt(year) : 2022,
      parseInt(mileage)
    )
    setResult(est)
    setShowResult(true)
  }

  function handleReset() {
    setMake("")
    setModel("")
    setYear("")
    setMileage("")
    setResult(null)
    setShowResult(false)
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Fair Price Estimator</CardTitle>
        </div>
        <CardDescription>
          Get an estimated fair market value based on ecaytrade.com data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Select
            value={make}
            onValueChange={(v) => {
              setMake(v)
              setModel("")
              setYear("")
              setShowResult(false)
            }}
          >
            <SelectTrigger className="h-9 bg-secondary border-border/50">
              <SelectValue placeholder="Make" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={model}
            onValueChange={(v) => {
              setModel(v)
              setYear("")
              setShowResult(false)
            }}
            disabled={!make}
          >
            <SelectTrigger className="h-9 bg-secondary border-border/50">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year}
            onValueChange={(v) => {
              setYear(v)
              setShowResult(false)
            }}
            disabled={!model}
          >
            <SelectTrigger className="h-9 bg-secondary border-border/50">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Mileage"
            value={mileage}
            onChange={(e) => {
              setMileage(e.target.value)
              setShowResult(false)
            }}
            className="h-9 bg-secondary border-border/50"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={handleEstimate}
            disabled={!make || !mileage}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Estimate Price
          </Button>
          {showResult && (
            <Button variant="outline" onClick={handleReset} className="border-border/50 text-foreground">
              Reset
            </Button>
          )}
        </div>

        {showResult && result && (
          <div className="mt-6 rounded-lg border border-border/50 bg-secondary/50 p-5">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Estimated Fair Price
                </span>
                <span className="text-3xl font-bold text-primary">
                  ${result.estimatedPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Price Range
                </span>
                <span className="text-lg font-semibold text-foreground">
                  ${result.priceRange[0].toLocaleString()} -{" "}
                  ${result.priceRange[1].toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Confidence
                  </span>
                  <Badge
                    className={
                      result.confidence === "High"
                        ? "border-transparent bg-success/15 text-success"
                        : result.confidence === "Medium"
                        ? "border-transparent bg-warning/15 text-warning"
                        : "border-transparent bg-destructive/15 text-destructive"
                    }
                  >
                    {result.confidence}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Based on {result.comparables} comparable listings
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
