import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/auth"
import { userRepository } from "@/lib/repositories/user.repository"
import { terminalRepository } from "@/lib/repositories/terminal.repository"
import { UsersPageClient } from "./users-page-client"

export default async function UsersPage() {
  const tenantId = await getTenantId()
  if (!tenantId) redirect("/login")

  const [users, terminals] = await Promise.all([
    userRepository.findAll(tenantId),
    terminalRepository.findAll(tenantId),
  ])

  const userList = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status as "active" | "inactive",
    lastLogin: u.lastLogin?.toISOString() ?? "Never",
  }))

  const terminalList = terminals.map((t) => ({ id: t.id, name: t.name }))

  return (
    <UsersPageClient
      initialUsers={userList}
      terminals={terminalList}
    />
  )
}
