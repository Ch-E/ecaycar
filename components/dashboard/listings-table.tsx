"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { carListings } from "@/lib/mock-data"
import { Search, ArrowUpDown } from "lucide-react"

type SortField = "price" | "year" | "mileage" | "listedDate"
type SortOrder = "asc" | "desc"

function getDealBadgeClasses(rating: string) {
  switch (rating) {
    case "Great Deal":
      return "border-transparent bg-success/15 text-success"
    case "Good Deal":
      return "border-transparent bg-info/15 text-info"
    case "Fair Deal":
      return "border-transparent bg-warning/15 text-warning"
    case "Overpriced":
      return "border-transparent bg-destructive/15 text-destructive"
    default:
      return ""
  }
}

export function ListingsTable() {
  const [search, setSearch] = useState("")
  const [makeFilter, setMakeFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("listedDate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const makes = useMemo(
    () => Array.from(new Set(carListings.map((c) => c.make))).sort(),
    []
  )

  const filtered = useMemo(() => {
    let items = [...carListings]

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (c) =>
          c.make.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.year.toString().includes(q)
      )
    }

    if (makeFilter !== "all") {
      items = items.filter((c) => c.make === makeFilter)
    }

    items.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "price":
          comparison = a.price - b.price
          break
        case "year":
          comparison = a.year - b.year
          break
        case "mileage":
          comparison = a.mileage - b.mileage
          break
        case "listedDate":
          comparison = new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime()
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return items
  }, [search, makeFilter, sortField, sortOrder])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Listings</CardTitle>
            <CardDescription>
              {filtered.length} vehicles found on ecaytrade.com
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search make, model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 pl-9 bg-secondary border-border/50"
              />
            </div>
            <Select value={makeFilter} onValueChange={setMakeFilter}>
              <SelectTrigger className="h-9 w-36 bg-secondary border-border/50">
                <SelectValue placeholder="All Makes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                {makes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="pl-6">Vehicle</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("year")}
              >
                <div className="flex items-center gap-1">
                  Year
                  <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("price")}
              >
                <div className="flex items-center gap-1">
                  Price
                  <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Fair Price</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("mileage")}
              >
                <div className="flex items-center gap-1">
                  Mileage
                  <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Deal Rating</TableHead>
              <TableHead
                className="cursor-pointer select-none pr-6"
                onClick={() => toggleSort("listedDate")}
              >
                <div className="flex items-center gap-1">
                  Listed
                  <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((car) => {
              const priceDiff = car.price - car.fairPrice
              const priceDiffPct = ((priceDiff / car.fairPrice) * 100).toFixed(1)
              return (
                <TableRow key={car.id} className="border-border/50">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {car.make} {car.model}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {car.bodyType} &middot; {car.transmission} &middot; {car.fuelType}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-foreground">{car.year}</TableCell>
                  <TableCell className="font-mono font-semibold text-foreground">
                    ${car.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-muted-foreground">
                        ${car.fairPrice.toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-mono ${
                          priceDiff > 0
                            ? "text-destructive"
                            : "text-success"
                        }`}
                      >
                        {priceDiff > 0 ? "+" : ""}
                        {priceDiffPct}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {car.mileage.toLocaleString()} mi
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs text-foreground border-border/50">
                      {car.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDealBadgeClasses(car.dealRating)}>
                      {car.dealRating}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground text-xs font-mono">
                    {new Date(car.listedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
