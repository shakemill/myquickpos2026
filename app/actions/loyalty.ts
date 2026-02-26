"use server"

import { revalidatePath } from "next/cache"
import { requireTenantId } from "@/lib/auth"
import { loyaltyRepository } from "@/lib/repositories/loyalty.repository"

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

export async function updateLoyalty(data: {
  pointsPerEuro?: number
  tiers?: unknown
  rewards?: unknown
  isActive?: boolean
}): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    await loyaltyRepository.update(tenantId, data)
    revalidatePath("/admin/loyalty")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update loyalty program" }
  }
}
