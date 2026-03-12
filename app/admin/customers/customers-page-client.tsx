"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createCustomer, updateCustomer, deleteCustomer } from "@/app/actions/customers"
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Award,
  UserPlus,
  Download,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { formatWithCurrency } from "@/lib/format-currency"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  loyaltyPoints: number
  totalSpent: number
  visits: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  joinedDate: string
  lastVisit: string
}

const tierConfig = {
  bronze: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950", icon: Award },
  silver: { color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", icon: Award },
  gold: { color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-950", icon: Award },
  platinum: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-950", icon: Star },
}

export function CustomersPageClient({
  currency = "USD",
  initialCustomers,
}: {
  currency?: string
  initialCustomers: Customer[]
}) {
  const router = useRouter()
  const formatCurrency = (amount: number) => formatWithCurrency(amount, currency)
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" })

  useEffect(() => {
    setCustomers(initialCustomers)
  }, [initialCustomers])

  useEffect(() => {
    if (modalOpen) {
      if (editCustomer) {
        setForm({
          name: editCustomer.name,
          email: editCustomer.email ?? "",
          phone: editCustomer.phone ?? "",
          address: editCustomer.address ?? "",
        })
      } else {
        setForm({ name: "", email: "", phone: "", address: "" })
      }
    }
  }, [modalOpen, editCustomer])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))
  )

  const stats = {
    total: customers.length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent: customers.length ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0,
    totalVisits: customers.reduce((sum, c) => sum + c.visits, 0),
  }

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    const r = await deleteCustomer(deleteTarget.id)
    if (r.success) {
      router.refresh()
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success("Customer deleted")
    } else {
      toast.error(r.error)
    }
  }, [deleteTarget, router])

  const openAddModal = () => {
    setEditCustomer(null)
    setModalOpen(true)
  }
  const openEditModal = (c: Customer) => {
    setEditCustomer(c)
    setModalOpen(true)
  }
  const closeFormModal = () => {
    setModalOpen(false)
    setEditCustomer(null)
  }

  const handleSubmitCustomer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    fd.set("name", form.name.trim())
    fd.set("email", form.email.trim())
    fd.set("phone", form.phone.trim())
    fd.set("address", form.address.trim())
    const r = editCustomer
      ? await updateCustomer(editCustomer.id, fd)
      : await createCustomer(fd)
    setSaving(false)
    if (r.success) {
      router.refresh()
      closeFormModal()
      toast.success(editCustomer ? "Customer updated" : "Customer created")
    } else {
      toast.error(r.error)
    }
  }, [form, editCustomer, router])

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customer database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={openAddModal} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <UserPlus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(stats.totalSpent)}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="pl-10 max-w-sm"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tier</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Points</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => {
              const config = tierConfig[c.tier] ?? tierConfig.bronze
              return (
                <tr key={c.id} className="hover:bg-secondary/50">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", config.bg, config.color)}>
                      {c.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono">{c.loyaltyPoints}</td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(c)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(c)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={(o) => !o && closeFormModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
            <DialogDescription>
              {editCustomer ? "Update customer details." : "Create a new customer in your database."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCustomer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Name</Label>
              <Input
                id="customer-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
                required
                className="bg-card text-card-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
                className="bg-card text-card-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Phone number"
                className="bg-card text-card-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-address">Address</Label>
              <Input
                id="customer-address"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Address (optional)"
                className="bg-card text-card-foreground"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeFormModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editCustomer ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete customer"
        description={
          <p>Delete customer &quot;{deleteTarget?.name}&quot;? This action cannot be undone.</p>
        }
        icon={<Trash2 className="h-6 w-6" />}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
