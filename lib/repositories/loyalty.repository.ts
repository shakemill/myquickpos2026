import { prisma } from "@/lib/db"

export const loyaltyRepository = {
  getByTenant: (tenantId: string) =>
    prisma.loyaltyProgram.findUnique({
      where: { tenantId },
    }),

  update: (tenantId: string, data: { pointsPerEuro?: number; tiers?: unknown; rewards?: unknown; isActive?: boolean }) =>
    prisma.loyaltyProgram.upsert({
      where: { tenantId },
      create: {
        tenantId,
        pointsPerEuro: data.pointsPerEuro ?? 10,
        tiers: (data.tiers as object) ?? [],
        rewards: (data.rewards as object) ?? [],
        isActive: data.isActive ?? true,
      },
      update: {
        pointsPerEuro: data.pointsPerEuro,
        tiers: data.tiers as object,
        rewards: data.rewards as object,
        isActive: data.isActive,
      },
    }),
}
