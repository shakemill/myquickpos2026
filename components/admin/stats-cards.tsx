"use client"

import { Monitor, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"
import { useTerminals } from "@/hooks/use-terminals"

export function StatsCards() {
  const { terminals } = useTerminals()

  const totalSales = terminals.reduce((sum, t) => sum + t.todaySales, 0)
  const totalOrders = terminals.reduce((sum, t) => sum + t.todayOrders, 0)
  const onlineCount = terminals.filter((t) => t.status === "online").length
  const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0

  const stats = [
    {
      label: "Today's Revenue",
      value: `$${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: "+12.5%",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      change: "+8.2%",
    },
    {
      label: "Active Terminals",
      value: `${onlineCount}/${terminals.length}`,
      icon: Monitor,
      change: null,
    },
    {
      label: "Avg. Order Value",
      value: `$${avgOrder.toFixed(2)}`,
      icon: TrendingUp,
      change: "+3.1%",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
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
