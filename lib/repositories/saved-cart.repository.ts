import { prisma } from "@/lib/db"

export type SavedCartItem = { productId: string; quantity: number }

export const savedCartRepository = {
  create: (tenantId: string, data: { name: string; terminalId?: string | null; items: SavedCartItem[] }) =>
    prisma.savedCart.create({
      data: {
        tenantId,
        terminalId: data.terminalId ?? null,
        name: data.name.trim(),
        items: data.items,
      },
    }),

  findByTenant: (tenantId: string, terminalId?: string | null) =>
    prisma.savedCart.findMany({
      where: {
        tenantId,
        ...(terminalId != null && terminalId !== "" ? { terminalId } : {}),
      },
      orderBy: { updatedAt: "desc" },
    }),

  findById: (id: string, tenantId: string) =>
    prisma.savedCart.findFirst({
      where: { id, tenantId },
    }),

  update: async (id: string, tenantId: string, data: { name?: string; items?: SavedCartItem[] }) => {
    await prisma.savedCart.updateMany({
      where: { id, tenantId },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.items !== undefined && { items: data.items }),
      },
    })
    return prisma.savedCart.findFirstOrThrow({ where: { id, tenantId } })
  },

  delete: (id: string, tenantId: string) =>
    prisma.savedCart.deleteMany({
      where: { id, tenantId },
    }),
}
