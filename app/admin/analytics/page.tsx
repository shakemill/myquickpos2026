import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { analyticsRepository } from "@/lib/repositories/analytics.repository"
import { terminalRepository } from "@/lib/repositories/terminal.repository"
import { tenantRepository } from "@/lib/repositories/tenant.repository"
import { AnalyticsPageClient } from "./analytics-page-client"

export default async function AnalyticsPage() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const [revenueByDay, revenueByHour, revenueByCategory, revenueByPaymentMethod, topProducts, conversionByTerminal, summary, terminals, tenantSettings] =
    await Promise.all([
      analyticsRepository.revenueByDay(tenantId, 30),
      analyticsRepository.revenueByHour(tenantId),
      analyticsRepository.revenueByCategory(tenantId, 30),
      analyticsRepository.revenueByPaymentMethod(tenantId, 30),
      analyticsRepository.topProducts(tenantId, 10),
      analyticsRepository.conversionByTerminal(tenantId),
      analyticsRepository.dashboardSummary(tenantId),
      terminalRepository.findAll(tenantId),
      tenantRepository.getSettings(tenantId),
    ])
  const currency = tenantSettings?.currency ?? "USD"

  const CHART_FILLS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]
  const categorySalesWithFill = revenueByCategory.map((c, i) => ({ ...c, fill: CHART_FILLS[i % CHART_FILLS.length] }))
  const paymentWithFill = revenueByPaymentMethod.map((p, i) => ({ ...p, fill: CHART_FILLS[i % CHART_FILLS.length] }))

  const terminalConversion = conversionByTerminal.map((t) => {
    const orderCount = typeof t.orders === "number" ? t.orders : 0
    return {
      id: t.id,
      name: t.name,
      label: t.label,
      revenue: t.revenue,
      orders: orderCount,
      avgTicket: orderCount > 0 ? t.revenue / orderCount : 0,
      status: "online" as const,
    }
  })

  const topProductsForClient = topProducts.map((p) => ({
    product: { id: p.product.id, name: p.product.name, price: p.product.price, category: "", image: undefined },
    unitsSold: p.unitsSold,
    revenue: p.revenue,
  }))

  return (
    <AnalyticsPageClient
      currency={currency}
      serverData={{
        revenueByDay,
        revenueByHour,
        revenueByCategory: categorySalesWithFill,
        revenueByPaymentMethod: paymentWithFill,
        topProducts: topProductsForClient,
        conversionByTerminal: terminalConversion,
        summary: {
          revenue: summary.revenue,
          totalOrders: summary.totalOrders,
          avgBasket: summary.avgBasket,
          customerCount: summary.customerCount,
          stockAlerts: summary.stockAlerts,
        },
        terminalCount: terminals.length,
        activeTerminalCount: terminals.filter((t) => t.isActive).length,
      }}
    />
  )
}
