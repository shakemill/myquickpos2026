"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireTenantId } from "@/lib/auth"
import { orderRepository } from "@/lib/repositories/order.repository"
import { terminalRepository } from "@/lib/repositories/terminal.repository"
import { storeRepository } from "@/lib/repositories/store.repository"
import { storeStockRepository } from "@/lib/repositories/store-stock.repository"
import { prisma } from "@/lib/db"

const createOrderSchema = z.object({
  terminalId: z.string().min(1),
  customerId: z.string().nullable().optional(),
  paymentMethod: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      total: z.number().min(0),
    })
  ).min(1, "At least one item required"),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
})

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

export async function createOrder(data: z.infer<typeof createOrderSchema>): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = createOrderSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }

    const terminal = await terminalRepository.findById(parsed.data.terminalId, tenantId)
    if (!terminal) return { success: false, error: "Terminal not found" }
    let storeId = terminal.storeId ?? null
    if (!storeId) {
      const central = await storeRepository.getCentral(tenantId)
      if (!central) return { success: false, error: "Terminal has no store and no central store configured" }
      storeId = central.id
    }

    const productIds = [...new Set(parsed.data.items.map((i) => i.productId))]
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
      select: { id: true, name: true, isService: true },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))
    for (const item of parsed.data.items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return { success: false, error: `Product not found: ${item.productId}` }
      }
      if (product.isService) continue
      const available = await storeStockRepository.getByProductAndStore(
        tenantId,
        item.productId,
        storeId
      )
      if (available < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${available}`,
        }
      }
    }

    const total = parsed.data.subtotal + parsed.data.tax - (parsed.data.discount ?? 0)
    const orderNumber = await orderRepository.generateOrderNumber(tenantId)

    const cashierName = (terminal.settings as { cashier?: string } | null)?.cashier ?? null

    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          tenantId,
          terminalId: parsed.data.terminalId,
          customerId: parsed.data.customerId ?? null,
          status: "COMPLETED",
          subtotal: parsed.data.subtotal,
          tax: parsed.data.tax,
          discount: parsed.data.discount ?? 0,
          total,
          paymentMethod: parsed.data.paymentMethod,
          cashierName,
          items: {
            create: parsed.data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
        include: { items: { include: { product: true } }, customer: true },
      })

      for (const item of parsed.data.items) {
        const product = productMap.get(item.productId)
        if (product?.isService) continue
        const row = await tx.storeStock.findFirst({
          where: { storeId: storeId!, productId: item.productId },
        })
        const current = row?.quantity ?? 0
        if (current < item.quantity) throw new Error(`Insufficient stock for product ${item.productId}`)
        if (row) {
          await tx.storeStock.update({
            where: { storeId_productId: { storeId: storeId!, productId: item.productId } },
            data: { quantity: { decrement: item.quantity } },
          })
        }
        await tx.stockMovement.create({
          data: {
            tenantId,
            productId: item.productId,
            type: "OUT",
            quantity: -item.quantity,
            reason: `Order ${orderNumber}`,
            fromStoreId: storeId!,
            fromLocation: parsed.data.terminalId,
          },
        })
      }

      if (parsed.data.customerId) {
        const pointsPerEuro = 10
        const points = Math.floor(total * pointsPerEuro)
        await tx.customer.update({
          where: { id: parsed.data.customerId },
          data: {
            loyaltyPoints: { increment: points },
            totalSpent: { increment: total },
            visits: { increment: 1 },
            lastVisit: new Date(),
          },
        })
      }

      return order
    })

    revalidatePath("/admin/analytics")
    revalidatePath("/admin/stock")
    revalidatePath(`/pos/${parsed.data.terminalId}`)

    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      tenantId: order.tenantId,
      terminalId: order.terminalId,
      customerId: order.customerId,
      status: order.status,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              price: Number(item.product.price),
              category: item.product.categoryId,
            }
          : null,
      })),
      customer: order.customer
        ? {
            id: order.customer.id,
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone,
            loyaltyPoints: order.customer.loyaltyPoints,
            totalSpent: Number(order.customer.totalSpent ?? 0),
            loyaltyTier: order.customer.loyaltyTier,
          }
        : null,
    }
    return { success: true, data: orderData }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create order" }
  }
}
