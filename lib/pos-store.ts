import { products as defaultProducts, categories as defaultCategories, type Product, type Category } from "./pos-data"

export interface PosTerminalConfig {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "maintenance"
  cashier: string
  createdAt: string
  lastActive: string
  todaySales: number
  todayOrders: number
  products: Product[]
  categories: Category[]
  assignedCategories: string[]
  taxRate: number
}

const DEFAULT_TERMINALS: PosTerminalConfig[] = [
  {
    id: "terminal-01",
    name: "Terminal 01",
    location: "Main Counter",
    status: "online",
    cashier: "Alex Johnson",
    createdAt: "2025-11-15",
    lastActive: new Date().toISOString(),
    todaySales: 1284.50,
    todayOrders: 47,
    products: defaultProducts,
    categories: defaultCategories,
    assignedCategories: ["burgers", "classic-burgers", "premium-burgers", "pizza", "classic-pizza", "specialty-pizza", "drinks", "soft-drinks", "hot-drinks", "sides", "desserts"],
    taxRate: 8,
  },
  {
    id: "terminal-02",
    name: "Terminal 02",
    location: "Drive-Through",
    status: "online",
    cashier: "Maria Garcia",
    createdAt: "2025-12-01",
    lastActive: new Date().toISOString(),
    todaySales: 892.75,
    todayOrders: 34,
    products: defaultProducts,
    categories: defaultCategories,
    assignedCategories: ["burgers", "classic-burgers", "premium-burgers", "drinks", "soft-drinks", "hot-drinks", "sides"],
    taxRate: 8,
  },
  {
    id: "terminal-03",
    name: "Terminal 03",
    location: "Patio Bar",
    status: "offline",
    cashier: "Unassigned",
    createdAt: "2026-01-10",
    lastActive: "2026-02-11T18:30:00.000Z",
    todaySales: 0,
    todayOrders: 0,
    products: defaultProducts,
    categories: defaultCategories,
    assignedCategories: ["drinks", "soft-drinks", "hot-drinks", "desserts"],
    taxRate: 8,
  },
]

let terminals: PosTerminalConfig[] = [...DEFAULT_TERMINALS]
let listeners: (() => void)[] = []

function emit() {
  listeners.forEach((l) => l())
}

export function getTerminals(): PosTerminalConfig[] {
  return terminals
}

export function getTerminal(id: string): PosTerminalConfig | undefined {
  return terminals.find((t) => t.id === id)
}

export function addTerminal(config: Omit<PosTerminalConfig, "id" | "createdAt" | "lastActive" | "todaySales" | "todayOrders" | "products" | "categories">): PosTerminalConfig {
  const newTerminal: PosTerminalConfig = {
    ...config,
    id: `terminal-${String(terminals.length + 1).padStart(2, "0")}`,
    createdAt: new Date().toISOString().split("T")[0],
    lastActive: new Date().toISOString(),
    todaySales: 0,
    todayOrders: 0,
    products: defaultProducts,
    categories: defaultCategories,
    assignedCategories: config.assignedCategories.length > 0
      ? config.assignedCategories
      : defaultCategories.filter((c) => c.id !== "all").map((c) => c.id),
  }
  terminals = [...terminals, newTerminal]
  emit()
  return newTerminal
}

export function updateTerminal(id: string, updates: Partial<PosTerminalConfig>): PosTerminalConfig | undefined {
  const idx = terminals.findIndex((t) => t.id === id)
  if (idx === -1) return undefined
  terminals = terminals.map((t, i) => (i === idx ? { ...t, ...updates } : t))
  emit()
  return terminals[idx]
}

export function deleteTerminal(id: string): boolean {
  const len = terminals.length
  terminals = terminals.filter((t) => t.id !== id)
  if (terminals.length !== len) {
    emit()
    return true
  }
  return false
}

export function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}
