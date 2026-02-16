"use client"

import { useState } from "react"
import { useUsers } from "@/hooks/use-users"
import { useTerminals } from "@/hooks/use-terminals"
import { CreateUserModal } from "@/components/admin/create-user-modal"
import type { User } from "@/lib/user-store"
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  Monitor,
  Mail,
  UserCheck,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type FilterTab = "all" | "manager" | "pos_user"

export default function UsersPage() {
  const { users, update, remove } = useUsers()
  const { terminals } = useTerminals()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === "all" ? true : u.role === filter
    return matchesSearch && matchesFilter
  })

  const managerCount = users.filter((u) => u.role === "manager").length
  const cashierCount = users.filter((u) => u.role === "pos_user").length

  function getTerminalNames(terminalIds: string[]): string {
    return terminalIds
      .map((id) => terminals.find((t) => t.id === id)?.name ?? id)
      .join(", ")
  }

  function handleEdit(user: User) {
    setEditUser(user)
    setModalOpen(true)
  }

  function handleCloseModal() {
    setEditUser(null)
    setModalOpen(false)
  }

  function formatDate(dateStr: string) {
    if (dateStr === "Never") return "Never"
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All Users", count: users.length },
    { key: "manager", label: "Managers", count: managerCount },
    { key: "pos_user", label: "POS Cashiers", count: cashierCount },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage managers and POS cashiers
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === tab.key
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-secondary-foreground"
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Assigned Terminals</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Last Login</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          user.role === "manager"
                            ? "bg-primary/15 text-primary"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                        user.role === "manager"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {user.role === "manager" ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <Monitor className="h-3 w-3" />
                      )}
                      {user.role === "manager" ? "Manager" : "Cashier"}
                    </span>
                  </td>

                  {/* Terminals */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {user.role === "pos_user" && user.assignedTerminals.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.assignedTerminals.map((tid) => {
                          const t = terminals.find((tr) => tr.id === tid)
                          return (
                            <span
                              key={tid}
                              className="inline-flex rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground"
                            >
                              {t?.name ?? tid}
                            </span>
                          )
                        })}
                      </div>
                    ) : user.role === "manager" ? (
                      <span className="text-xs text-muted-foreground">All terminals</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None assigned</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        user.status === "active"
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {user.status === "active" ? (
                        <UserCheck className="h-3 w-3" />
                      ) : (
                        <UserX className="h-3 w-3" />
                      )}
                      {user.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(user.lastLogin)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-card-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">User actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          onClick={() => handleEdit(user)}
                          className="text-card-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            update(user.id, {
                              status:
                                user.status === "active" ? "inactive" : "active",
                            })
                          }
                          className="text-card-foreground"
                        >
                          {user.status === "active" ? (
                            <>
                              <UserX className="h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => remove(user.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try a different search or filter
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal
        open={modalOpen}
        onClose={handleCloseModal}
        editUser={editUser}
      />
    </div>
  )
}
