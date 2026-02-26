import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { storeRepository } from "@/lib/repositories/store.repository"
import { StoresPageClient } from "./stores-page-client"

export default async function StoresPage() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const stores = await storeRepository.findAll(tenantId)
  const list = stores.map((s) => ({
    id: s.id,
    name: s.name,
    isCentral: s.isCentral,
  }))

  return <StoresPageClient stores={list} />
}
