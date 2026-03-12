import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { establishmentRepository } from "@/lib/repositories/establishment.repository"
import { terminalRepository } from "@/lib/repositories/terminal.repository"
import { TabletPageClient } from "./tablet-page-client"

export default async function TabletPage() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const [establishments, terminals] = await Promise.all([
    establishmentRepository.findAll(tenantId),
    terminalRepository.findAll(tenantId),
  ])

  const establishmentList = establishments.map((e) => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
    terminalId: e.terminalId,
    terminalName: e.terminal?.label ?? e.terminal?.name ?? "",
    tables: e.tables.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
  }))

  const terminalList = terminals.map((t) => ({
    id: t.id,
    name: t.name,
    label: t.label,
  }))

  return (
    <TabletPageClient
      establishments={establishmentList}
      terminals={terminalList}
    />
  )
}
