import { prisma } from "@/lib/db"

export interface CreateTableDto {
  name: string
  slug: string
  establishmentId: string
}

export interface UpdateTableDto {
  name?: string
  slug?: string
  establishmentId?: string
}

export const tableRepository = {
  findAll: (tenantId: string) =>
    prisma.table.findMany({
      where: { tenantId },
      include: { establishment: { include: { terminal: true } } },
      orderBy: { name: "asc" },
    }),

  findByEstablishment: (establishmentId: string, tenantId: string) =>
    prisma.table.findMany({
      where: { establishmentId, tenantId },
      orderBy: { name: "asc" },
    }),

  findById: (id: string, tenantId: string) =>
    prisma.table.findFirst({
      where: { id, tenantId },
      include: { establishment: { include: { terminal: true } } },
    }),

  findByEstablishmentSlugAndTableSlug: async (
    establishmentSlug: string,
    tableSlug: string
  ) => {
    const establishment = await prisma.establishment.findFirst({
      where: { slug: establishmentSlug },
      include: { terminal: true },
    })
    if (!establishment) return null
    const table = await prisma.table.findFirst({
      where: { establishmentId: establishment.id, slug: tableSlug },
      include: { establishment: { include: { terminal: true } } },
    })
    if (!table) return null
    return { table, establishment, terminal: establishment.terminal, tenantId: establishment.tenantId }
  },

  create: (data: CreateTableDto, tenantId: string) =>
    prisma.table.create({
      data: {
        name: data.name,
        slug: data.slug,
        establishmentId: data.establishmentId,
        tenantId,
      },
    }),

  update: (id: string, data: UpdateTableDto, tenantId: string) =>
    prisma.table.updateMany({
      where: { id, tenantId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.establishmentId !== undefined && { establishmentId: data.establishmentId }),
      },
    }),

  delete: (id: string, tenantId: string) =>
    prisma.table.deleteMany({
      where: { id, tenantId },
    }),
}
