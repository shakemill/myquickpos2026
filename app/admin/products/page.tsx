"use client"

import { useState, useEffect, useMemo } from "react"
import { useProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import { CreateProductModal } from "@/components/admin/create-product-modal"
import type { Product, Category } from "@/lib/pos-data"
import { cn } from "@/lib/utils"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  ChevronRight,
} from "lucide-react"
import { getCategoryIcon, categoryIconOptions } from "@/lib/category-icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// ─── Tab types ───────────────────────────────────────────────────────────────

type ActiveTab = "products" | "categories"

// ─── Category Modal ─────────────────────────────────────────────────────────

function CategoryModal({
  open,
  onClose,
  editCategory,
  parentCategory,
  roots,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  editCategory?: Category | null
  parentCategory?: Category | null
  roots: Category[]
  onCreate: (data: Omit<Category, "id">) => void
  onUpdate: (id: string, data: Partial<Omit<Category, "id">>) => void
}) {
  const isEdit = !!editCategory
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("grid")
  const [iconSearch, setIconSearch] = useState("")
  const [parentId, setParentId] = useState<string | null>(null)

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name)
      setIcon(editCategory.icon)
      setParentId(editCategory.parentId)
    } else {
      setName("")
      setIcon(parentCategory?.icon ?? "grid")
      setParentId(parentCategory?.id ?? null)
    }
    setIconSearch("")
  }, [editCategory, parentCategory])

  const filteredIcons = categoryIconOptions.filter(
    (opt) =>
      !iconSearch.trim() ||
      opt.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
      opt.id.toLowerCase().includes(iconSearch.toLowerCase())
  )

  const SelectedIcon = getCategoryIcon(icon)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (isEdit && editCategory) {
      onUpdate(editCategory.id, { name: name.trim(), icon, parentId })
    } else {
      onCreate({ name: name.trim(), icon, parentId })
    }
    setName("")
    setIcon("grid")
    setIconSearch("")
    setParentId(null)
    onClose()
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setName("")
      setIcon("grid")
      setIconSearch("")
      setParentId(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEdit ? "Edit Category" : parentCategory ? `Add Subcategory to ${parentCategory.name}` : "Add New Category"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Update the category details below."
              : parentCategory
                ? `This will be a subcategory under "${parentCategory.name}".`
                : "Create a new product category for your catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Preview */}
          <div className="flex items-center gap-4 rounded-xl border border-border bg-secondary/50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <SelectedIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-card-foreground truncate">
                {name.trim() || "Category Name"}
              </p>
              <p className="text-xs text-muted-foreground">
                {parentId ? "Subcategory" : "Root Category"} &middot; Preview
              </p>
            </div>
          </div>

          {/* Parent selector (only when creating new root or editing) */}
          {!parentCategory && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-card-foreground">
                Parent Category
              </Label>
              <div className="relative">
                <select
                  value={parentId ?? ""}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className="w-full h-10 rounded-md border border-border bg-secondary pl-3 pr-8 text-sm text-card-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">None (Root Category)</option>
                  {roots.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none rotate-90" />
              </div>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="cat-name" className="text-sm font-medium text-card-foreground">
              Category Name
            </Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appetizers, Seafood, Beverages..."
              className="bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">
              Category Icon
            </Label>
            <Input
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="Search icons..."
              className="bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
            />
            <div className="grid grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto rounded-lg border border-border bg-secondary/30 p-2">
              {filteredIcons.map((opt) => {
                const IconComp = opt.icon
                const isSelected = icon === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIcon(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg p-2.5 text-center transition-all",
                      "touch-manipulation select-none",
                      isSelected
                        ? "bg-primary/15 text-primary ring-1 ring-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-card-foreground"
                    )}
                    title={opt.label}
                  >
                    <IconComp className="h-5 w-5" />
                    <span className="text-[10px] leading-tight font-medium truncate w-full">
                      {opt.label.split(" / ")[0]}
                    </span>
                  </button>
                )
              })}
              {filteredIcons.length === 0 && (
                <div className="col-span-5 py-6 text-center text-xs text-muted-foreground">
                  No icons match your search
                </div>
              )}
            </div>
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
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEdit ? "Save Changes" : parentCategory ? "Add Subcategory" : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { products, remove: removeProduct } = useProducts()
  const {
    categories,
    selectable: selectableCategories,
    roots,
    leaves,
    getChildren,
    getDescendantIds,
    create: createCategory,
    update: updateCategory,
    remove: removeCategory,
  } = useCategories()

  const [activeTab, setActiveTab] = useState<ActiveTab>("products")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  // Product state
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null)

  // Category state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editCategoryTarget, setEditCategoryTarget] = useState<Category | null>(null)
  const [parentCategoryTarget, setParentCategoryTarget] = useState<Category | null>(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<Category | null>(null)

  // ── Products filtering (nesting-aware) ──

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let matchCategory = false
      if (activeCategory === "all") {
        matchCategory = true
      } else {
        const ids = getDescendantIds(activeCategory)
        matchCategory = ids.includes(p.category)
      }
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [products, activeCategory, searchQuery, getDescendantIds])

  const categoryCount = (catId: string) => {
    if (catId === "all") return products.length
    const ids = getDescendantIds(catId)
    return products.filter((p) => ids.includes(p.category)).length
  }

  function getCategoryBreadcrumb(catId: string): string {
    const cat = categories.find((c) => c.id === catId)
    if (!cat) return catId
    if (cat.parentId) {
      const parent = categories.find((c) => c.id === cat.parentId)
      return parent ? `${parent.name} > ${cat.name}` : cat.name
    }
    return cat.name
  }

  // ── Categories filtering ──

  const filteredRoots = useMemo(() => {
    if (!searchQuery.trim()) return roots
    const q = searchQuery.toLowerCase()
    return roots.filter((r) => {
      if (r.name.toLowerCase().includes(q)) return true
      return getChildren(r.id).some((c) => c.name.toLowerCase().includes(q))
    })
  }, [roots, searchQuery, getChildren])

  // ── Handlers ──

  function handleEditProduct(product: Product) {
    setEditProduct(product)
    setProductModalOpen(true)
  }

  function handleDeleteProduct() {
    if (!deleteProductTarget) return
    removeProduct(deleteProductTarget.id)
    setDeleteProductTarget(null)
  }

  function handleEditCategory(cat: Category) {
    setEditCategoryTarget(cat)
    setParentCategoryTarget(null)
    setCategoryModalOpen(true)
  }

  function handleAddSubcategory(parent: Category) {
    setEditCategoryTarget(null)
    setParentCategoryTarget(parent)
    setCategoryModalOpen(true)
  }

  function handleDeleteCategory() {
    if (!deleteCategoryTarget) return
    removeCategory(deleteCategoryTarget.id)
    setDeleteCategoryTarget(null)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Products & Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} product{products.length !== 1 && "s"} across{" "}
            {roots.length} categor{roots.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Button
          onClick={() => {
            if (activeTab === "products") {
              setEditProduct(null)
              setProductModalOpen(true)
            } else {
              setEditCategoryTarget(null)
              setParentCategoryTarget(null)
              setCategoryModalOpen(true)
            }
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === "products" ? "Add Product" : "Add Category"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border">
        <button
          onClick={() => {
            setActiveTab("products")
            setSearchQuery("")
          }}
          className={cn(
            "pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "products"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Products
          <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs">
            {products.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("categories")
            setSearchQuery("")
          }}
          className={cn(
            "pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "categories"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Categories
          <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs">
            {selectableCategories.length}
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "products"
                ? "Search products..."
                : "Search categories..."
            }
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        {activeTab === "products" && (
          <div className="flex gap-1.5 overflow-x-auto rounded-lg bg-card border border-border p-1">
            {/* "All" chip */}
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Items
              <span className="ml-1.5 opacity-60">{products.length}</span>
            </button>
            {/* Root category chips with descendant counts */}
            {roots.map((cat) => {
              const children = getChildren(cat.id)
              const isParentActive = activeCategory === cat.id || children.some((c) => c.id === activeCategory)
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                    isParentActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.name}
                  <span className="ml-1.5 opacity-60">{categoryCount(cat.id)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Sub-category pills (second row when a parent is active in products tab) */}
      {activeTab === "products" && (() => {
        const activeRoot = roots.find((r) => r.id === activeCategory)
        const activeChildParent = roots.find((r) => getChildren(r.id).some((c) => c.id === activeCategory))
        const parentToShow = activeRoot || activeChildParent
        const childrenToShow = parentToShow ? getChildren(parentToShow.id) : []

        if (childrenToShow.length === 0) return null

        return (
          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveCategory(parentToShow!.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-colors whitespace-nowrap",
                activeCategory === parentToShow!.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              )}
            >
              All {parentToShow!.name}
            </button>
            {childrenToShow.map((child) => {
              const ChildIcon = getCategoryIcon(child.icon)
              return (
                <button
                  key={child.id}
                  onClick={() => setActiveCategory(child.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors whitespace-nowrap",
                    activeCategory === child.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  )}
                >
                  <ChildIcon className="h-3 w-3" />
                  {child.name}
                  <span className="opacity-60">{categoryCount(child.id)}</span>
                </button>
              )
            })}
          </div>
        )
      })()}

      {/* ─── Products Tab ─── */}
      {activeTab === "products" && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-card-foreground">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        {getCategoryBreadcrumb(product.category)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-semibold font-mono text-card-foreground">
                        ${product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteProductTarget(product)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mb-2" />
              <p className="text-sm">No products found</p>
              <p className="text-xs mt-1">
                Try a different filter or add a new product
              </p>
            </div>
          )}
        </>
      )}

      {/* ─── Categories Tab (tree view) ─── */}
      {activeTab === "categories" && (
        <>
          <div className="space-y-4">
            {filteredRoots.map((root) => {
              const RootIcon = getCategoryIcon(root.icon)
              const children = getChildren(root.id)
              const totalCount = categoryCount(root.id)

              return (
                <div
                  key={root.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Parent row */}
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <RootIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-card-foreground">
                          {root.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {totalCount} product{totalCount !== 1 && "s"}
                          {children.length > 0 && ` \u00B7 ${children.length} subcategor${children.length !== 1 ? "ies" : "y"}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAddSubcategory(root)}
                        className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
                        title="Add subcategory"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Sub</span>
                      </button>
                      <button
                        onClick={() => handleEditCategory(root)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                        title="Edit category"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteCategoryTarget(root)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Children rows */}
                  {children.length > 0 && (
                    <div className="border-t border-border divide-y divide-border">
                      {children.map((child) => {
                        const ChildIcon = getCategoryIcon(child.icon)
                        const childCount = products.filter(
                          (p) => p.category === child.id
                        ).length
                        return (
                          <div
                            key={child.id}
                            className="flex items-center justify-between px-5 py-3 pl-[72px] bg-secondary/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                                <ChildIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-card-foreground">
                                  {child.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {childCount} product{childCount !== 1 && "s"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditCategory(child)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                                title="Edit subcategory"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => setDeleteCategoryTarget(child)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                title="Delete subcategory"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Products preview in parent that has no children */}
                  {children.length === 0 && (
                    <div className="border-t border-border px-5 py-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Products
                      </p>
                      {(() => {
                        const prods = products.filter((p) => p.category === root.id)
                        if (prods.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-1.5">
                              {prods.slice(0, 5).map((p) => (
                                <span
                                  key={p.id}
                                  className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                                >
                                  {p.name}
                                </span>
                              ))}
                              {prods.length > 5 && (
                                <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                  +{prods.length - 5} more
                                </span>
                              )}
                            </div>
                          )
                        }
                        return (
                          <p className="text-xs text-muted-foreground">
                            No products in this category
                          </p>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredRoots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mb-2" />
              <p className="text-sm">No categories found</p>
              <p className="text-xs mt-1">
                Create a category to organize your products
              </p>
            </div>
          )}
        </>
      )}

      {/* ─── Modals ─── */}

      {/* Create / Edit Product */}
      <CreateProductModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setEditProduct(null)
        }}
        editProduct={editProduct}
      />

      {/* Create / Edit Category */}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false)
          setEditCategoryTarget(null)
          setParentCategoryTarget(null)
        }}
        editCategory={editCategoryTarget}
        parentCategory={parentCategoryTarget}
        roots={roots}
        onCreate={createCategory}
        onUpdate={updateCategory}
      />

      {/* Delete Product Confirmation */}
      <Dialog
        open={!!deleteProductTarget}
        onOpenChange={(o) => !o && setDeleteProductTarget(null)}
      >
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Delete Product
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleteProductTarget?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:bg-secondary"
              onClick={() => setDeleteProductTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteProduct}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog
        open={!!deleteCategoryTarget}
        onOpenChange={(o) => !o && setDeleteCategoryTarget(null)}
      >
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Delete Category
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;
              {deleteCategoryTarget?.name}&quot;?
              {deleteCategoryTarget?.parentId === null &&
                getChildren(deleteCategoryTarget?.id ?? "").length > 0 &&
                " All subcategories will also be deleted."}
              {" "}
              {products.filter((p) => {
                const ids = getDescendantIds(deleteCategoryTarget?.id ?? "")
                return ids.includes(p.category)
              }).length > 0 &&
                "Products in this category will become uncategorized."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:bg-secondary"
              onClick={() => setDeleteCategoryTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteCategory}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
