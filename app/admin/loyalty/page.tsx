import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { tenantRepository } from "@/lib/repositories/tenant.repository"
import { loyaltyRepository } from "@/lib/repositories/loyalty.repository"
import { customerRepository } from "@/lib/repositories/customer.repository"
import { LoyaltyPageClient } from "./loyalty-page-client"

export default async function LoyaltyPage() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const [tenantSettings, program, customerStats] = await Promise.all([
    tenantRepository.getSettings(tenantId),
    loyaltyRepository.getByTenant(tenantId),
    customerRepository.getStats(tenantId).catch(() => ({ count: 0, totalPoints: 0 })),
  ])

  const tiers = (program?.tiers as unknown[]) ?? []
  const rewards = (program?.rewards as unknown[]) ?? []
  const pointsPerEuro = program?.pointsPerEuro ?? 10
  const isActive = program?.isActive ?? true

  const members = customerStats?.count ?? 0
  const totalPoints = customerStats?.totalPoints ?? 0

  const currency = tenantSettings?.currency ?? "USD"

  return (
    <LoyaltyPageClient
      currency={currency}
      initialTiers={tiers}
      initialRewards={rewards}
      initialProgram={{
        pointsPerDollar: pointsPerEuro,
        pointsExpiry: 365,
        members,
        totalPoints,
        redemptionRate: 32,
        active: isActive,
      }}
      pointsPerEuro={pointsPerEuro}
      isActive={isActive}
    />
  )
}
