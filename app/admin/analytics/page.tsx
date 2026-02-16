"use client"

import { useMemo, useState } from "react"
import { useTerminals } from "@/hooks/use-terminals"
import { useCategories } from "@/hooks/use-categories"
import { getCategoryIcon } from "@/lib/category-icons"
import {
  generateHourlyData,
  generateWeeklyData,
  generateLast30Days,
  generateCategorySales,
  generateTopProducts,
  generatePaymentBreakdown,
  generateHeatmapData,
  generateUserPerformance,
} from "@/lib/analytics-data"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Users,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Gift,
  CalendarDays,
  UserCheck,
  Timer,
  Star,
  Medal,
  Undo2,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CHART_FILLS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

// ── Period selector ─────────────────────────────────────────────────────────

type Period = "today" | "week" | "month"

const periods: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "30 Days" },
]

// ── Custom Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-card-foreground font-mono">
            {p.dataKey === "revenue" || p.dataKey === "avgTicket"
              ? `$${p.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Payment method icon ─────────────────────────────────────────────────────

function PaymentIcon({ method }: { method: string }) {
  switch (method) {
    case "Card":
      return <CreditCard className="h-4 w-4" />
    case "Cash":
      return <Banknote className="h-4 w-4" />
    case "Mobile Pay":
      return <Smartphone className="h-4 w-4" />
    case "Gift Card":
      return <Gift className="h-4 w-4" />
    default:
      return <CreditCard className="h-4 w-4" />
  }
}

// ── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  change,
  icon: Icon,
}: {
  label: string
  value: string
  sub: string
  change: number
  icon: React.ElementType
}) {
  const isPositive = change >= 0
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
            isPositive
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-card-foreground font-mono">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("today")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const { terminals } = useTerminals()
  const { root: rootCategories } = useCategories()

  const hourly = useMemo(() => generateHourlyData(), [])
  const weekly = useMemo(() => generateWeeklyData(), [])
  const monthly = useMemo(() => generateLast30Days(), [])
  const categorySales = useMemo(() => generateCategorySales(), [])
  const topProducts = useMemo(() => generateTopProducts(), [])
  const payments = useMemo(() => generatePaymentBreakdown(), [])
  const heatmap = useMemo(() => generateHeatmapData(), [])
  const userPerf = useMemo(() => generateUserPerformance(), [])

  const selectedUser = selectedUserId
    ? userPerf.find((u) => u.userId === selectedUserId) ?? null
    : null

  const totalSales = terminals.reduce((s, t) => s + t.todaySales, 0)
  const totalOrders = terminals.reduce((s, t) => s + t.todayOrders, 0)
  const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0
  const onlineTerminals = terminals.filter((t) => t.status === "online").length

  const paymentTotal = payments.reduce((s, p) => s + p.amount, 0)
  const heatmapMax = Math.max(...heatmap.flatMap((r) => r.hours))

  // Data for current period chart
  const chartData =
    period === "today" ? hourly : period === "week" ? weekly : monthly

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sales performance and business insights
          </p>
        </div>
        <div className="flex items-center rounded-lg border border-border bg-card p-1 gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                period === p.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`$${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          sub="vs $1,890.25 yesterday"
          change={15.2}
          icon={DollarSign}
        />
        <StatCard
          label="Total Orders"
          value={totalOrders.toString()}
          sub="vs 68 yesterday"
          change={19.1}
          icon={ShoppingCart}
        />
        <StatCard
          label="Avg. Ticket"
          value={`$${avgTicket.toFixed(2)}`}
          sub="Per transaction"
          change={3.4}
          icon={TrendingUp}
        />
        <StatCard
          label="Active Terminals"
          value={`${onlineTerminals}/${terminals.length}`}
          sub={`${terminals.length - onlineTerminals} offline`}
          change={0}
          icon={Monitor}
        />
      </div>

      {/* Revenue Chart + Category Pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                Revenue Overview
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {period === "today"
                  ? "Hourly breakdown"
                  : period === "week"
                    ? "Daily this week"
                    : "Last 30 days"}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-1))]" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
                Orders
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey={period === "today" ? "hour" : "day"}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#fillRevenue)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  fill="hsl(var(--chart-2))"
                  opacity={0.5}
                  radius={[3, 3, 0, 0]}
                  barSize={period === "month" ? 6 : 16}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Pie */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-card-foreground mb-1">
            Sales by Category
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Revenue distribution
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="revenue"
                  nameKey="name"
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                >
                  {categorySales.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-sm">
                        <p className="font-semibold text-card-foreground">
                          {d.name}
                        </p>
                        <p className="text-muted-foreground font-mono">
                          ${d.revenue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {d.orders} orders
                        </p>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {categorySales.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: cat.fill }}
                  />
                  <span className="text-card-foreground">{cat.name}</span>
                </div>
                <span className="font-mono text-muted-foreground">
                  ${cat.revenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products + Payment Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 10 Products */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-card-foreground mb-1">
            Top Selling Products
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            By revenue, {period === "today" ? "today" : period === "week" ? "this week" : "last 30 days"}
          </p>
          <div className="space-y-3">
            {topProducts.map((item, i) => {
              const maxRev = topProducts[0].revenue
              const pct = (item.revenue / maxRev) * 100
              return (
                <div key={item.product.id} className="group">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold text-secondary-foreground">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-card-foreground truncate">
                          {item.product.name}
                        </span>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-xs text-muted-foreground">
                            {item.unitsSold} sold
                          </span>
                          <span className="text-sm font-semibold font-mono text-card-foreground">
                            ${item.revenue.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-card-foreground mb-1">
            Payment Methods
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Transaction distribution
          </p>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={payments}
                layout="vertical"
                margin={{ top: 0, right: 5, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="method"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
                  {payments.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {payments.map((p) => {
              const pct = ((p.amount / paymentTotal) * 100).toFixed(1)
              return (
                <div
                  key={p.method}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${p.fill}20`, color: p.fill }}
                  >
                    <PaymentIcon method={p.method} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-card-foreground">
                      {p.method}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {pct}% &middot; {p.count} txn
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Cashier Performance ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                Cashier Performance
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Individual POS user metrics and comparison
              </p>
            </div>
          </div>
          {selectedUser && (
            <button
              onClick={() => setSelectedUserId(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <Undo2 className="h-3 w-3" />
              Back to leaderboard
            </button>
          )}
        </div>

        {!selectedUser ? (
          <>
            {/* Leaderboard */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {userPerf.map((u, i) => {
                const maxRev = userPerf[0].totalRevenue
                const pct = maxRev > 0 ? (u.totalRevenue / maxRev) * 100 : 0
                return (
                  <button
                    key={u.userId}
                    onClick={() => setSelectedUserId(u.userId)}
                    className={cn(
                      "relative flex flex-col gap-3 rounded-xl border p-5 text-left transition-all hover:shadow-md",
                      i === 0
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-secondary/20 hover:border-border/80"
                    )}
                  >
                    {/* Rank badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm",
                            i === 0
                              ? "bg-yellow-500/15 text-yellow-500"
                              : i === 1
                                ? "bg-zinc-400/15 text-zinc-400"
                                : i === 2
                                  ? "bg-amber-700/15 text-amber-700"
                                  : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {i === 0 ? (
                            <Medal className="h-5 w-5" />
                          ) : (
                            `#${i + 1}`
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      {i === 0 && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-lg font-bold font-mono text-card-foreground">
                          ${u.totalRevenue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold font-mono text-card-foreground">
                          {u.totalOrders}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Orders</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold font-mono text-card-foreground">
                          ${u.avgTicket.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Avg Ticket</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          i === 0 ? "bg-yellow-500" : "bg-primary/60"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {u.avgHandleTime}s avg
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {u.itemsPerOrder} items/order
                      </span>
                      <span className="flex items-center gap-1">
                        <Undo2 className="h-3 w-3" />
                        {u.refunds} refunds
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Side-by-side bar comparison chart */}
            <div className="rounded-lg border border-border bg-secondary/20 p-5">
              <h3 className="text-sm font-semibold text-card-foreground mb-1">
                Revenue Comparison
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Day-by-day comparison across cashiers
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                      return days.map((day, di) => {
                        const row: Record<string, string | number> = { day }
                        userPerf.forEach((u) => {
                          row[u.name] = u.weekdayRevenue[di]?.revenue ?? 0
                        })
                        return row
                      })
                    })()}
                    margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `$${v}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={28}
                      iconSize={8}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
                    />
                    {userPerf.map((u, i) => (
                      <Bar
                        key={u.userId}
                        dataKey={u.name}
                        fill={CHART_FILLS[i % CHART_FILLS.length]}
                        radius={[3, 3, 0, 0]}
                        barSize={18}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          /* ── Selected user detail ─────────────────────────────────────── */
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                {selectedUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-card-foreground">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
              <div
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  selectedUser.status === "active"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {selectedUser.status}
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                {
                  label: "Revenue",
                  value: `$${selectedUser.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  icon: DollarSign,
                },
                {
                  label: "Orders",
                  value: selectedUser.totalOrders.toString(),
                  icon: ShoppingCart,
                },
                {
                  label: "Avg Ticket",
                  value: `$${selectedUser.avgTicket.toFixed(2)}`,
                  icon: TrendingUp,
                },
                {
                  label: "Items/Order",
                  value: selectedUser.itemsPerOrder.toFixed(1),
                  icon: Package,
                },
                {
                  label: "Avg Time",
                  value: `${selectedUser.avgHandleTime}s`,
                  icon: Timer,
                },
                {
                  label: "Refunds",
                  value: selectedUser.refunds.toString(),
                  icon: Undo2,
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-bold font-mono text-card-foreground">
                    {kpi.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Top product badge */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/20 px-4 py-3">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-muted-foreground">Top selling product:</span>
              <span className="text-sm font-semibold text-card-foreground">
                {selectedUser.topProduct}
              </span>
            </div>

            {/* Charts: hourly + weekday */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Hourly revenue */}
              <div className="rounded-lg border border-border bg-secondary/20 p-5">
                <h3 className="text-sm font-semibold text-card-foreground mb-1">
                  Hourly Revenue
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Revenue by hour of day
                </p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={selectedUser.hourlyRevenue}
                      margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="fillUserHourly" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--chart-1))"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--chart-1))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `$${v}`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        fill="url(#fillUserHourly)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekday revenue */}
              <div className="rounded-lg border border-border bg-secondary/20 p-5">
                <h3 className="text-sm font-semibold text-card-foreground mb-1">
                  Revenue by Day
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Weekly revenue pattern
                </p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedUser.weekdayRevenue}
                      margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `$${v}`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="revenue"
                        fill="hsl(var(--chart-2))"
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Performance + Heatmap */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Terminal performance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-card-foreground mb-1">
            Terminal Performance
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Revenue and orders per terminal
          </p>
          <div className="space-y-4">
            {terminals.map((t) => {
              const pct = totalSales > 0 ? (t.todaySales / totalSales) * 100 : 0
              const tAvg =
                t.todayOrders > 0
                  ? (t.todaySales / t.todayOrders).toFixed(2)
                  : "0.00"
              return (
                <div
                  key={t.id}
                  className="rounded-lg border border-border bg-secondary/20 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          t.status === "online"
                            ? "bg-primary"
                            : t.status === "maintenance"
                              ? "bg-yellow-500"
                              : "bg-muted-foreground/40"
                        )}
                      />
                      <span className="text-sm font-semibold text-card-foreground">
                        {t.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.location}
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-card-foreground">
                      ${t.todaySales.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{t.todayOrders} orders</span>
                    <span>Avg ${tAvg}</span>
                    <span>{pct.toFixed(1)}% of total</span>
                    <span className="ml-auto capitalize">{t.cashier}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Heatmap */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-card-foreground">
              Order Heatmap
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Orders per hour by day of week
          </p>

          {/* Hour labels */}
          <div className="flex gap-px mb-1 ml-10">
            {Array.from({ length: 14 }, (_, i) => {
              const h = i + 8
              return (
                <div
                  key={i}
                  className="flex-1 text-center text-[9px] text-muted-foreground leading-tight"
                >
                  {h <= 12 ? `${h}a` : `${h - 12}p`}
                </div>
              )
            })}
          </div>

          {/* Grid */}
          <div className="space-y-px">
            {heatmap.map((row) => (
              <div key={row.day} className="flex items-center gap-px">
                <span className="w-10 text-xs text-muted-foreground text-right pr-2 shrink-0">
                  {row.day}
                </span>
                {row.hours.map((val, hi) => {
                  const intensity = heatmapMax > 0 ? val / heatmapMax : 0
                  return (
                    <div
                      key={hi}
                      className="flex-1 aspect-square rounded-sm transition-colors"
                      style={{
                        backgroundColor: `hsl(var(--chart-1) / ${(intensity * 0.85 + 0.05).toFixed(2)})`,
                      }}
                      title={`${row.day} ${hi + 8 <= 12 ? `${hi + 8}AM` : `${hi + 8 - 12}PM`}: ${val} orders`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Scale legend */}
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
              <div
                key={o}
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: `hsl(var(--chart-1) / ${o})`,
                }}
              />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
