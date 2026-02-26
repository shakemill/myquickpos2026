"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireTenantId } from "@/lib/auth"
import { productRepository } from "@/lib/repositories/product.repository"

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  cost: z.coerce.number().min(0).optional(),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.coerce.number().int().min(0).optional().default(0),
  minStock: z.coerce.number().int().min(0).optional().default(5),
  isService: z.preprocess(
    (v) => (v === "true" ? true : v === "false" ? false : undefined),
    z.boolean().optional().default(false)
  ),
})

const updateProductSchema = createProductSchema.partial()

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = createProductSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    const data = {
      name: parsed.data.name,
      sku: parsed.data.sku || `SKU-${Date.now()}`,
      price: parsed.data.price,
      cost: parsed.data.cost ?? parsed.data.price * 0.6,
      categoryId: parsed.data.categoryId,
      minStock: parsed.data.minStock,
      isService: parsed.data.isService ?? false,
    }
    const product = await productRepository.create(data, tenantId)
    revalidatePath("/admin/products")
    revalidatePath("/pos")
    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.categoryId,
        image: product.imageUrl ?? undefined,
      },
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create product" }
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = updateProductSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") }
    }
    const updateData: Parameters<typeof productRepository.update>[1] = { ...parsed.data }
    if (parsed.data.isService !== undefined) updateData.isService = parsed.data.isService
    await productRepository.update(id, updateData, tenantId)
    revalidatePath("/admin/products")
    revalidatePath("/pos")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update product" }
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const tenantId = await requireTenantId()
    await productRepository.delete(id, tenantId)
    revalidatePath("/admin/products")
    revalidatePath("/pos")
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete product" }
  }
}
