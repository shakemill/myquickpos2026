#!/usr/bin/env tsx
/**
 * Set stock of all products to 100 in the central store for each tenant.
 * Run: pnpm run db:set-stock-100
 */

import { prisma } from "@/lib/db"

const TARGET_QUANTITY = 100

async function main() {
  const tenants = await prisma.tenant.findMany({ select: { id: true } })
  let totalUpdated = 0

  for (const tenant of tenants) {
    const central = await prisma.store.findFirst({
      where: { tenantId: tenant.id, isCentral: true },
    })
    if (!central) {
      console.log("Tenant", tenant.id, ": no central store, skipping")
      continue
    }

    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id, isActive: true, isService: false },
      select: { id: true },
    })

    for (const product of products) {
      await prisma.storeStock.upsert({
        where: {
          storeId_productId: { storeId: central.id, productId: product.id },
        },
        create: { storeId: central.id, productId: product.id, quantity: TARGET_QUANTITY },
        update: { quantity: TARGET_QUANTITY },
      })
      totalUpdated++
    }
    console.log("Tenant", tenant.id, ": set stock to", TARGET_QUANTITY, "for", products.length, "products")
  }

  console.log("\nDone. Total products updated:", totalUpdated)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
