import { prisma } from "@/lib/db"

export interface CreateEstablishmentDto {
  name: string
  slug: string
  terminalId: string
}

export interface UpdateEstablishmentDto {
  name?: string
  slug?: string
  terminalId?: string
}

export const establishmentRepository = {
  findAll: (tenantId: string) =>
    prisma.establishment.findMany({
      where: { tenantId },
      include: { terminal: true, tables: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),

  findById: (id: string, tenantId: string) =>
    prisma.establishment.findFirst({
      where: { id, tenantId },
      include: { terminal: true, tables: true },
    }),

  findBySlug: (tenantId: string, slug: string) =>
    prisma.establishment.findFirst({
      where: { tenantId, slug },
      include: { terminal: true, tables: true },
    }),

  /** Public tablet: resolve establishment by slug (no tenantId). Returns null if not found. */
  findBySlugPublic: async (slug: string) => {
    const establishment = await prisma.establishment.findFirst({
      where: { slug },
      include: { terminal: true },
    })
    if (!establishment) return null
    return {
      establishment,
      terminal: establishment.terminal,
      tenantId: establishment.tenantId,
    }
  },

  create: (data: CreateEstablishmentDto, tenantId: string) =>
    prisma.establishment.create({
      data: {
        name: data.name,
        slug: data.slug,
        terminalId: data.terminalId,
        tenantId,
      },
    }),

  update: (id: string, data: UpdateEstablishmentDto, tenantId: string) =>
    prisma.establishment.updateMany({
      where: { id, tenantId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.terminalId !== undefined && { terminalId: data.terminalId }),
      },
    }),

  delete: (id: string, tenantId: string) =>
    prisma.establishment.deleteMany({
      where: { id, tenantId },
    }),
}
