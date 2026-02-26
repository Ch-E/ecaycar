"use client"

import { Card, CardContent } from "@/components/ui/card"
import { kpiStats } from "@/lib/mock-data"
import {
  Car,
  DollarSign,
  Gauge,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3,
} from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
}

function KpiCard({ title, value, change, icon }: KpiCardProps) {
  const isPositive = change >= 0
  return (
    <Card className="border-border/50 relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {title}
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </span>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="size-3 text-success" />
              ) : (
                <TrendingDown className="size-3 text-destructive" />
              )}
              <span
                className={`text-xs font-medium ${
                  isPositive ? "text-success" : "text-destructive"
                }`}
              >
                {isPositive ? "+" : ""}
                {change}%
              </span>
              <span className="text-muted-foreground text-xs">vs last month</span>
            </div>
          </div>
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiCards() {
  const cards = [
    {
      title: "Total Listings",
      value: kpiStats.totalListings.toLocaleString(),
      change: kpiStats.newListingsChange,
      icon: <Car className="size-5 text-primary" />,
    },
    {
      title: "Average Price",
      value: `$${kpiStats.avgPrice.toLocaleString()}`,
      change: kpiStats.avgPriceChange,
      icon: <DollarSign className="size-5 text-primary" />,
    },
    {
      title: "Median Price",
      value: `$${kpiStats.medianPrice.toLocaleString()}`,
      change: kpiStats.medianPriceChange,
      icon: <BarChart3 className="size-5 text-primary" />,
    },
    {
      title: "Avg Mileage",
      value: `${kpiStats.avgMileage.toLocaleString()} mi`,
      change: kpiStats.avgMileageChange,
      icon: <Gauge className="size-5 text-primary" />,
    },
    {
      title: "New This Week",
      value: kpiStats.newListingsThisWeek.toString(),
      change: kpiStats.newListingsChange,
      icon: <TrendingUp className="size-5 text-primary" />,
    },
    {
      title: "Great Deals",
      value: kpiStats.greatDeals.toString(),
      change: kpiStats.greatDealsChange,
      icon: <Sparkles className="size-5 text-primary" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  )
}
