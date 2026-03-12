"use client"

import { Monitor, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"
import { formatWithCurrency } from "@/lib/format-currency"

interface StatsCardsProps {
  formatCurrency?: (amount: number) => string
  currency?: string
  stats?: {
    revenue: number
    totalOrders: number
    activeTerminals: string
    avgOrderValue: number
  }
}

export function StatsCards({ formatCurrency, currency = "USD", stats: statsProp }: StatsCardsProps) {
  const stats = statsProp ?? {
    revenue: 0,
    totalOrders: 0,
    activeTerminals: "0/0",
    avgOrderValue: 0,
  }
  const revenue = Number(stats.revenue) || 0
  const totalOrders = Number(stats.totalOrders) || 0
  const avgOrderValue = Number(stats.avgOrderValue) || 0
  const activeTerminals = typeof stats.activeTerminals === "string" ? stats.activeTerminals : "0/0"
  const format = formatCurrency ?? ((n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`)

  const statItems = [
    {
      label: "Revenue (30 days)",
      value: format(revenue),
      icon: DollarSign,
      change: null as string | null,
    },
    {
      label: "Total Orders",
      value: String(totalOrders),
      icon: ShoppingCart,
      change: null as string | null,
    },
    {
      label: "Active Terminals",
      value: activeTerminals,
      icon: Monitor,
      change: null as string | null,
    },
    {
      label: "Avg. Order Value",
      value: format(avgOrderValue),
      icon: TrendingUp,
      change: null as string | null,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-card-foreground font-mono mt-0.5">
                {stat.value}
              </p>
              {stat.change && (
                <p className="text-xs font-medium text-primary mt-1">
                  {stat.change} vs yesterday
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
