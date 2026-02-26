import { products as defaultProducts } from "./pos-data"
import { getProducts } from "./product-store"
import { getTerminals } from "./pos-store"

// ── Types ───────────────────────────────────────────────────────────────────

export type LocationType = "central" | "terminal"

export interface StockLocation {
  id: string
  name: string
  type: LocationType
}

export interface StockLevel {
  productId: string
  locationId: string
  quantity: number
  minThreshold: number
  maxCapacity: number
}

export type MovementType = "restock" | "sale" | "adjustment" | "transfer"

export interface StockMovement {
  id: string
  type: MovementType
  productId: string
  quantity: number // positive = in, negative = out
  date: string
  note: string
  supplier?: string
  fromLocation?: string
  toLocation?: string
}

export type StockStatus = "ok" | "low" | "out"

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeId() {
  return `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function seedQuantity(index: number): number {
  const values = [48, 120, 0, 35, 72, 5, 90, 15, 8, 60, 110, 2, 45, 85, 3, 55, 100, 25, 70, 0, 40, 95, 12, 65, 30, 80, 4, 50, 18, 75]
  return values[index % values.length]
}

function seedThreshold(index: number): number {
  const values = [10, 15, 10, 8, 12, 10, 15, 10, 10, 12, 15, 8, 10, 12, 8, 10, 15, 10, 12, 10, 8, 15, 10, 12, 10, 15, 8, 10, 10, 12]
  return values[index % values.length]
}

function seedCapacity(index: number): number {
  const values = [150, 200, 100, 120, 180, 100, 200, 120, 100, 150, 200, 100, 150, 180, 100, 150, 200, 120, 180, 100, 120, 200, 120, 150, 120, 200, 100, 150, 120, 180]
  return values[index % values.length]
}

// ── Seed data ───────────────────────────────────────────────────────────────

const CENTRAL_WAREHOUSE: StockLocation = {
  id: "central-warehouse",
  name: "Central Warehouse",
  type: "central",
}

// Generate stock levels for central warehouse + all terminals
const seedStockLevels: StockLevel[] = []
const seedLocationIds = [CENTRAL_WAREHOUSE.id, "terminal-01", "terminal-02", "terminal-03"]

defaultProducts.forEach((p, i) => {
  seedLocationIds.forEach((locId, locIdx) => {
    const isCentral = locId === CENTRAL_WAREHOUSE.id
    const qty = isCentral ? seedQuantity(i) * 2 : Math.round(seedQuantity(i) * 0.3)
    seedStockLevels.push({
      productId: p.id,
      locationId: locId,
      quantity: qty,
      minThreshold: seedThreshold(i),
      maxCapacity: isCentral ? seedCapacity(i) * 3 : seedCapacity(i),
    })
  })
})

const now = new Date()
function daysAgo(d: number) {
  const t = new Date(now)
  t.setDate(t.getDate() - d)
  return t.toISOString()
}

const seedMovements: StockMovement[] = [
  { id: "mv-s01", type: "restock", productId: "1", quantity: 100, date: daysAgo(7), note: "Weekly supplier delivery", supplier: "Fresh Foods Co.", toLocation: "central-warehouse" },
  { id: "mv-s02", type: "restock", productId: "7", quantity: 80, date: daysAgo(7), note: "Weekly supplier delivery", supplier: "Fresh Foods Co.", toLocation: "central-warehouse" },
  { id: "mv-s03", type: "transfer", productId: "1", quantity: 20, date: daysAgo(6), note: "Restock Terminal 01", fromLocation: "central-warehouse", toLocation: "terminal-01" },
  { id: "mv-s04", type: "sale", productId: "1", quantity: -3, date: daysAgo(6), note: "POS sale", fromLocation: "terminal-01" },
  { id: "mv-s05", type: "sale", productId: "13", quantity: -5, date: daysAgo(6), note: "POS sale", fromLocation: "terminal-01" },
  { id: "mv-s06", type: "transfer", productId: "19", quantity: 15, date: daysAgo(5), note: "Transfer fries to drive-through", fromLocation: "central-warehouse", toLocation: "terminal-02" },
  { id: "mv-s07", type: "adjustment", productId: "3", quantity: -2, date: daysAgo(4), note: "Inventory count correction - shrinkage", fromLocation: "central-warehouse" },
  { id: "mv-s08", type: "restock", productId: "13", quantity: 150, date: daysAgo(4), note: "Beverage delivery", supplier: "Drinks Unlimited", toLocation: "central-warehouse" },
  { id: "mv-s09", type: "transfer", productId: "13", quantity: 40, date: daysAgo(3), note: "Stock beverages to terminals", fromLocation: "central-warehouse", toLocation: "terminal-01" },
  { id: "mv-s10", type: "sale", productId: "8", quantity: -4, date: daysAgo(3), note: "POS sale", fromLocation: "terminal-01" },
  { id: "mv-s11", type: "transfer", productId: "25", quantity: 10, date: daysAgo(3), note: "Move desserts to patio", fromLocation: "central-warehouse", toLocation: "terminal-03" },
  { id: "mv-s12", type: "restock", productId: "19", quantity: 120, date: daysAgo(2), note: "Sides bulk order", supplier: "Potato Express", toLocation: "central-warehouse" },
  { id: "mv-s13", type: "sale", productId: "2", quantity: -6, date: daysAgo(2), note: "POS sale", fromLocation: "terminal-01" },
  { id: "mv-s14", type: "adjustment", productId: "20", quantity: 3, date: daysAgo(1), note: "Found extra stock during count", fromLocation: "terminal-02" },
  { id: "mv-s15", type: "sale", productId: "14", quantity: -8, date: daysAgo(1), note: "POS sale", fromLocation: "terminal-02" },
  { id: "mv-s16", type: "restock", productId: "25", quantity: 60, date: daysAgo(0), note: "Bakery delivery", supplier: "Sweet Treats Bakery", toLocation: "central-warehouse" },
  { id: "mv-s17", type: "transfer", productId: "25", quantity: 15, date: daysAgo(0), note: "Desserts to main counter", fromLocation: "central-warehouse", toLocation: "terminal-01" },
]

// ── State ───────────────────────────────────────────────────────────────────

let locations: StockLocation[] = [CENTRAL_WAREHOUSE]
let stockLevels: StockLevel[] = [...seedStockLevels]
let movements: StockMovement[] = [...seedMovements]
let listeners: (() => void)[] = []

// Cache for getLocations to prevent infinite loop in useSyncExternalStore
let cachedLocations: StockLocation[] | null = null
let lastTerminalCount = 0

function emit() {
  listeners.forEach((l) => l())
}

// Sync terminal locations dynamically
function syncTerminalLocations() {
  const terminals = getTerminals()
  
  // Only rebuild if terminal count changed
  if (terminals.length !== lastTerminalCount) {
    lastTerminalCount = terminals.length
    const terminalLocs: StockLocation[] = terminals.map((t) => ({
      id: t.id,
      name: t.name,
      type: "terminal" as const,
    }))
    locations = [CENTRAL_WAREHOUSE, ...terminalLocs]
    cachedLocations = null // Invalidate cache
  }
}

// ── Getters ─────────────────────────────────────────────────────────────────

export function getLocations(): StockLocation[] {
  if (cachedLocations) return cachedLocations
  
  syncTerminalLocations()
  cachedLocations = locations
  return cachedLocations
}

export function getStockLevels(): StockLevel[] {
  return stockLevels
}

export function getStockLevel(productId: string, locationId: string): StockLevel | undefined {
  return stockLevels.find((s) => s.productId === productId && s.locationId === locationId)
}

export function getLocationStock(locationId: string): StockLevel[] {
  return stockLevels.filter((s) => s.locationId === locationId)
}

export function getProductStock(productId: string): StockLevel[] {
  return stockLevels.filter((s) => s.productId === productId)
}

export function getMovements(): StockMovement[] {
  return movements
}

export function getStockStatus(level: StockLevel): StockStatus {
  if (level.quantity <= 0) return "out"
  if (level.quantity <= level.minThreshold) return "low"
  return "ok"
}

export function getLowStockCount(): number {
  return stockLevels.filter((s) => s.quantity > 0 && s.quantity <= s.minThreshold).length
}

export function getOutOfStockCount(): number {
  return stockLevels.filter((s) => s.quantity <= 0).length
}

export function getTotalUnits(): number {
  return stockLevels.reduce((sum, s) => sum + Math.max(0, s.quantity), 0)
}

export function getTotalStockValue(): number {
  const prods = getProducts()
  return stockLevels.reduce((sum, s) => {
    const p = prods.find((pr) => pr.id === s.productId)
    return sum + Math.max(0, s.quantity) * (p?.price ?? 0)
  }, 0)
}

// ── Actions ─────────────────────────────────────────────────────────────────

/** Restock products to central warehouse from supplier */
export function addRestock(
  items: { productId: string; quantity: number }[],
  supplier: string,
  note: string
) {
  const centralId = CENTRAL_WAREHOUSE.id
  for (const item of items) {
    const idx = stockLevels.findIndex(
      (s) => s.productId === item.productId && s.locationId === centralId
    )
    if (idx !== -1) {
      stockLevels = stockLevels.map((s, i) =>
        i === idx ? { ...s, quantity: s.quantity + item.quantity } : s
      )
    } else {
      stockLevels = [
        ...stockLevels,
        {
          productId: item.productId,
          locationId: centralId,
          quantity: item.quantity,
          minThreshold: 10,
          maxCapacity: 500,
        },
      ]
    }
    movements = [
      {
        id: makeId(),
        type: "restock",
        productId: item.productId,
        quantity: item.quantity,
        date: new Date().toISOString(),
        note,
        supplier,
        toLocation: centralId,
      },
      ...movements,
    ]
  }
  emit()
}

/** Transfer stock between locations (usually central → terminals) */
export function addTransfer(
  items: { productId: string; quantity: number }[],
  fromLocation: string,
  toLocation: string,
  note: string
) {
  for (const item of items) {
    // Deduct from source
    const fromIdx = stockLevels.findIndex(
      (s) => s.productId === item.productId && s.locationId === fromLocation
    )
    if (fromIdx !== -1) {
      stockLevels = stockLevels.map((s, i) =>
        i === fromIdx ? { ...s, quantity: Math.max(0, s.quantity - item.quantity) } : s
      )
    }
    // Add to destination
    const toIdx = stockLevels.findIndex(
      (s) => s.productId === item.productId && s.locationId === toLocation
    )
    if (toIdx !== -1) {
      stockLevels = stockLevels.map((s, i) =>
        i === toIdx ? { ...s, quantity: s.quantity + item.quantity } : s
      )
    } else {
      stockLevels = [
        ...stockLevels,
        {
          productId: item.productId,
          locationId: toLocation,
          quantity: item.quantity,
          minThreshold: 10,
          maxCapacity: 150,
        },
      ]
    }
    movements = [
      {
        id: makeId(),
        type: "transfer",
        productId: item.productId,
        quantity: item.quantity,
        date: new Date().toISOString(),
        note,
        fromLocation,
        toLocation,
      },
      ...movements,
    ]
  }
  emit()
}

/** Adjust inventory count at a specific location (correction) */
export function addAdjustment(
  productId: string,
  locationId: string,
  newCount: number,
  note: string
) {
  const idx = stockLevels.findIndex(
    (s) => s.productId === productId && s.locationId === locationId
  )
  if (idx === -1) return
  const diff = newCount - stockLevels[idx].quantity
  stockLevels = stockLevels.map((s, i) => (i === idx ? { ...s, quantity: newCount } : s))
  movements = [
    {
      id: makeId(),
      type: "adjustment",
      productId,
      quantity: diff,
      date: new Date().toISOString(),
      note,
      fromLocation: locationId,
    },
    ...movements,
  ]
  emit()
}

/** Record a sale deduction from a terminal */
export function recordSale(productId: string, locationId: string, quantity: number) {
  const idx = stockLevels.findIndex(
    (s) => s.productId === productId && s.locationId === locationId
  )
  if (idx !== -1) {
    stockLevels = stockLevels.map((s, i) =>
      i === idx ? { ...s, quantity: Math.max(0, s.quantity - quantity) } : s
    )
  }
  movements = [
    {
      id: makeId(),
      type: "sale",
      productId,
      quantity: -quantity,
      date: new Date().toISOString(),
      note: "POS sale",
      fromLocation: locationId,
    },
    ...movements,
  ]
  emit()
}

/** Update min threshold for a product at a location */
export function updateThreshold(
  productId: string,
  locationId: string,
  minThreshold: number
) {
  stockLevels = stockLevels.map((s) =>
    s.productId === productId && s.locationId === locationId ? { ...s, minThreshold } : s
  )
  emit()
}

/** Quick adjust (inline +/-) at a specific location */
export function quickAdjust(
  productId: string,
  locationId: string,
  delta: number,
  note: string
) {
  const idx = stockLevels.findIndex(
    (s) => s.productId === productId && s.locationId === locationId
  )
  if (idx === -1) return
  const newQty = Math.max(0, stockLevels[idx].quantity + delta)
  stockLevels = stockLevels.map((s, i) => (i === idx ? { ...s, quantity: newQty } : s))
  movements = [
    {
      id: makeId(),
      type: "adjustment",
      productId,
      quantity: delta,
      date: new Date().toISOString(),
      note,
      fromLocation: locationId,
    },
    ...movements,
  ]
  emit()
}

// ── Subscription ────────────────────────────────────────────────────────────

export function subscribeStock(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}
