"use server"

import { revalidatePath } from "next/cache"
import { requireTenantId } from "@/lib/auth"
import { storeRepository } from "@/lib/repositories/store.repository"

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

export async function getStores() {
  const tenantId = await requireTenantId()
  return storeRepository.findAll(tenantId)
}

export async function createStore(name: string, isCentral: boolean): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    await storeRepository.create(tenantId, { name, isCentral })
    revalidatePath("/admin")
    revalidatePath("/admin/stores")
    revalidatePath("/admin/stock")
    revalidatePath("/admin/terminals")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create store" }
  }
}

export async function updateStore(
  id: string,
  data: { name?: string; isCentral?: boolean }
): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    await storeRepository.update(id, tenantId, data)
    revalidatePath("/admin")
    revalidatePath("/admin/stores")
    revalidatePath("/admin/stock")
    revalidatePath("/admin/terminals")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update store" }
  }
}

export async function deleteStore(id: string): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    await storeRepository.delete(id, tenantId)
    revalidatePath("/admin")
    revalidatePath("/admin/stores")
    revalidatePath("/admin/stock")
    revalidatePath("/admin/terminals")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete store" }
  }
}
