import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { tenantRepository } from "@/lib/repositories/tenant.repository"
import { productRepository } from "@/lib/repositories/product.repository"
import { categoryRepository } from "@/lib/repositories/category.repository"
import { ProductsPageClient } from "./products-page-client"

export default async function ProductsPage() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const [tenantSettings, products, services, categories] = await Promise.all([
    tenantRepository.getSettings(tenantId),
    productRepository.findAll(tenantId, { isService: false }),
    productRepository.findAll(tenantId, { isService: true }),
    categoryRepository.findAll(tenantId),
  ])

  const categoryList = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon ?? "grid",
    parentId: c.parentId,
    type: (c.type ?? "product") as "product" | "service",
  }))

  const productList = products.map((p: { id: string; name: string; price: number; category: string; image?: string }) => ({
    id: p.id,
    name: p.name,
    price: typeof p.price === "number" ? p.price : Number(p.price),
    category: p.category,
    image: p.image,
  }))

  const serviceList = services.map((p: { id: string; name: string; price: number; category: string; image?: string }) => ({
    id: p.id,
    name: p.name,
    price: typeof p.price === "number" ? p.price : Number(p.price),
    category: p.category,
    image: p.image,
  }))

  const currency = tenantSettings?.currency ?? "USD"

  return (
    <ProductsPageClient
      currency={currency}
      initialProducts={productList}
      initialServices={serviceList}
      initialCategories={categoryList}
    />
  )
}
