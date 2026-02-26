import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { terminalRepository } from "@/lib/repositories/terminal.repository"
import { categoryRepository } from "@/lib/repositories/category.repository"
import { userRepository } from "@/lib/repositories/user.repository"
import { analyticsRepository } from "@/lib/repositories/analytics.repository"
import { tenantRepository } from "@/lib/repositories/tenant.repository"
import { AdminDashboardClient } from "./admin-dashboard-client"

export default async function AdminDashboard() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const [terminals, categories, users, stats, todayByTerminal, tenantSettings] = await Promise.all([
    terminalRepository.findAll(tenantId),
    categoryRepository.getRootCategories(tenantId),
    userRepository.findAll(tenantId),
    analyticsRepository.dashboardSummary(tenantId),
    analyticsRepository.todayStatsByTerminal(tenantId),
    tenantRepository.getSettings(tenantId),
  ])
  const currency = tenantSettings?.currency ?? "USD"

  const todayMap = new Map(todayByTerminal.map((s) => [s.terminalId, { revenue: s.revenue, orders: s.orders }]))

  const terminalList = terminals.map((t) => {
    const settings = (t.settings as { assignedCategories?: string[] }) ?? {}
    const today = todayMap.get(t.id) ?? { revenue: 0, orders: 0 }
    return {
      id: t.id,
      name: t.name,
      label: t.label,
      location: t.label,
      status: t.isActive ? ("online" as const) : ("offline" as const),
      cashier: "Unassigned",
      assignedCategories: settings.assignedCategories ?? [],
      todaySales: today.revenue,
      todayOrders: today.orders,
    }
  })

  const roots = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon ?? "grid",
    parentId: c.parentId,
    children: c.children.map((ch) => ({
      id: ch.id,
      name: ch.name,
      icon: ch.icon ?? "grid",
      parentId: ch.parentId,
    })),
  }))
  const selectable = categories.flatMap((c) =>
    [c, ...c.children].map((ch) => ({ id: ch.id, name: ch.name, icon: ch.icon ?? "grid" }))
  )
  const usersList = users.map((u) => ({ id: u.id, name: u.name, email: u.email, status: u.status }))

  return (
    <AdminDashboardClient
      initialTerminals={terminalList}
      categories={{ roots, selectable }}
      users={usersList}
      currency={currency}
      stats={{
        revenue: Number(stats.revenue) || 0,
        totalOrders: Number(stats.totalOrders) || 0,
        avgBasket: Number(stats.avgBasket) || 0,
        customerCount: Number(stats.customerCount) || 0,
        stockAlerts: Number(stats.stockAlerts) || 0,
      }}
    />
  )
}
