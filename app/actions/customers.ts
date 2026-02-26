"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireTenantId } from "@/lib/auth"
import { customerRepository } from "@/lib/repositories/customer.repository"

const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const updateCustomerSchema = createCustomerSchema.partial()

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = createCustomerSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    const data = { ...parsed.data, email: parsed.data.email || undefined }
    const customer = await customerRepository.create(data, tenantId)
    revalidatePath("/admin/customers")
    return {
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        address: customer.address ?? undefined,
        loyaltyPoints: customer.loyaltyPoints,
        totalSpent: customer.totalSpent != null ? Number(customer.totalSpent) : 0,
        visits: customer.visits,
        tier: customer.loyaltyTier,
        joinedDate: customer.createdAt?.toISOString().split("T")[0] ?? "",
        lastVisit: customer.lastVisit?.toISOString().split("T")[0] ?? "",
      },
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create customer" }
  }
}

export async function updateCustomer(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = updateCustomerSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    const data = { ...parsed.data, email: parsed.data.email || undefined }
    await customerRepository.update(id, data, tenantId)
    revalidatePath("/admin/customers")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update customer" }
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    await customerRepository.delete(id, tenantId)
    revalidatePath("/admin/customers")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete customer" }
  }
}
