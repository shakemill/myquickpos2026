import type { Product, Category } from "./pos-data"
import {
  products as defaultProducts,
  categories as defaultCategories,
} from "./pos-data"

// ── Products ────────────────────────────────────────────────────────────────

let products: Product[] = [...defaultProducts]
let productListeners: (() => void)[] = []

function emitProducts() {
  productListeners.forEach((l) => l())
}

export function getProducts(): Product[] {
  return products
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function addProduct(
  data: Omit<Product, "id">
): Product {
  const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const newProduct: Product = { id, ...data }
  products = [...products, newProduct]
  emitProducts()
  return newProduct
}

export function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id">>
): Product | undefined {
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  products = products.map((p, i) => (i === idx ? { ...p, ...updates } : p))
  emitProducts()
  return products[idx]
}

export function deleteProduct(id: string): boolean {
  const len = products.length
  products = products.filter((p) => p.id !== id)
  if (products.length !== len) {
    emitProducts()
    return true
  }
  return false
}

export function subscribeProducts(listener: () => void) {
  productListeners = [...productListeners, listener]
  return () => {
    productListeners = productListeners.filter((l) => l !== listener)
  }
}

// ── Categories ──────────────────────────────────────────────────────────────

let categories: Category[] = [...defaultCategories]
let categoryListeners: (() => void)[] = []

// ── Derived caches (rebuilt on every emit) ──
let selectableCategoriesCache: Category[] = []
let rootCategoriesCache: Category[] = []
let childrenMapCache: Record<string, Category[]> = {}
let leafCategoriesCache: Category[] = []

function rebuildCategoryCaches() {
  selectableCategoriesCache = categories.filter((c) => c.id !== "all")
  rootCategoriesCache = categories.filter((c) => c.id !== "all" && c.parentId === null)
  childrenMapCache = {}
  for (const cat of categories) {
    if (cat.parentId) {
      if (!childrenMapCache[cat.parentId]) childrenMapCache[cat.parentId] = []
      childrenMapCache[cat.parentId].push(cat)
    }
  }
  // Leaf = root categories with no children + all child categories
  leafCategoriesCache = categories.filter((c) => {
    if (c.id === "all") return false
    if (c.parentId !== null) return true // child is always a leaf
    return !childrenMapCache[c.id] || childrenMapCache[c.id].length === 0
  })
}

// Build initial caches
rebuildCategoryCaches()

function emitCategories() {
  rebuildCategoryCaches()
  categoryListeners.forEach((l) => l())
}

export function getCategories(): Category[] {
  return categories
}

/** Returns categories without the "all" meta-category */
export function getSelectableCategories(): Category[] {
  return selectableCategoriesCache
}

/** Root-level categories (parentId === null, excluding "all") */
export function getRootCategories(): Category[] {
  return rootCategoriesCache
}

/** Direct children of a parent category */
export function getChildrenOf(parentId: string): Category[] {
  return childrenMapCache[parentId] ?? []
}

/** IDs of all descendants (children) of a category.
 *  If the category itself is a leaf (no children), returns [categoryId]. */
export function getDescendantIds(categoryId: string): string[] {
  const children = childrenMapCache[categoryId]
  if (!children || children.length === 0) return [categoryId]
  return children.map((c) => c.id)
}

/** Categories that products can be assigned to (children, or parentless leaves) */
export function getLeafCategories(): Category[] {
  return leafCategoriesCache
}

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}

export function addCategory(
  data: Omit<Category, "id">
): Category {
  const id = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const uniqueId = data.parentId ? `${id}-${data.parentId}` : id
  const existing = categories.find((c) => c.id === uniqueId)
  if (existing) return existing
  const newCat: Category = { id: uniqueId, ...data }
  categories = [...categories, newCat]
  emitCategories()
  return newCat
}

export function updateCategory(
  id: string,
  updates: Partial<Omit<Category, "id">>
): Category | undefined {
  if (id === "all") return undefined
  const idx = categories.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  categories = categories.map((c, i) => (i === idx ? { ...c, ...updates } : c))
  emitCategories()
  return categories[idx]
}

export function deleteCategory(id: string): boolean {
  if (id === "all") return false
  const len = categories.length
  // Also remove any children of this category
  categories = categories.filter((c) => c.id !== id && c.parentId !== id)
  if (categories.length !== len) {
    emitCategories()
    return true
  }
  return false
}

export function subscribeCategories(listener: () => void) {
  categoryListeners = [...categoryListeners, listener]
  return () => {
    categoryListeners = categoryListeners.filter((l) => l !== listener)
  }
}
