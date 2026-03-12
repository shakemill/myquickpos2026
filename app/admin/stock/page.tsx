import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { tenantRepository } from "@/lib/repositories/tenant.repository"
import { productRepository } from "@/lib/repositories/product.repository"
import { stockRepository } from "@/lib/repositories/stock.repository"
import { storeRepository } from "@/lib/repositories/store.repository"
import { storeStockRepository } from "@/lib/repositories/store-stock.repository"
import { categoryRepository } from "@/lib/repositories/category.repository"
import { StockPageClient } from "./stock-page-client"

export default async function StockPage() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const [tenantSettings, products, movements, categories, stores, aggregatedStock, stockByProductAndStore] =
    await Promise.all([
      tenantRepository.getSettings(tenantId),
      productRepository.findAll(tenantId, { isService: false }),
      stockRepository.getMovements(tenantId, undefined, undefined, 200),
      categoryRepository.findAll(tenantId),
      storeRepository.findAll(tenantId),
      storeStockRepository.getAggregatedByProduct(tenantId),
      storeStockRepository.getAllByProductAndStore(tenantId),
    ])

  const productList = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    cost: Number(p.cost),
    category: p.categoryId,
    image: p.imageUrl ?? undefined,
    stock: aggregatedStock.get(p.id) ?? 0,
    stockByStore: stockByProductAndStore.get(p.id) ?? {},
    minStock: p.minStock,
  }))

  const categoryMap = new Map(
    categories.map((c) => [
      c.id,
      { id: c.id, name: c.name, icon: c.icon, parentId: c.parentId ?? null },
    ])
  )

  const movementList = movements
    .filter((m) => !m.product.isService)
    .map((m) => ({
    id: m.id,
    type: m.type,
    productId: m.productId,
    productName: m.product.name,
    quantity: m.quantity,
    reason: m.reason ?? "",
    fromLocation: m.fromLocation ?? undefined,
    toLocation: m.toLocation ?? undefined,
    fromStoreName: m.fromStore?.name ?? undefined,
    toStoreName: m.toStore?.name ?? undefined,
    date: m.createdAt.toISOString(),
  }))

  const storeList = stores.map((s) => ({ id: s.id, name: s.name, isCentral: s.isCentral }))
  const centralStore = stores.find((s) => s.isCentral)

  const lowCount = productList.filter((p) => p.stock > 0 && p.stock <= p.minStock).length
  const outCount = productList.filter((p) => p.stock <= 0).length
  const totalUnits = productList.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = productList.reduce((sum, p) => sum + p.stock * Number(p.cost), 0)

  const currency = tenantSettings?.currency ?? "USD"

  return (
    <StockPageClient
      currency={currency}
      products={productList}
      categories={categoryMap}
      movements={movementList}
      stores={storeList}
      centralStoreId={centralStore?.id ?? null}
      kpis={{
        totalSkus: products.length,
        totalUnits,
        lowCount,
        outCount,
        totalValue,
      }}
    />
  )
}
