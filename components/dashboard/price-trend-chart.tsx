"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { priceTrends } from "@/lib/mock-data"

const CHART_1 = "oklch(0.65 0.2 160)"
const CHART_2 = "oklch(0.6 0.15 250)"

export function PriceTrendChart() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Price Trends</CardTitle>
        <CardDescription>
          Average and median listing prices over 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            avgPrice: {
              label: "Average Price",
              color: CHART_1,
            },
            medianPrice: {
              label: "Median Price",
              color: CHART_2,
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_1} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_1} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillMedian" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_2} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.005 260)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.62 0 0)", fontSize: 12 }}
                axisLine={{ stroke: "oklch(0.26 0.005 260)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.62 0 0)", fontSize: 12 }}
                axisLine={{ stroke: "oklch(0.26 0.005 260)" }}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `$${Number(value).toLocaleString()}`
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="avgPrice"
                stroke={CHART_1}
                strokeWidth={2}
                fill="url(#fillAvg)"
                name="Average Price"
              />
              <Area
                type="monotone"
                dataKey="medianPrice"
                stroke={CHART_2}
                strokeWidth={2}
                fill="url(#fillMedian)"
                name="Median Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
