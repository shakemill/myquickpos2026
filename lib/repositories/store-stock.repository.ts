import { prisma } from "@/lib/db"

export const storeStockRepository = {
  getByStore: (tenantId: string, storeId: string) =>
    prisma.storeStock.findMany({
      where: {
        storeId,
        store: { tenantId },
      },
      include: { product: true },
      orderBy: { product: { name: "asc" } },
    }),

  getAggregatedByProduct: async (tenantId: string): Promise<Map<string, number>> => {
    const rows = await prisma.storeStock.findMany({
      where: { store: { tenantId } },
      select: { productId: true, quantity: true },
    })
    const map = new Map<string, number>()
    for (const r of rows) {
      map.set(r.productId, (map.get(r.productId) ?? 0) + r.quantity)
    }
    return map
  },

  /** productId -> storeId -> quantity, for filtering inventory by store */
  getAllByProductAndStore: async (
    tenantId: string
  ): Promise<Map<string, Record<string, number>>> => {
    const rows = await prisma.storeStock.findMany({
      where: { store: { tenantId } },
      select: { productId: true, storeId: true, quantity: true },
    })
    const map = new Map<string, Record<string, number>>()
    for (const r of rows) {
      let byStore = map.get(r.productId)
      if (!byStore) {
        byStore = {}
        map.set(r.productId, byStore)
      }
      byStore[r.storeId] = r.quantity
    }
    return map
  },

  getByProductAndStore: async (tenantId: string, productId: string, storeId: string) => {
    const row = await prisma.storeStock.findFirst({
      where: {
        storeId,
        productId,
        store: { tenantId },
      },
    })
    return row?.quantity ?? 0
  },

  increment: async (storeId: string, productId: string, quantity: number) => {
    await prisma.storeStock.upsert({
      where: {
        storeId_productId: { storeId, productId },
      },
      create: { storeId, productId, quantity },
      update: { quantity: { increment: quantity } },
    })
  },

  decrement: async (
    storeId: string,
    productId: string,
    quantity: number
  ): Promise<{ ok: boolean; currentQuantity: number }> => {
    const row = await prisma.storeStock.findFirst({
      where: { storeId, productId },
    })
    const current = row?.quantity ?? 0
    if (current < quantity)
      return { ok: false, currentQuantity: current }
    if (!row) return { ok: false, currentQuantity: 0 }
    await prisma.storeStock.update({
      where: { storeId_productId: { storeId, productId } },
      data: { quantity: { decrement: quantity } },
    })
    return { ok: true, currentQuantity: current }
  },

  transfer: async (
    tenantId: string,
    fromStoreId: string,
    toStoreId: string,
    productId: string,
    quantity: number
  ): Promise<{ ok: boolean; message?: string }> => {
    if (fromStoreId === toStoreId) return { ok: false, message: "Source and destination must differ" }
    const fromRow = await prisma.storeStock.findFirst({
      where: { storeId: fromStoreId, productId, store: { tenantId } },
    })
    const current = fromRow?.quantity ?? 0
    if (current < quantity) return { ok: false, message: `Insufficient stock (${current} available)` }
    await prisma.$transaction(async (tx) => {
      await tx.storeStock.update({
        where: { storeId_productId: { storeId: fromStoreId, productId } },
        data: { quantity: { decrement: quantity } },
      })
      await tx.storeStock.upsert({
        where: { storeId_productId: { storeId: toStoreId, productId } },
        create: { storeId: toStoreId, productId, quantity },
        update: { quantity: { increment: quantity } },
      })
      await tx.stockMovement.create({
        data: {
          tenantId,
          productId,
          type: "OUT",
          quantity: -quantity,
          reason: "Transfer",
          fromStoreId,
          toStoreId,
        },
      })
    })
    return { ok: true }
  },
}
