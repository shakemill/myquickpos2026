import { prisma } from "@/lib/db"

export type CategoryType = "product" | "service"

export interface CreateCategoryDto {
  name: string
  icon?: string
  color?: string
  parentId?: string | null
  type?: CategoryType
}

export interface UpdateCategoryDto {
  name?: string
  icon?: string
  color?: string
  parentId?: string | null
  type?: CategoryType
}

export interface CategoryFilters {
  type?: CategoryType
}

export const categoryRepository = {
  findAll: (tenantId: string, filters?: CategoryFilters) =>
    prisma.category.findMany({
      where: {
        tenantId,
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: { name: "asc" },
    }),

  findById: (id: string, tenantId: string) =>
    prisma.category.findFirst({
      where: { id, tenantId },
      include: { children: true },
    }),

  getRootCategories: (tenantId: string, filters?: CategoryFilters) =>
    prisma.category.findMany({
      where: {
        tenantId,
        parentId: null,
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: { name: "asc" },
      include: { children: { orderBy: { name: "asc" } } },
    }),

  getLeafCategories: async (tenantId: string, filters?: CategoryFilters) => {
    const all = await prisma.category.findMany({
      where: {
        tenantId,
        ...(filters?.type && { type: filters.type }),
      },
      include: { children: true },
    })
    return all.filter((c) => c.children.length === 0)
  },

  getDescendantIds: async (categoryId: string, tenantId: string): Promise<string[]> => {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, tenantId },
      include: { children: true },
    })
    if (!category) return []
    if (category.children.length === 0) return [categoryId]
    const ids: string[] = [categoryId]
    for (const child of category.children) {
      ids.push(...(await categoryRepository.getDescendantIds(child.id, tenantId)))
    }
    return ids
  },

  create: (data: CreateCategoryDto, tenantId: string) =>
    prisma.category.create({
      data: {
        name: data.name,
        icon: data.icon ?? null,
        color: data.color ?? null,
        parentId: data.parentId ?? null,
        type: data.type ?? "product",
        tenantId,
      },
    }),

  update: (id: string, data: UpdateCategoryDto, tenantId: string) =>
    prisma.category.updateMany({
      where: { id, tenantId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.type !== undefined && { type: data.type }),
      },
    }),

  delete: (id: string, tenantId: string) =>
    prisma.category.deleteMany({
      where: { id, tenantId },
    }),
}
