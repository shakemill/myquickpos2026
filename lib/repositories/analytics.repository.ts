import { prisma } from "@/lib/db"

export const analyticsRepository = {
  revenueByDay: async (tenantId: string, days: number) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: from },
      },
      select: { total: true, createdAt: true },
    })
    const byDay = new Map<string, { revenue: number; orders: number }>()
    for (const o of orders) {
      const d = o.createdAt.toISOString().slice(0, 10)
      const prev = byDay.get(d) ?? { revenue: 0, orders: 0 }
      prev.revenue += Number(o.total)
      prev.orders += 1
      byDay.set(d, prev)
    }
    return Array.from(byDay.entries())
      .map(([day, v]) => ({ day, revenue: v.revenue, orders: v.orders, avgTicket: v.orders ? v.revenue / v.orders : 0 }))
      .sort((a, b) => a.day.localeCompare(b.day))
  },

  revenueByHour: async (tenantId: string) => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { total: true, createdAt: true },
    })
    const byHour = new Map<number, { revenue: number; orders: number }>()
    for (let h = 0; h < 24; h++) byHour.set(h, { revenue: 0, orders: 0 })
    for (const o of orders) {
      const h = o.createdAt.getHours()
      const prev = byHour.get(h) ?? { revenue: 0, orders: 0 }
      prev.revenue += Number(o.total)
      prev.orders += 1
      byHour.set(h, prev)
    }
    const labels = Array.from({ length: 24 }, (_, i) =>
      i < 12 ? `${i === 0 ? 12 : i}AM` : i === 12 ? "12PM" : `${i - 12}PM`
    )
    return labels.map((hour, i) => {
      const v = byHour.get(i) ?? { revenue: 0, orders: 0 }
      return { hour, revenue: v.revenue, orders: v.orders }
    })
  },

  revenueByMonth: async (tenantId: string, year: number) => {
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31, 23, 59, 59, 999)
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: start, lte: end },
      },
      select: { total: true, createdAt: true },
    })
    const byMonth = new Map<number, { revenue: number; orders: number }>()
    for (let m = 0; m < 12; m++) byMonth.set(m, { revenue: 0, orders: 0 })
    for (const o of orders) {
      const m = o.createdAt.getMonth()
      const prev = byMonth.get(m) ?? { revenue: 0, orders: 0 }
      prev.revenue += Number(o.total)
      prev.orders += 1
      byMonth.set(m, prev)
    }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return monthNames.map((month, i) => {
      const v = byMonth.get(i) ?? { revenue: 0, orders: 0 }
      return {
        month,
        revenue: v.revenue,
        orders: v.orders,
        avgTicket: v.orders ? v.revenue / v.orders : 0,
      }
    })
  },

  topProducts: async (tenantId: string, limit: number) => {
    const items = await prisma.orderItem.findMany({
      where: { order: { tenantId, status: "COMPLETED" } },
      include: { product: true },
    })
    const agg = new Map<
      string,
      { product: { id: string; name: string; price: unknown }; unitsSold: number; revenue: number }
    >()
    for (const item of items) {
      const pid = item.productId
      const prev = agg.get(pid)
      const revenue = Number(item.total)
      const unitsSold = item.quantity
      if (prev) {
        prev.unitsSold += unitsSold
        prev.revenue += revenue
      } else {
        agg.set(pid, { product: item.product, unitsSold, revenue })
      }
    }
    return Array.from(agg.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map((p) => ({
        product: { id: p.product.id, name: p.product.name, price: Number(p.product.price) },
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      }))
  },

  /** Today's revenue and order count per terminal (for dashboard/terminal cards) */
  todayStatsByTerminal: async (tenantId: string) => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const orders = await prisma.order.groupBy({
      by: ["terminalId"],
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: startOfDay },
      },
      _sum: { total: true },
      _count: true,
    })
    return orders.map((o) => ({
      terminalId: o.terminalId,
      revenue: Number(o._sum.total ?? 0),
      orders: o._count,
    }))
  },

  conversionByTerminal: async (tenantId: string) => {
    const terminals = await prisma.terminal.findMany({
      where: { tenantId },
      include: { _count: { select: { orders: true } } },
    })
    const orders = await prisma.order.groupBy({
      by: ["terminalId"],
      where: { tenantId, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    })
    const ordersMap = new Map(orders.map((o) => [o.terminalId, { count: o._count, revenue: Number(o._sum.total ?? 0) }]))
    return terminals.map((t) => ({
      id: t.id,
      name: t.name,
      label: t.label,
      orders: ordersMap.get(t.id)?.count ?? 0,
      revenue: ordersMap.get(t.id)?.revenue ?? 0,
    }))
  },

  revenueByCategory: async (tenantId: string, days: number = 30) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    const items = await prisma.orderItem.findMany({
      where: { order: { tenantId, status: "COMPLETED", createdAt: { gte: from } } },
      include: { product: { select: { categoryId: true } } },
    })
    const byCategory = new Map<string, { revenue: number; orders: number }>()
    for (const item of items) {
      const cid = item.product.categoryId
      const prev = byCategory.get(cid) ?? { revenue: 0, orders: 0 }
      prev.revenue += Number(item.total)
      prev.orders += 1
      byCategory.set(cid, prev)
    }
    const categoryIds = Array.from(byCategory.keys())
    if (categoryIds.length === 0) return []
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds }, tenantId },
      select: { id: true, name: true },
    })
    const nameById = new Map(categories.map((c) => [c.id, c.name]))
    return Array.from(byCategory.entries())
      .map(([id, v]) => ({ name: nameById.get(id) ?? id, revenue: v.revenue, orders: v.orders }))
      .sort((a, b) => b.revenue - a.revenue)
  },

  revenueByPaymentMethod: async (tenantId: string, days: number = 30) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    const orders = await prisma.order.findMany({
      where: { tenantId, status: "COMPLETED", createdAt: { gte: from } },
      select: { total: true, paymentMethod: true },
    })
    const byMethod = new Map<string, { amount: number; count: number }>()
    for (const o of orders) {
      const m = o.paymentMethod?.trim() || "Other"
      const prev = byMethod.get(m) ?? { amount: 0, count: 0 }
      prev.amount += Number(o.total)
      prev.count += 1
      byMethod.set(m, prev)
    }
    return Array.from(byMethod.entries())
      .map(([method, v]) => ({ method, amount: v.amount, count: v.count }))
      .sort((a, b) => b.amount - a.amount)
  },

  dashboardSummary: async (tenantId: string) => {
    const from = new Date()
    from.setDate(from.getDate() - 30)
    const [orderCount, orderSum, customerCount, lowStockIds] = await Promise.all([
      prisma.order.count({
        where: { tenantId, status: "COMPLETED", createdAt: { gte: from } },
      }),
      prisma.order.aggregate({
        where: { tenantId, status: "COMPLETED", createdAt: { gte: from } },
        _sum: { total: true },
      }),
      prisma.customer.count({ where: { tenantId } }),
      import("@/lib/repositories/product.repository").then(({ productRepository }) =>
        productRepository.getLowStockProductIds(tenantId)
      ),
    ])
    const lowStock = lowStockIds.size
    const revenue = Number(orderSum._sum.total ?? 0)
    const avgBasket = orderCount ? revenue / orderCount : 0
    return {
      totalOrders: orderCount,
      revenue,
      avgBasket,
      customerCount,
      stockAlerts: lowStock,
    }
  },

  stockAlerts: async (tenantId: string) => {
    const { productRepository } = await import("@/lib/repositories/product.repository")
    return productRepository.getLowStock(tenantId)
  },
}
