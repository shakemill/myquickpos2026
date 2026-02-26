import { prisma } from "@/lib/db"
import type { OrderStatus } from "@prisma/client"

export interface CreateOrderDto {
  orderNumber: string
  terminalId: string
  customerId?: string | null
  subtotal: number
  tax: number
  discount?: number
  total: number
  paymentMethod: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
    total: number
  }[]
}

export interface OrderFilters {
  status?: OrderStatus
  terminalId?: string
  from?: Date
  to?: Date
  take?: number
}

export const orderRepository = {
  findById: (id: string, tenantId: string) =>
    prisma.order.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, customer: true, terminal: true },
    }),

  findMany: (tenantId: string, filters?: OrderFilters) => {
    const where: Parameters<typeof prisma.order.findMany>[0]["where"] = { tenantId }
    if (filters?.status) where.status = filters.status
    if (filters?.terminalId) where.terminalId = filters.terminalId
    if (filters?.from || filters?.to) {
      where.createdAt = {}
      if (filters.from) where.createdAt.gte = filters.from
      if (filters.to) where.createdAt.lte = filters.to
    }
    return prisma.order.findMany({
      where,
      take: filters?.take ?? 200,
      include: { items: true, terminal: true, customer: true },
      orderBy: { createdAt: "desc" },
    })
  },

  create: (data: CreateOrderDto, tenantId: string) =>
    prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        tenantId,
        terminalId: data.terminalId,
        customerId: data.customerId ?? null,
        status: "COMPLETED",
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount ?? 0,
        total: data.total,
        paymentMethod: data.paymentMethod,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: { include: { product: true } }, customer: true },
    }),

  generateOrderNumber: async (tenantId: string) => {
    const last = await prisma.order.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true },
    })
    const num = last ? parseInt(last.orderNumber.replace(/\D/g, ""), 10) + 1 : 1000
    return `ORD-${num}`
  },
}
