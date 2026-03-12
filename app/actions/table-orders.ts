"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireTenantId } from "@/lib/auth"
import { orderRepository } from "@/lib/repositories/order.repository"
import { establishmentRepository } from "@/lib/repositories/establishment.repository"
import { tableRepository } from "@/lib/repositories/table.repository"
import { terminalRepository } from "@/lib/repositories/terminal.repository"
import { storeRepository } from "@/lib/repositories/store.repository"
import { storeStockRepository } from "@/lib/repositories/store-stock.repository"
import { prisma } from "@/lib/db"

const submitTableOrderSchema = z.object({
  establishmentSlug: z.string().min(1),
  tableSlug: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        total: z.number().min(0),
      })
    )
    .min(1, "At least one item required"),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  orderLabel: z.string().nullable().optional(),
})

const submitEstablishmentOrderSchema = z.object({
  establishmentSlug: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        total: z.number().min(0),
      })
    )
    .min(1, "At least one item required"),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  orderLabel: z.string().min(1, "Nom de la table ou du client requis"),
})

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

/** Submit order from tablet (no auth). Creates Order with status PENDING, no stock movement. */
export async function submitTableOrder(
  data: z.infer<typeof submitTableOrderSchema>
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  try {
    const parsed = submitTableOrderSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }

    const resolved = await tableRepository.findByEstablishmentSlugAndTableSlug(
      parsed.data.establishmentSlug,
      parsed.data.tableSlug
    )
    if (!resolved) {
      return { success: false, error: "Table or establishment not found" }
    }

    const { table, establishment, terminal, tenantId } = resolved
    const total = parsed.data.subtotal + parsed.data.tax - (parsed.data.discount ?? 0)
    const orderNumber = await orderRepository.generateOrderNumber(tenantId)

    const order = await orderRepository.create(
      {
        orderNumber,
        terminalId: terminal.id,
        tableId: table.id,
        orderLabel: parsed.data.orderLabel ?? null,
        status: "PENDING",
        subtotal: parsed.data.subtotal,
        tax: parsed.data.tax,
        discount: parsed.data.discount ?? 0,
        total,
        paymentMethod: "TABLE",
        items: parsed.data.items,
      },
      tenantId
    )

    revalidatePath(`/pos/${terminal.id}`)
    revalidatePath("/admin/tablet")

    return { success: true, data: { orderId: order.id, orderNumber: order.orderNumber } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to submit table order" }
  }
}

/** Submit order from establishment tablet (no table in URL). orderLabel (table or client name) is required. */
export async function submitEstablishmentOrder(
  data: z.infer<typeof submitEstablishmentOrderSchema>
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  try {
    const parsed = submitEstablishmentOrderSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }

    const resolved = await establishmentRepository.findBySlugPublic(parsed.data.establishmentSlug)
    if (!resolved) {
      return { success: false, error: "Establishment not found" }
    }

    const { establishment, terminal, tenantId } = resolved
    const total = parsed.data.subtotal + parsed.data.tax - (parsed.data.discount ?? 0)
    const orderNumber = await orderRepository.generateOrderNumber(tenantId)

    const order = await orderRepository.create(
      {
        orderNumber,
        terminalId: terminal.id,
        tableId: null,
        orderLabel: parsed.data.orderLabel.trim(),
        status: "PENDING",
        subtotal: parsed.data.subtotal,
        tax: parsed.data.tax,
        discount: parsed.data.discount ?? 0,
        total,
        paymentMethod: "TABLE",
        items: parsed.data.items,
      },
      tenantId
    )

    revalidatePath(`/pos/${terminal.id}`)
    revalidatePath("/admin/tablet")

    return { success: true, data: { orderId: order.id, orderNumber: order.orderNumber } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to submit order" }
  }
}

const completeTableOrderSchema = z.object({
  orderId: z.string().min(1),
  paymentMethod: z.string().min(1),
  cashierName: z.string().nullable().optional(),
})

/** Complete a PENDING table order at POS: apply stock logic and set status COMPLETED. */
export async function completeTableOrder(
  data: z.infer<typeof completeTableOrderSchema>
): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = completeTableOrderSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }

    const order = await orderRepository.findById(parsed.data.orderId, tenantId)
    if (!order) return { success: false, error: "Order not found" }
    if (order.status !== "PENDING") {
      return { success: false, error: "Order is not pending" }
    }

    const terminal = await terminalRepository.findById(order.terminalId, tenantId)
    if (!terminal) return { success: false, error: "Terminal not found" }

    let storeId = terminal.storeId ?? null
    if (!storeId) {
      const central = await storeRepository.getCentral(tenantId)
      if (!central) return { success: false, error: "Terminal has no store and no central store configured" }
      storeId = central.id
    }

    const productIds = [...new Set(order.items.map((i) => i.productId))]
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
      select: { id: true, name: true, isService: true },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of order.items) {
      const product = productMap.get(item.productId)
      if (!product) return { success: false, error: `Product not found: ${item.productId}` }
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

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          paymentMethod: parsed.data.paymentMethod,
          cashierName: parsed.data.cashierName ?? null,
        },
      })

      for (const item of order.items) {
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
            reason: `Order ${order.orderNumber}`,
            fromStoreId: storeId!,
            fromLocation: order.terminalId,
          },
        })
      }
    })

    revalidatePath("/admin/analytics")
    revalidatePath("/admin/stock")
    revalidatePath(`/pos/${order.terminalId}`)
    revalidatePath("/admin/tablet")

    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to complete table order" }
  }
}
