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
import { useTerminals } from "@/hooks/use-terminals"
import { Monitor, MapPin, User, Percent, Check, ChevronDown } from "lucide-react"
import type { PosTerminalConfig } from "@/lib/pos-store"
import { useCategories } from "@/hooks/use-categories"
import { getCategoryIcon } from "@/lib/category-icons"
import { getPosUsers } from "@/lib/user-store"
import { cn } from "@/lib/utils"

interface CreateTerminalModalProps {
  open: boolean
  onClose: () => void
  editTerminal?: PosTerminalConfig | null
}

export function CreateTerminalModal({
  open,
  onClose,
  editTerminal,
}: CreateTerminalModalProps) {
  const { create, update } = useTerminals()
  const { roots, getChildren, selectable: selectableCategories } = useCategories()
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [cashier, setCashier] = useState("")
  const [taxRate, setTaxRate] = useState("8")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const isEdit = !!editTerminal

  // Build a flat list of all IDs for "select all"
  const allCategoryIds = selectableCategories.map((c) => c.id)

  useEffect(() => {
    if (editTerminal) {
      setName(editTerminal.name)
      setLocation(editTerminal.location)
      setCashier(editTerminal.cashier)
      setTaxRate(editTerminal.taxRate?.toString() ?? "8")
      setSelectedCategories(editTerminal.assignedCategories)
    } else {
      setName("")
      setLocation("")
      setCashier("")
      setTaxRate("8")
      setSelectedCategories(allCategoryIds)
    }
  }, [editTerminal]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleParent(parentId: string) {
    const children = getChildren(parentId)
    const familyIds = [parentId, ...children.map((c) => c.id)]
    const allSelected = familyIds.every((id) => selectedCategories.includes(id))
    if (allSelected) {
      setSelectedCategories((prev) => prev.filter((id) => !familyIds.includes(id)))
    } else {
      setSelectedCategories((prev) => [...new Set([...prev, ...familyIds])])
    }
  }

  function toggleChild(childId: string, parentId: string) {
    setSelectedCategories((prev) => {
      let next: string[]
      if (prev.includes(childId)) {
        next = prev.filter((id) => id !== childId)
        // If no children of this parent are selected, also remove parent
        const siblings = getChildren(parentId)
        const anyChildStillSelected = siblings.some((s) => s.id !== childId && next.includes(s.id))
        if (!anyChildStillSelected) {
          next = next.filter((id) => id !== parentId)
        }
      } else {
        next = [...prev, childId]
        // If all children now selected, also select parent
        const siblings = getChildren(parentId)
        const allNowSelected = siblings.every((s) => next.includes(s.id))
        if (allNowSelected && !next.includes(parentId)) {
          next = [...next, parentId]
        } else if (!next.includes(parentId)) {
          // Add parent anyway so products under parent are visible
          next = [...next, parentId]
        }
      }
      return next
    })
  }

  function toggleLeafRoot(rootId: string) {
    setSelectedCategories((prev) =>
      prev.includes(rootId)
        ? prev.filter((id) => id !== rootId)
        : [...prev, rootId]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !location.trim()) return

    if (isEdit && editTerminal) {
      update(editTerminal.id, {
        name: name.trim(),
        location: location.trim(),
        cashier: cashier.trim() || "Unassigned",
        taxRate: parseFloat(taxRate) || 8,
        assignedCategories: selectedCategories,
      })
    } else {
      create({
        name: name.trim(),
        location: location.trim(),
        status: "online",
        cashier: cashier.trim() || "Unassigned",
        taxRate: parseFloat(taxRate) || 8,
        assignedCategories: selectedCategories,
      })
    }

    setName("")
    setLocation("")
    setCashier("")
    setTaxRate("8")
    setSelectedCategories(allCategoryIds)
    onClose()
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setName("")
      setLocation("")
      setCashier("")
      setTaxRate("8")
      setSelectedCategories(allCategoryIds)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEdit ? "Edit Terminal" : "Create New Terminal"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Update the terminal configuration below."
              : "Set up a new POS terminal with location and cashier details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="terminal-name" className="text-sm font-medium text-card-foreground">
              Terminal Name
            </Label>
            <div className="relative">
              <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="terminal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Terminal 04"
                className="pl-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terminal-location" className="text-sm font-medium text-card-foreground">
              Location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="terminal-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Main Counter"
                className="pl-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terminal-cashier" className="text-sm font-medium text-card-foreground">
              Assigned Cashier
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                id="terminal-cashier"
                value={cashier}
                onChange={(e) => setCashier(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-secondary pl-10 pr-8 text-sm text-card-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="Unassigned">Unassigned</option>
                {getPosUsers()
                  .filter((u) => u.status === "active")
                  .map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terminal-tax" className="text-sm font-medium text-card-foreground">
              Tax Rate (%)
            </Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="terminal-tax"
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="pl-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Nested category assignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">
              Product Categories
            </Label>
            <p className="text-xs text-muted-foreground">
              Select which product categories this terminal can sell
            </p>
            <div className="space-y-2 pt-1">
              {roots.map((root) => {
                const children = getChildren(root.id)
                const RootIcon = getCategoryIcon(root.icon)

                if (children.length === 0) {
                  // Leaf root
                  const isSelected = selectedCategories.includes(root.id)
                  return (
                    <button
                      key={root.id}
                      type="button"
                      onClick={() => toggleLeafRoot(root.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        "touch-manipulation select-none border text-left",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                      )}
                    >
                      <RootIcon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{root.name}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  )
                }

                // Parent with children
                const familyIds = [root.id, ...children.map((c) => c.id)]
                const allSelected = familyIds.every((id) => selectedCategories.includes(id))
                const someSelected = familyIds.some((id) => selectedCategories.includes(id))

                return (
                  <div key={root.id} className="rounded-lg border border-border overflow-hidden">
                    {/* Parent toggle */}
                    <button
                      type="button"
                      onClick={() => toggleParent(root.id)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all",
                        "touch-manipulation select-none text-left",
                        allSelected
                          ? "bg-primary/10 text-primary"
                          : someSelected
                            ? "bg-primary/5 text-primary/80"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      )}
                    >
                      <RootIcon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{root.name}</span>
                      {allSelected && <Check className="h-4 w-4 shrink-0" />}
                      {!allSelected && someSelected && (
                        <div className="h-4 w-4 shrink-0 rounded-sm border-2 border-primary bg-primary/20" />
                      )}
                    </button>
                    {/* Children */}
                    <div className="divide-y divide-border border-t border-border">
                      {children.map((child) => {
                        const ChildIcon = getCategoryIcon(child.icon)
                        const isChildSelected = selectedCategories.includes(child.id)
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => toggleChild(child.id, root.id)}
                            className={cn(
                              "flex w-full items-center gap-2 px-3 py-2 pl-10 text-sm transition-all",
                              "touch-manipulation select-none text-left",
                              isChildSelected
                                ? "bg-primary/5 text-primary"
                                : "text-muted-foreground hover:bg-secondary/50"
                            )}
                          >
                            <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="flex-1">{child.name}</span>
                            {isChildSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-xs text-destructive">
                Select at least one category
              </p>
            )}
          </div>

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
              disabled={selectedCategories.length === 0}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEdit ? "Save Changes" : "Create Terminal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
