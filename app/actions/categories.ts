"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireTenantId } from "@/lib/auth"
import { categoryRepository } from "@/lib/repositories/category.repository"

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().optional(),
  parentId: z.preprocess((v) => (v === "" || v === undefined ? null : v), z.string().nullable()),
  type: z.enum(["product", "service"]).optional().default("product"),
})

const updateCategorySchema = createCategorySchema.partial()

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

export async function createCategory(formData: FormData): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = createCategorySchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    const category = await categoryRepository.create(
      {
        name: parsed.data.name,
        icon: parsed.data.icon,
        color: undefined,
        parentId: parsed.data.parentId ?? undefined,
        type: parsed.data.type ?? "product",
      },
      tenantId
    )
    revalidatePath("/admin/products")
    revalidatePath("/pos")
    return { success: true, data: category }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create category" }
  }
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = updateCategorySchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    const updateData: Parameters<typeof categoryRepository.update>[1] = {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.icon !== undefined && { icon: parsed.data.icon }),
      ...(parsed.data.parentId !== undefined && { parentId: parsed.data.parentId }),
      ...(parsed.data.type !== undefined && { type: parsed.data.type }),
    }
    await categoryRepository.update(id, updateData, tenantId)
    revalidatePath("/admin/products")
    revalidatePath("/pos")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update category" }
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    await categoryRepository.delete(id, tenantId)
    revalidatePath("/admin/products")
    revalidatePath("/pos")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete category" }
  }
}
