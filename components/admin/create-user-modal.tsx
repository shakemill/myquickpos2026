"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUsers } from "@/hooks/use-users"
import { useTerminals } from "@/hooks/use-terminals"
import { User as UserIcon, Mail, Lock, Check, Shield, Monitor } from "lucide-react"
import type { User } from "@/lib/user-store"
import { cn } from "@/lib/utils"

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  editUser?: User | null
}

export function CreateUserModal({ open, onClose, editUser }: CreateUserModalProps) {
  const { create, update } = useUsers()
  const { terminals } = useTerminals()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"manager" | "pos_user">("pos_user")
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>([])
  const [status, setStatus] = useState<"active" | "inactive">("active")

  const isEdit = !!editUser

  useEffect(() => {
    if (editUser) {
      setName(editUser.name)
      setEmail(editUser.email)
      setPassword("")
      setRole(editUser.role)
      setSelectedTerminals(editUser.assignedTerminals)
      setStatus(editUser.status)
    } else {
      resetForm()
    }
  }, [editUser, open])

  function resetForm() {
    setName("")
    setEmail("")
    setPassword("")
    setRole("pos_user")
    setSelectedTerminals([])
    setStatus("active")
  }

  function toggleTerminal(terminalId: string) {
    setSelectedTerminals((prev) =>
      prev.includes(terminalId)
        ? prev.filter((id) => id !== terminalId)
        : [...prev, terminalId]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    if (!isEdit && !password.trim()) return

    if (isEdit && editUser) {
      const updates: Partial<User> = {
        name: name.trim(),
        email: email.trim(),
        role,
        assignedTerminals: role === "pos_user" ? selectedTerminals : [],
        status,
      }
      if (password.trim()) {
        updates.password = password.trim()
      }
      update(editUser.id, updates)
    } else {
      create({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        assignedTerminals: role === "pos_user" ? selectedTerminals : [],
        status,
      })
    }

    resetForm()
    onClose()
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEdit ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Update the user details below."
              : "Add a new manager or POS cashier to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-name" className="text-sm font-medium text-card-foreground">
              Full Name
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="pl-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-email" className="text-sm font-medium text-card-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@myquickpos.com"
                className="pl-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-password" className="text-sm font-medium text-card-foreground">
              {isEdit ? "New Password (leave blank to keep current)" : "Password"}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                className="pl-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                required={!isEdit}
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-card-foreground">Role</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                  role === "manager"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                )}
              >
                <Shield className="h-4 w-4" />
                Manager
              </button>
              <button
                type="button"
                onClick={() => setRole("pos_user")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                  role === "pos_user"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                )}
              >
                <Monitor className="h-4 w-4" />
                POS Cashier
              </button>
            </div>
          </div>

          {/* Terminal Assignment (only for POS users) */}
          {role === "pos_user" && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-card-foreground">
                Assigned Terminals
              </Label>
              <p className="text-xs text-muted-foreground">
                Select which terminals this cashier can access
              </p>
              <div className="flex flex-col gap-1.5 pt-1">
                {terminals.map((t) => {
                  const isSelected = selectedTerminals.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTerminal(t.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{t.name}</span>
                        <span className="ml-2 text-xs opacity-60">{t.location}</span>
                      </div>
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          t.status === "online" ? "bg-primary" : "bg-muted-foreground"
                        )}
                      />
                    </button>
                  )
                })}
              </div>
              {selectedTerminals.length === 0 && (
                <p className="text-xs text-destructive mt-1">
                  Assign at least one terminal to this cashier
                </p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-card-foreground">Status</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("active")}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                  status === "active"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                )}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus("inactive")}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                  status === "inactive"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                )}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:bg-secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={role === "pos_user" && selectedTerminals.length === 0}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
