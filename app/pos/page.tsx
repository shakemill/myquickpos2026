import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getTenantId } from "@/lib/auth"
import { terminalRepository } from "@/lib/repositories/terminal.repository"
import { TerminalPicker } from "@/components/pos/terminal-picker"

export default async function PosPickerPage() {
  const session = await auth()
  const tenantId = await getTenantId()
  if (!session?.user || !tenantId) redirect("/login")

  const terminals = await terminalRepository.findAll(tenantId)
  const terminalList = terminals.map((t) => ({
    id: t.name,
    name: t.label,
    location: t.label,
    status: t.isActive ? ("online" as const) : ("offline" as const),
  }))

  return (
    <TerminalPicker
      userName={session.user.name ?? "User"}
      terminals={terminalList}
    />
  )
}
