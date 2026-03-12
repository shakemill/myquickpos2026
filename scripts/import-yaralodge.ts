#!/usr/bin/env tsx
/**
 * Import yaralodge data from import.sql into tenant cmm3bmydp00005hnea4s561m0.
 * Excludes category "The BABY'S (SPA, beauty and care)" (id 36) and its products.
 *
 * Run: pnpm run db:import-yaralodge
 */

import { readFileSync } from "fs"
import path from "path"
import { prisma } from "@/lib/db"
import { categoryRepository } from "@/lib/repositories/category.repository"
import { storeRepository } from "@/lib/repositories/store.repository"

const TENANT_ID = "cmm3bmydp00005hnea4s561m0"
const EXCLUDED_CATEGORY_ID = 36


interface ImportCategory {
  id: number
  name: string
}

interface ImportProduct {
  id: number
  categorieId: number
  name: string
  price: number
  stockQuantity: number
}

function parseCategories(sql: string): ImportCategory[] {
  const categories: ImportCategory[] = []
  const block = sql.match(
    /INSERT INTO `categories`[^;]+VALUES\s*([\s\S]+?);/
  )?.[1]
  if (!block) return categories

  const rowRegex = /\((\d+),\s*'((?:[^'\\]|\\'|'')*)'/g
  let m
  while ((m = rowRegex.exec(block)) !== null) {
    const id = parseInt(m[1], 10)
    if (id === EXCLUDED_CATEGORY_ID) continue
    const name = m[2].replace(/''/g, "'").replace(/\\'/g, "'")
    categories.push({ id, name })
  }
  return categories
}

function parseProducts(sql: string): ImportProduct[] {
  const products: ImportProduct[] = []
  const block = sql.match(
    /INSERT INTO `products`[^;]+VALUES\s*([\s\S]+?);/
  )?.[1]
  if (!block) return products

  const rowRegex =
    /\((\d+),\s*(\d+),\s*'((?:[^'\\]|\\'|'')*)',\s*(?:'[^']*'|NULL),\s*(\d+(?:\.\d+)?),\s*(\d+),/g
  let m
  while ((m = rowRegex.exec(block)) !== null) {
    const categorieId = parseInt(m[2], 10)
    if (categorieId === EXCLUDED_CATEGORY_ID) continue
    const name = m[3].replace(/''/g, "'").replace(/\\'/g, "'")
    const price = parseFloat(m[4])
    const stockQuantity = parseInt(m[5], 10)
    products.push({
      id: parseInt(m[1], 10),
      categorieId,
      name,
      price,
      stockQuantity,
    })
  }
  return products
}

async function main() {
  console.log("Import yaralodge -> tenant", TENANT_ID)
  console.log("Excluding category", EXCLUDED_CATEGORY_ID, "(The BABY'S SPA, beauty and care)\n")

  const tenant = await prisma.tenant.findUnique({
    where: { id: TENANT_ID },
  })
  if (!tenant) {
    console.error("Error: Tenant", TENANT_ID, "does not exist.")
    console.error("Create the tenant before running this import.")
    process.exit(1)
  }

  const sqlPath = path.join(process.cwd(), "import.sql")
  let sql: string
  try {
    sql = readFileSync(sqlPath, "utf-8")
  } catch (e) {
    console.error("Error: Cannot read import.sql at", sqlPath)
    process.exit(1)
  }

  const categories = parseCategories(sql)
  const products = parseProducts(sql)

  console.log("Parsed:", categories.length, "categories,", products.length, "products")

  const categoryIdMap = new Map<number, string>()

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { tenantId: TENANT_ID, name: cat.name },
    })
    if (existing) {
      categoryIdMap.set(cat.id, existing.id)
    } else {
      const created = await categoryRepository.create(
        { name: cat.name, icon: "grid", type: "product" },
        TENANT_ID
      )
      categoryIdMap.set(cat.id, created.id)
    }
  }
  console.log("Upserted", categories.length, "categories")

  const productIdMap = new Map<number, string>()
  for (const prod of products) {
    const categoryId = categoryIdMap.get(prod.categorieId)
    if (!categoryId) {
      console.warn("Product", prod.id, prod.name, ": category", prod.categorieId, "not found, skipping")
      continue
    }
    const sku = `IMP-${prod.id}`
    const created = await prisma.product.upsert({
      where: { sku_tenantId: { sku, tenantId: TENANT_ID } },
      create: {
        name: prod.name,
        sku,
        price: prod.price,
        cost: prod.price,
        categoryId,
        minStock: 5,
        isService: false,
        tenantId: TENANT_ID,
      },
      update: {
        name: prod.name,
        price: prod.price,
        cost: prod.price,
        categoryId,
      },
    })
    productIdMap.set(prod.id, created.id)
  }
  console.log("Upserted", products.length, "products")

  const central = await storeRepository.getCentral(TENANT_ID)
  if (central) {
    let stockCount = 0
    for (const prod of products) {
      const productId = productIdMap.get(prod.id)
      if (!productId) continue
      await prisma.storeStock.upsert({
        where: { storeId_productId: { storeId: central.id, productId } },
        create: { storeId: central.id, productId, quantity: prod.stockQuantity },
        update: { quantity: prod.stockQuantity },
      })
      stockCount++
    }
    console.log("Upserted StoreStock for", stockCount, "products in central store")
  } else {
    console.log("No central store found for tenant, skipping StoreStock")
  }

  console.log("\nImport complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
