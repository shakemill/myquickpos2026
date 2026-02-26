import { prisma } from "@/lib/db"

export const storeRepository = {
  findAll: (tenantId: string) =>
    prisma.store.findMany({
      where: { tenantId },
      orderBy: [{ isCentral: "desc" }, { name: "asc" }],
    }),

  findById: (id: string, tenantId: string) =>
    prisma.store.findFirst({
      where: { id, tenantId },
    }),

  getCentral: async (tenantId: string) => {
    const store = await prisma.store.findFirst({
      where: { tenantId, isCentral: true },
    })
    return store
  },

  create: async (tenantId: string, data: { name: string; isCentral?: boolean }) => {
    if (data.isCentral) {
      const existing = await prisma.store.findFirst({
        where: { tenantId, isCentral: true },
      })
      if (existing) throw new Error("A central store already exists for this tenant")
    }
    return prisma.store.create({
      data: {
        tenantId,
        name: data.name,
        isCentral: data.isCentral ?? false,
      },
    })
  },

  update: async (
    id: string,
    tenantId: string,
    data: { name?: string; isCentral?: boolean }
  ) => {
    const store = await prisma.store.findFirst({ where: { id, tenantId } })
    if (!store) return null
    if (data.isCentral === true) {
      const existing = await prisma.store.findFirst({
        where: { tenantId, isCentral: true },
      })
      if (existing && existing.id !== id)
        throw new Error("A central store already exists for this tenant")
    }
    return prisma.store.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.isCentral != null && { isCentral: data.isCentral }),
      },
    })
  },

  delete: async (id: string, tenantId: string) => {
    const store = await prisma.store.findFirst({
      where: { id, tenantId },
    })
    if (!store) return
    if (store.isCentral) throw new Error("Cannot delete the central store")
    const terminals = await prisma.terminal.count({
      where: { storeId: id },
    })
    if (terminals > 0) throw new Error("Cannot delete a store that has terminals assigned")
    await prisma.store.delete({
      where: { id },
    })
  },
}
