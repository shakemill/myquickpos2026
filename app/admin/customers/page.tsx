"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Gift,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  UserPlus,
  Download,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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
  birthday?: string
  notes?: string
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    loyaltyPoints: 2450,
    totalSpent: 4580.5,
    visits: 42,
    tier: "gold",
    joinedDate: "2023-01-15",
    lastVisit: "2024-02-14",
    birthday: "1990-05-20",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "+1 (555) 987-6543",
    loyaltyPoints: 890,
    totalSpent: 1250.0,
    visits: 15,
    tier: "silver",
    joinedDate: "2023-06-22",
    lastVisit: "2024-02-10",
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.davis@example.com",
    phone: "+1 (555) 456-7890",
    address: "456 Oak Ave, Brooklyn, NY 11201",
    loyaltyPoints: 5200,
    totalSpent: 8950.75,
    visits: 68,
    tier: "platinum",
    joinedDate: "2022-09-10",
    lastVisit: "2024-02-15",
    birthday: "1988-11-12",
  },
]

const tierConfig = {
  bronze: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950", icon: Award },
  silver: { color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", icon: Award },
  gold: { color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-950", icon: Award },
  platinum: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-950", icon: Star },
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  )

  const stats = {
    total: customers.length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length,
    totalVisits: customers.reduce((sum, c) => sum + c.visits, 0),
  }

  function formatCurrency(amount: number) {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  function formatNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  function handleDelete(id: string) {
    setCustomers(customers.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your customer database and relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg per Customer</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(stats.avgSpent)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.totalVisits}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <Gift className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">
                  Contact
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Tier</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden lg:table-cell">
                  Points
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden xl:table-cell">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden xl:table-cell">
                  Visits
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden 2xl:table-cell">
                  Last Visit
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const tierStyle = tierConfig[customer.tier]
                const TierIcon = tierStyle.icon
                return (
                  <tr
                    key={customer.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setViewCustomer(customer)}
                  >
                    {/* Customer info */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-card-foreground">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Member since {formatDate(customer.joinedDate)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </p>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                          tierStyle.bg,
                          tierStyle.color
                        )}
                      >
                        <TierIcon className="h-3 w-3" />
                        {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-foreground">
                          {formatNumber(customer.loyaltyPoints)}
                        </span>
                      </div>
                    </td>

                    {/* Total Spent */}
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </td>

                    {/* Visits */}
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <span className="text-muted-foreground">{customer.visits} visits</span>
                    </td>

                    {/* Last Visit */}
                    <td className="px-4 py-4 hidden 2xl:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(customer.lastVisit)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-card-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Customer actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewCustomer(customer)
                            }}
                            className="text-card-foreground"
                          >
                            <UserPlus className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditCustomer(customer)
                            }}
                            className="text-card-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-card-foreground">
                            <Gift className="h-4 w-4" />
                            Add Points
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(customer.id)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">No customers found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try a different search term
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Customer Modal */}
      <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View complete customer information</DialogDescription>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-6">
              {/* Customer Header */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
                  {viewCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">{viewCustomer.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(() => {
                      const tierStyle = tierConfig[viewCustomer.tier]
                      const TierIcon = tierStyle.icon
                      return (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                            tierStyle.bg,
                            tierStyle.color
                          )}
                        >
                          <TierIcon className="h-3 w-3" />
                          {viewCustomer.tier.charAt(0).toUpperCase() + viewCustomer.tier.slice(1)}
                        </span>
                      )
                    })()}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 dark:bg-yellow-950 px-3 py-1 text-xs font-bold text-yellow-600">
                      <Star className="h-3 w-3 fill-yellow-600" />
                      {formatNumber(viewCustomer.loyaltyPoints)} points
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{viewCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{viewCustomer.phone}</span>
                  </div>
                  {viewCustomer.address && (
                    <div className="flex items-start gap-2 text-sm sm:col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{viewCustomer.address}</span>
                    </div>
                  )}
                  {viewCustomer.birthday && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatDate(viewCustomer.birthday)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {formatCurrency(viewCustomer.totalSpent)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Visits</p>
                  <p className="text-xl font-bold text-foreground mt-1">{viewCustomer.visits}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Avg per Visit</p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {formatCurrency(viewCustomer.totalSpent / viewCustomer.visits)}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{formatDate(viewCustomer.joinedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last visit</span>
                  <span className="font-medium">{formatDate(viewCustomer.lastVisit)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCustomer(null)}>
              Close
            </Button>
            <Button onClick={() => setViewCustomer(null)}>Edit Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
