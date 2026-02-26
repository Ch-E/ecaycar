"use client"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { mileagePriceData } from "@/lib/mock-data"

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { mileage: number; price: number; make: string } }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-foreground">{data.make}</p>
        <p className="text-muted-foreground">
          {data.mileage.toLocaleString()} miles
        </p>
        <p className="text-primary font-medium">
          ${data.price.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export function MileagePriceChart() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Mileage vs Price</CardTitle>
        <CardDescription>
          How mileage affects listing prices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: "oklch(0.65 0.2 160)",
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.005 260)" />
              <XAxis
                dataKey="mileage"
                type="number"
                tick={{ fill: "oklch(0.62 0 0)", fontSize: 12 }}
                axisLine={{ stroke: "oklch(0.26 0.005 260)" }}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                name="Mileage"
              />
              <YAxis
                dataKey="price"
                type="number"
                tick={{ fill: "oklch(0.62 0 0)", fontSize: 12 }}
                axisLine={{ stroke: "oklch(0.26 0.005 260)" }}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                name="Price"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={mileagePriceData}
                fill="oklch(0.65 0.2 160)"
                fillOpacity={0.7}
                r={6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
