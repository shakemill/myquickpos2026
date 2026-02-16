"use client"

import { useState } from "react"
import { StatsCards } from "@/components/admin/stats-cards"
import { TerminalCard } from "@/components/admin/terminal-card"
import { CreateTerminalModal } from "@/components/admin/create-terminal-modal"
import { useTerminals } from "@/hooks/use-terminals"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PosTerminalConfig } from "@/lib/pos-store"

export default function AdminDashboard() {
  const { terminals, update, remove } = useTerminals()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTerminal, setEditTerminal] = useState<PosTerminalConfig | null>(null)

  function handleToggleStatus(id: string) {
    const terminal = terminals.find((t) => t.id === id)
    if (!terminal) return
    update(id, {
      status: terminal.status === "online" ? "offline" : "online",
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your POS system performance
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

      {/* Stats */}
      <StatsCards />

      {/* Terminals Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Terminals ({terminals.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {terminals.map((terminal) => (
            <TerminalCard
              key={terminal.id}
              terminal={terminal}
              onDelete={remove}
              onToggleStatus={handleToggleStatus}
              onEdit={(t) => setEditTerminal(t)}
            />
          ))}

          {/* Add Terminal Card */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Plus className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Add Terminal</span>
          </button>
        </div>
      </div>

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
