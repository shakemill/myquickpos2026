"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireTenantId, requireRole } from "@/lib/auth"
import { userRepository } from "@/lib/repositories/user.repository"
import type { Role } from "@prisma/client"

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "CASHIER"]),
  status: z.enum(["active", "inactive"]).optional().default("active"),
})

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "CASHIER"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER"]

export async function createUser(formData: FormData): Promise<ActionResult> {
  try {
    await requireRole(ADMIN_ROLES)
    const tenantId = await requireTenantId()
    const parsed = createUserSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    const user = await userRepository.create(
      {
        ...parsed.data,
        role: parsed.data.role as Role,
        status: parsed.data.status,
      },
      tenantId
    )
    revalidatePath("/admin/users")
    return { success: true, data: user }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create user" }
  }
}

export async function updateUser(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireRole(ADMIN_ROLES)
    const tenantId = await requireTenantId()
    const parsed = updateUserSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    await userRepository.update(
      id,
      { ...parsed.data, role: parsed.data.role as Role | undefined },
      tenantId
    )
    revalidatePath("/admin/users")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update user" }
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    await requireRole(ADMIN_ROLES)
    const tenantId = await requireTenantId()
    await userRepository.delete(id, tenantId)
    revalidatePath("/admin/users")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete user" }
  }
}
