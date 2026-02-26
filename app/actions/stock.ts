"use server"

import { revalidatePath } from "next/cache"
import { requireTenantId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { stockRepository } from "@/lib/repositories/stock.repository"
import { storeRepository } from "@/lib/repositories/store.repository"
import { storeStockRepository } from "@/lib/repositories/store-stock.repository"

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

async function ensureProductNotService(productId: string, tenantId: string): Promise<ActionResult<null>> {
  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
    select: { isService: true },
  })
  if (!product) return { success: false, error: "Product not found" }
  if (product.isService) return { success: false, error: "Stock operations are not allowed for services" }
  return { success: true, data: null }
}

export async function addRestock(
  productId: string,
  quantity: number,
  reason: string
): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const check = await ensureProductNotService(productId, tenantId)
    if (!check.success) return check
    const central = await storeRepository.getCentral(tenantId)
    if (!central) return { success: false, error: "No central store configured" }
    await storeStockRepository.increment(central.id, productId, quantity)
    await stockRepository.addMovement(tenantId, productId, "IN", quantity, reason || "Restock", {
      toStoreId: central.id,
      toLocation: "central-warehouse",
    })
    revalidatePath("/admin/stock")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to add restock" }
  }
}

export async function addTransfer(
  fromStoreId: string,
  toStoreId: string,
  productId: string,
  quantity: number
): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const check = await ensureProductNotService(productId, tenantId)
    if (!check.success) return check
    const result = await storeStockRepository.transfer(
      tenantId,
      fromStoreId,
      toStoreId,
      productId,
      quantity
    )
    if (!result.ok) return { success: false, error: result.message ?? "Transfer failed" }
    revalidatePath("/admin/stock")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to transfer" }
  }
}

export async function addTransferBatch(
  fromStoreId: string,
  toStoreId: string,
  items: { productId: string; quantity: number }[]
): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const valid = items.filter((it) => it.productId && it.quantity > 0)
    if (valid.length === 0) return { success: false, error: "Add at least one product with quantity" }
    for (const it of valid) {
      const check = await ensureProductNotService(it.productId, tenantId)
      if (!check.success) return check
      const result = await storeStockRepository.transfer(
        tenantId,
        fromStoreId,
        toStoreId,
        it.productId,
        it.quantity
      )
      if (!result.ok) return { success: false, error: result.message ?? "Transfer failed" }
    }
    revalidatePath("/admin/stock")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to transfer" }
  }
}

export async function addQuickDelta(
  productId: string,
  storeId: string,
  delta: number,
  reason: string
): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const current = await storeStockRepository.getByProductAndStore(tenantId, productId, storeId)
    const newCount = current + delta
    if (newCount < 0) return { success: false, error: "Stock cannot go negative" }
    return addAdjustment(productId, storeId, newCount, reason)
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" }
  }
}

export async function addAdjustment(
  productId: string,
  storeId: string,
  newCount: number,
  reason: string
): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const check = await ensureProductNotService(productId, tenantId)
    if (!check.success) return check
    const current = await storeStockRepository.getByProductAndStore(tenantId, productId, storeId)
    const diff = newCount - current
    if (diff === 0) {
      revalidatePath("/admin/stock")
      return { success: true, data: null }
    }
    if (diff > 0) {
      await storeStockRepository.increment(storeId, productId, diff)
      await stockRepository.addMovement(tenantId, productId, "ADJUSTMENT", diff, reason || "Adjustment", {
        toStoreId: storeId,
      })
    } else {
      const result = await storeStockRepository.decrement(storeId, productId, -diff)
      if (!result.ok) return { success: false, error: "Insufficient stock for adjustment" }
      await stockRepository.addMovement(tenantId, productId, "ADJUSTMENT", diff, reason || "Adjustment", {
        fromStoreId: storeId,
      })
    }
    revalidatePath("/admin/stock")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to add adjustment" }
  }
}
