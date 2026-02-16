"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { useStock } from "@/hooks/use-stock"
import { useProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import { getStockStatus, type StockLevel, type MovementType, type StockLocation } from "@/lib/stock-store"
import { getCategoryIcon } from "@/lib/category-icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Search,
  Warehouse,
  PackagePlus,
  ArrowLeftRight,
  ClipboardCheck,
  AlertTriangle,
  PackageX,
  DollarSign,
  Layers,
  Plus,
  Minus,
  ArrowRight,
  Filter,
  ChevronDown,
  Truck,
  X,
  Building2,
  Monitor,
} from "lucide-react"

// ── Tabs ────────────────────────────────────────────────────────────────────

type Tab = "inventory" | "movements" | "transfers"

const tabs: { id: Tab; label: string }[] = [
  { id: "inventory", label: "Inventory" },
  { id: "movements", label: "Movements" },
  { id: "transfers", label: "Transfers" },
]

type StatusFilter = "all" | "ok" | "low" | "out"
type MovementFilter = "all" | MovementType

// ── Main Page ───────────────────────────────────────────────────────────────

export default function StockPage() {
  const { locations, stockLevels, movements, lowCount, outCount, totalUnits, totalValue, getStatus, quick, restock, transfer, adjust } = useStock()
  const { products } = useProducts()
  const { categories: allCategories } = useCategories()

  const [tab, setTab] = useState<Tab>("inventory")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("all")

  const [restockOpen, setRestockOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)

  // Merge stock + product + location data
  const inventoryRows = useMemo(() => {
    return stockLevels
      .map((sl) => {
        const product = products.find((p) => p.id === sl.productId)
        if (!product) return null
        const cat = allCategories.find((c) => c.id === product.category)
        const location = locations.find((l) => l.id === sl.locationId)
        const status = getStockStatus(sl)
        return { ...sl, product, category: cat, location, status }
      })
      .filter(Boolean) as (StockLevel & {
        product: (typeof products)[0]
        category: (typeof allCategories)[0] | undefined
        location: StockLocation | undefined
        status: "ok" | "low" | "out"
      })[]
  }, [stockLevels, products, allCategories, locations])

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    let rows = inventoryRows
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((r) => r.product.name.toLowerCase().includes(q))
    }
    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter)
    }
    if (categoryFilter !== "all") {
      rows = rows.filter((r) => r.product.category === categoryFilter)
    }
    if (locationFilter !== "all") {
      rows = rows.filter((r) => r.locationId === locationFilter)
    }
    return rows
  }, [inventoryRows, search, statusFilter, categoryFilter, locationFilter])

  // Filtered movements
  const filteredMovements = useMemo(() => {
    let mvs = movements
    if (movementFilter !== "all") {
      mvs = mvs.filter((m) => m.type === movementFilter)
    }
    if (tab === "transfers") {
      mvs = mvs.filter((m) => m.type === "transfer")
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      mvs = mvs.filter((m) => {
        const p = products.find((pr) => pr.id === m.productId)
        return (
          (p?.name.toLowerCase().includes(q)) ||
          m.note.toLowerCase().includes(q) ||
          (m.supplier?.toLowerCase().includes(q))
        )
      })
    }
    return mvs
  }, [movements, movementFilter, tab, search, products])

  // Leaf categories for filter
  const leafCategories = useMemo(
    () => allCategories.filter((c) => c.id !== "all"),
    [allCategories]
  )

  function getProductName(id: string) {
    return products.find((p) => p.id === id)?.name ?? "Unknown"
  }

  function getLocationName(id: string) {
    return locations.find((l) => l.id === id)?.name ?? id
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  const statusBadge = (status: "ok" | "low" | "out") => {
    const map = {
      ok: "bg-emerald-500/10 text-emerald-500",
      low: "bg-yellow-500/10 text-yellow-500",
      out: "bg-red-500/10 text-red-500",
    }
    const label = { ok: "In Stock", low: "Low Stock", out: "Out of Stock" }
    return (
      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", map[status])}>
        {label[status]}
      </span>
    )
  }

  const movementBadge = (type: MovementType) => {
    const map = {
      restock: "bg-emerald-500/10 text-emerald-500",
      sale: "bg-blue-500/10 text-blue-500",
      adjustment: "bg-yellow-500/10 text-yellow-500",
      transfer: "bg-purple-500/10 text-purple-500",
    }
    const label = { restock: "Restock", sale: "Sale", adjustment: "Adjust", transfer: "Transfer" }
    return (
      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", map[type])}>
        {label[type]}
      </span>
    )
  }

  const centralWarehouse = locations.find((l) => l.type === "central")

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Stock Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Central warehouse and terminal inventory tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setRestockOpen(true)}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <PackagePlus className="h-4 w-4" />
            Restock
          </Button>
          <Button
            onClick={() => setTransferOpen(true)}
            variant="outline"
            className="gap-2 border-border text-card-foreground hover:bg-secondary"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Transfer
          </Button>
          <Button
            onClick={() => setAdjustOpen(true)}
            variant="outline"
            className="gap-2 border-border text-card-foreground hover:bg-secondary"
          >
            <ClipboardCheck className="h-4 w-4" />
            Adjust
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total SKUs", value: new Set(stockLevels.map(s => s.productId)).size.toString(), icon: Layers, color: "text-primary" },
          { label: "Units in Stock", value: totalUnits.toLocaleString(), icon: Warehouse, color: "text-primary" },
          {
            label: "Low Stock Alerts",
            value: lowCount.toString(),
            icon: AlertTriangle,
            color: lowCount > 0 ? "text-yellow-500" : "text-muted-foreground",
          },
          {
            label: "Out of Stock",
            value: outCount.toString(),
            icon: PackageX,
            color: outCount > 0 ? "text-red-500" : "text-muted-foreground",
          },
          {
            label: "Total Value",
            value: `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "text-primary",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <kpi.icon className={cn("h-5 w-5", kpi.color)} />
            <p className={cn("text-xl font-bold font-mono", kpi.color)} suppressHydrationWarning>
              {kpi.value}
            </p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/20 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
              tab === t.id
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-card-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "inventory" ? "Search products..." : "Search movements..."}
            className="pl-10 bg-secondary border-border text-card-foreground"
          />
        </div>

        {tab === "inventory" && (
          <>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.type === "central" ? "🏢" : "🖥️"} {loc.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="ok">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {leafCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </>
        )}

        {(tab === "movements" || tab === "transfers") && (
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value as MovementFilter)}
            className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="restock">Restock</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
            <option value="sale">Sale</option>
          </select>
        )}
      </div>

      {/* Content Area */}
      {tab === "inventory" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Qty</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Min</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Stock Level</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInventory.map((row) => {
                  const fillPct = Math.min(100, (row.quantity / row.maxCapacity) * 100)
                  const CatIcon = row.category ? getCategoryIcon(row.category.icon) : null
                  const isLow = row.status === "low"
                  const isOut = row.status === "out"

                  return (
                    <tr key={`${row.productId}-${row.locationId}`} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                            {row.product.image ? (
                              <img src={row.product.image} alt={row.product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Warehouse className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{row.product.name}</p>
                            <p className="text-xs text-muted-foreground">${row.product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {row.location?.type === "central" ? (
                            <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Monitor className="h-3.5 w-3.5 text-blue-500" />
                          )}
                          <span className="text-sm text-card-foreground">{row.location?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {CatIcon && row.category && (
                          <div className="flex items-center gap-1.5">
                            <CatIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{row.category.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("font-mono text-sm font-semibold", isOut ? "text-red-500" : isLow ? "text-yellow-500" : "text-card-foreground")}>
                          {row.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-xs text-muted-foreground">{row.minThreshold}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", isOut ? "bg-red-500" : isLow ? "bg-yellow-500" : "bg-emerald-500")}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{fillPct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{statusBadge(row.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => quick(row.productId, row.locationId, -1, "Quick deduct")}
                            disabled={row.quantity <= 0}
                            className="p-1 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => quick(row.productId, row.locationId, 1, "Quick add")}
                            className="p-1 rounded hover:bg-secondary transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Warehouse className="h-8 w-8 mb-2" />
                <p className="text-sm">No inventory found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {(tab === "movements" || tab === "transfers") && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">From / To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMovements.map((mv) => (
                  <tr key={mv.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">{movementBadge(mv.type)}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-card-foreground">{getProductName(mv.productId)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("font-mono text-sm font-semibold", mv.quantity < 0 ? "text-red-500" : "text-emerald-500")}>
                        {mv.quantity > 0 ? "+" : ""}{mv.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {mv.type === "transfer" && mv.fromLocation && mv.toLocation && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{getLocationName(mv.fromLocation)}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{getLocationName(mv.toLocation)}</span>
                        </div>
                      )}
                      {mv.type === "restock" && mv.toLocation && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <Truck className="h-3 w-3" />
                          <span>{getLocationName(mv.toLocation)}</span>
                        </div>
                      )}
                      {(mv.type === "sale" || mv.type === "adjustment") && mv.fromLocation && (
                        <span className="text-xs text-muted-foreground">{getLocationName(mv.fromLocation)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{formatDate(mv.date)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{mv.note}</span>
                    </td>
                    <td className="px-4 py-3">
                      {mv.supplier && (
                        <span className="text-xs text-muted-foreground">{mv.supplier}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMovements.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ClipboardCheck className="h-8 w-8 mb-2" />
                <p className="text-sm">No movements found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <RestockModal
        open={restockOpen}
        onClose={() => setRestockOpen(false)}
        onRestock={(items, supplier, note) => {
          restock(items, supplier, note)
          setRestockOpen(false)
        }}
        products={products}
        centralWarehouse={centralWarehouse}
      />

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onTransfer={(items, from, to, note) => {
          transfer(items, from, to, note)
          setTransferOpen(false)
        }}
        products={products}
        locations={locations}
        stockLevels={stockLevels}
      />

      <AdjustModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        onAdjust={(productId, locationId, newCount, note) => {
          adjust(productId, locationId, newCount, note)
          setAdjustOpen(false)
        }}
        products={products}
        locations={locations}
        stockLevels={stockLevels}
      />
    </div>
  )
}

// ── Restock Modal (Supplier → Central Warehouse) ───────────────────────────

function RestockModal({
  open,
  onClose,
  onRestock,
  products,
  centralWarehouse,
}: {
  open: boolean
  onClose: () => void
  onRestock: (items: { productId: string; quantity: number }[], supplier: string, note: string) => void
  products: any[]
  centralWarehouse: StockLocation | undefined
}) {
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: "", quantity: 0 },
  ])
  const [supplier, setSupplier] = useState("")
  const [note, setNote] = useState("")

  function addItem() {
    setItems([...items, { productId: "", quantity: 0 }])
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: "productId" | "quantity", value: string | number) {
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = items.filter((it) => it.productId && it.quantity > 0)
    if (valid.length === 0 || !supplier.trim()) return
    onRestock(valid, supplier.trim(), note.trim() || "Supplier delivery")
    setItems([{ productId: "", quantity: 0 }])
    setSupplier("")
    setNote("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-emerald-600" />
            Restock from Supplier
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add stock to {centralWarehouse?.name || "Central Warehouse"} from external supplier
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-sm font-medium text-card-foreground">
              Supplier Name
            </Label>
            <Input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Fresh Foods Co."
              className="bg-secondary border-border text-card-foreground"
              required
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">Products to Restock</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-secondary/20 p-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(idx, "productId", e.target.value)}
                    className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground"
                    required
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price})
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="Qty"
                    className="w-24 bg-secondary border-border text-card-foreground"
                    required
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-2 rounded hover:bg-secondary text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" onClick={addItem} variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Add Product
            </Button>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium text-card-foreground">
              Note (optional)
            </Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Delivery notes..."
              className="bg-secondary border-border text-card-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700">
              Confirm Restock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Transfer Modal (Central → Terminal or Terminal → Terminal) ─────────────

function TransferModal({
  open,
  onClose,
  onTransfer,
  products,
  locations,
  stockLevels,
}: {
  open: boolean
  onClose: () => void
  onTransfer: (items: { productId: string; quantity: number }[], from: string, to: string, note: string) => void
  products: any[]
  locations: StockLocation[]
  stockLevels: StockLevel[]
}) {
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: "", quantity: 0 },
  ])
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [note, setNote] = useState("")

  function addItem() {
    setItems([...items, { productId: "", quantity: 0 }])
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: "productId" | "quantity", value: string | number) {
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
  }

  function getAvailableStock(productId: string) {
    if (!fromLocation || !productId) return 0
    const level = stockLevels.find((s) => s.productId === productId && s.locationId === fromLocation)
    return level?.quantity ?? 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = items.filter((it) => it.productId && it.quantity > 0)
    if (valid.length === 0 || !fromLocation || !toLocation) return
    onTransfer(valid, fromLocation, toLocation, note.trim() || "Inter-location transfer")
    setItems([{ productId: "", quantity: 0 }])
    setFromLocation("")
    setToLocation("")
    setNote("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-purple-600" />
            Transfer Stock Between Locations
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Move products from one location to another
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* From / To */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-card-foreground">From Location</Label>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground"
                required
              >
                <option value="">Select source...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.type === "central" ? "🏢" : "🖥️"} {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-card-foreground">To Location</Label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground"
                required
              >
                <option value="">Select destination...</option>
                {locations.filter((l) => l.id !== fromLocation).map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.type === "central" ? "🏢" : "🖥️"} {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">Products to Transfer</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-secondary/20 p-3">
              {items.map((item, idx) => {
                const available = getAvailableStock(item.productId)
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, "productId", e.target.value)}
                      className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground"
                      required
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="1"
                        max={available}
                        value={item.quantity || ""}
                        onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 0)}
                        placeholder="Qty"
                        className="w-20 bg-secondary border-border text-card-foreground"
                        required
                      />
                      {item.productId && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">/ {available}</span>
                      )}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-2 rounded hover:bg-secondary text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <Button type="button" onClick={addItem} variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Add Product
            </Button>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="transfer-note" className="text-sm font-medium text-card-foreground">
              Note (optional)
            </Label>
            <Input
              id="transfer-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Transfer reason..."
              className="bg-secondary border-border text-card-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-purple-600 text-white hover:bg-purple-700">
              Confirm Transfer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Adjust Modal (Count Correction at Location) ────────────────────────────

function AdjustModal({
  open,
  onClose,
  onAdjust,
  products,
  locations,
  stockLevels,
}: {
  open: boolean
  onClose: () => void
  onAdjust: (productId: string, locationId: string, newCount: number, note: string) => void
  products: any[]
  locations: StockLocation[]
  stockLevels: StockLevel[]
}) {
  const [productId, setProductId] = useState("")
  const [locationId, setLocationId] = useState("")
  const [newCount, setNewCount] = useState(0)
  const [note, setNote] = useState("")

  const currentLevel = stockLevels.find((s) => s.productId === productId && s.locationId === locationId)
  const diff = currentLevel ? newCount - currentLevel.quantity : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId || !locationId || !note.trim()) return
    onAdjust(productId, locationId, newCount, note.trim())
    setProductId("")
    setLocationId("")
    setNewCount(0)
    setNote("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-yellow-600" />
            Inventory Count Adjustment
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Correct stock quantity after physical count
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">Location</Label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground"
              required
            >
              <option value="">Select location...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.type === "central" ? "🏢" : "🖥️"} {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">Product</Label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground"
              required
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Count comparison */}
          {currentLevel && (
            <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Count:</span>
                <span className="font-mono font-semibold text-card-foreground">{currentLevel.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">New Count:</span>
                <Input
                  type="number"
                  min="0"
                  value={newCount}
                  onChange={(e) => setNewCount(parseInt(e.target.value) || 0)}
                  className="w-24 text-right bg-secondary border-border"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">Difference:</span>
                <span className={cn("font-mono font-semibold", diff > 0 ? "text-emerald-500" : diff < 0 ? "text-red-500" : "text-muted-foreground")}>
                  {diff > 0 ? "+" : ""}{diff}
                </span>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="adjust-note" className="text-sm font-medium text-card-foreground">
              Reason
            </Label>
            <Input
              id="adjust-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Physical inventory count"
              className="bg-secondary border-border text-card-foreground"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-yellow-600 text-white hover:bg-yellow-700">
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
