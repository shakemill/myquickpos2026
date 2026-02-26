"use server"

import { z } from "zod"
import { requireTenantId } from "@/lib/auth"
import { savedCartRepository, type SavedCartItem } from "@/lib/repositories/saved-cart.repository"

const saveCartSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  terminalId: z.string().nullable().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "At least one item required"),
})

export type SavedCartActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function saveCart(data: z.infer<typeof saveCartSchema>): Promise<SavedCartActionResult<{ id: string }>> {
  try {
    const tenantId = await requireTenantId()
    const parsed = saveCartSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    const cart = await savedCartRepository.create(tenantId, {
      name: parsed.data.name,
      terminalId: parsed.data.terminalId,
      items: parsed.data.items,
    })
    return { success: true, data: { id: cart.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save cart" }
  }
}

export async function listSavedCarts(terminalId?: string | null): Promise<
  SavedCartActionResult<{ id: string; name: string; updatedAt: Date; itemCount: number }[]>
> {
  try {
    const tenantId = await requireTenantId()
    const list = await savedCartRepository.findByTenant(tenantId, terminalId)
    const items = list.map((c) => {
      const arr = (c.items as SavedCartItem[]) ?? []
      const itemCount = arr.reduce((sum, i) => sum + i.quantity, 0)
      return { id: c.id, name: c.name, updatedAt: c.updatedAt, itemCount }
    })
    return { success: true, data: items }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to list saved carts" }
  }
}

export async function getSavedCart(id: string): Promise<
  SavedCartActionResult<{ id: string; name: string; items: SavedCartItem[] }>
> {
  try {
    const tenantId = await requireTenantId()
    const cart = await savedCartRepository.findById(id, tenantId)
    if (!cart) return { success: false, error: "Saved cart not found" }
    const items = (cart.items as SavedCartItem[]) ?? []
    return { success: true, data: { id: cart.id, name: cart.name, items } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to get saved cart" }
  }
}

const updateSavedCartSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1).optional(),
})

export async function updateSavedCart(
  data: z.infer<typeof updateSavedCartSchema>
): Promise<SavedCartActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = updateSavedCartSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    await savedCartRepository.update(parsed.data.id, tenantId, {
      name: parsed.data.name,
      items: parsed.data.items,
    })
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update saved cart" }
  }
}

export async function deleteSavedCart(id: string): Promise<SavedCartActionResult> {
  try {
    const tenantId = await requireTenantId()
    await savedCartRepository.delete(id, tenantId)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete saved cart" }
  }
}
