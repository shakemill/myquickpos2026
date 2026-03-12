import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { tenantRepository } from "@/lib/repositories/tenant.repository"
import { customerRepository } from "@/lib/repositories/customer.repository"
import { CustomersPageClient } from "./customers-page-client"

export default async function CustomersPage() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const [tenantSettings, customers] = await Promise.all([
    tenantRepository.getSettings(tenantId),
    customerRepository.findAll(tenantId),
  ])
  const customerList = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email ?? "",
    phone: c.phone ?? "",
    address: c.address ?? undefined,
    loyaltyPoints: c.loyaltyPoints,
    totalSpent: c.totalSpent != null ? Number(c.totalSpent) : 0,
    visits: c.visits,
    tier: c.loyaltyTier as "bronze" | "silver" | "gold" | "platinum",
    joinedDate: c.createdAt?.toISOString().split("T")[0] ?? "",
    lastVisit: c.lastVisit?.toISOString().split("T")[0] ?? "",
  }))
  const serialized = JSON.parse(JSON.stringify(customerList)) as typeof customerList
  const currency = tenantSettings?.currency ?? "USD"

  return <CustomersPageClient currency={currency} initialCustomers={serialized} />
}
