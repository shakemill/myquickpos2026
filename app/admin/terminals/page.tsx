"use client"

import { useState, useMemo } from "react"
import { TerminalCard } from "@/components/admin/terminal-card"
import { CreateTerminalModal } from "@/components/admin/create-terminal-modal"
import { useTerminals } from "@/hooks/use-terminals"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { PosTerminalConfig } from "@/lib/pos-store"

const statusFilters = ["all", "online", "offline", "maintenance"] as const

export default function TerminalsPage() {
  const { terminals, update, remove } = useTerminals()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTerminal, setEditTerminal] = useState<PosTerminalConfig | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = useMemo(() => {
    let result = terminals
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.cashier.toLowerCase().includes(q)
      )
    }
    return result
  }, [terminals, statusFilter, searchQuery])

  function handleToggleStatus(id: string) {
    const terminal = terminals.find((t) => t.id === id)
    if (!terminal) return
    update(id, {
      status: terminal.status === "online" ? "offline" : "online",
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Terminals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all POS terminals
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Terminal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terminals..."
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1.5 rounded-lg bg-card border border-border p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                statusFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter}
              {filter !== "all" && (
                <span className="ml-1.5 opacity-60">
                  {terminals.filter((t) =>
                    filter === "all" ? true : t.status === filter
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((terminal) => (
          <TerminalCard
            key={terminal.id}
            terminal={terminal}
            onDelete={remove}
            onToggleStatus={handleToggleStatus}
            onEdit={(t) => setEditTerminal(t)}
          />
        ))}

        <button
          onClick={() => setCreateOpen(true)}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary min-h-[200px]"
        >
          <Plus className="h-8 w-8 mb-2" />
          <span className="text-sm font-medium">Add Terminal</span>
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">No terminals match your filters</p>
          <p className="text-xs mt-1">Try a different search or status filter</p>
        </div>
      )}

      <CreateTerminalModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editTerminal && (
        <CreateTerminalModal
          open={!!editTerminal}
          onClose={() => setEditTerminal(null)}
          editTerminal={editTerminal}
        />
      )}
    </div>
  )
}
