"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreateProductModal } from "@/components/admin/create-product-modal"
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/products"
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories"
import type { Product, Category } from "@/lib/pos-data"
import { cn, toTitleCase } from "@/lib/utils"
import { formatWithCurrency } from "@/lib/format-currency"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import { Wrench } from "lucide-react"

type ActiveTab = "products" | "categories" | "services"

const PAGE_SIZE = 20

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
  onCreate: (data: Omit<Category, "id">) => Promise<void>
  onUpdate: (id: string, data: Partial<Omit<Category, "id">>) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("grid")
  const [iconSearch, setIconSearch] = useState("")
  const [parentId, setParentId] = useState<string | null>(null)
  const [categoryType, setCategoryType] = useState<"product" | "service">("product")
  const [loading, setLoading] = useState(false)

  const isEdit = !!editCategory
  const rootsForType = roots.filter((r) => (r.type ?? "product") === categoryType)

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name)
      setIcon(editCategory.icon)
      setParentId(editCategory.parentId)
      setCategoryType(editCategory.type ?? "product")
    } else {
      setName("")
      setIcon(parentCategory?.icon ?? "grid")
      setParentId(parentCategory?.id ?? null)
      setCategoryType(parentCategory?.type ?? "product")
    }
    setIconSearch("")
  }, [editCategory, parentCategory, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || loading) return
    setLoading(true)
    try {
      if (isEdit && editCategory) {
        await onUpdate(editCategory.id, { name: name.trim(), icon, parentId, type: categoryType })
        toast.success("Category updated")
      } else {
        await onCreate({ name: name.trim(), icon, parentId, type: categoryType })
        toast.success("Category created")
      }
      setName("")
      setIcon("grid")
      setIconSearch("")
      setParentId(null)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setName("")
      setIcon("grid")
      setIconSearch("")
      setParentId(null)
      onClose()
    }
  }

  const filteredIcons = categoryIconOptions.filter(
    (opt) =>
      !iconSearch.trim() ||
      opt.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
      opt.id.toLowerCase().includes(iconSearch.toLowerCase())
  )

  const SelectedIcon = getCategoryIcon(icon)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEdit ? "Edit Category" : parentCategory ? `Add Subcategory to ${toTitleCase(parentCategory.name)}` : "Add New Category"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Update the category details below."
              : parentCategory
                ? `This will be a subcategory under "${toTitleCase(parentCategory.name)}".`
                : "Create a new product category for your catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
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

          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">Type</Label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value as "product" | "service")}
              className="w-full h-10 rounded-md border border-border bg-secondary pl-3 pr-8 text-sm text-card-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </div>

          {!parentCategory && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-card-foreground">Parent Category</Label>
              <select
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full h-10 rounded-md border border-border bg-secondary pl-3 pr-8 text-sm text-card-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">None (Root Category)</option>
                {rootsForType.map((r) => (
                  <option key={r.id} value={r.id}>{toTitleCase(r.name)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cat-name" className="text-sm font-medium text-card-foreground">Category Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appetizers, Seafood, Beverages..."
              className="bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">Category Icon</Label>
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
                      "flex flex-col items-center gap-1 rounded-lg p-2.5 text-center transition-all touch-manipulation select-none",
                      isSelected ? "bg-primary/15 text-primary ring-1 ring-primary" : "text-muted-foreground hover:bg-secondary hover:text-card-foreground"
                    )}
                  >
                    <IconComp className="h-5 w-5" />
                    <span className="text-[10px] leading-tight font-medium truncate w-full">{opt.label.split(" / ")[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Saving..." : isEdit ? "Save Changes" : "Add Category"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProductsPageClient({
  currency = "USD",
  initialProducts,
  initialServices,
  initialCategories,
}: {
  currency?: string
  initialProducts: Product[]
  initialServices: Product[]
  initialCategories: Category[]
}) {
  const router = useRouter()
  const formatCurrency = (amount: number) => formatWithCurrency(amount, currency ?? "USD")
  const [products, setProducts] = useState(initialProducts)
  const [services, setServices] = useState(initialServices)
  const [categories, setCategories] = useState(initialCategories)

  const roots = useMemo(() => categories.filter((c) => !c.parentId), [categories])
  const productRoots = useMemo(() => roots.filter((c) => (c.type ?? "product") === "product"), [roots])
  const serviceRoots = useMemo(() => roots.filter((c) => (c.type ?? "product") === "service"), [roots])
  const leaves = useMemo(() => {
    const childIds = new Set(categories.filter((c) => c.parentId).map((c) => c.parentId))
    return categories.filter((c) => !childIds.has(c.id))
  }, [categories])
  const productLeaves = useMemo(() => leaves.filter((c) => (c.type ?? "product") === "product"), [leaves])
  const serviceLeaves = useMemo(() => leaves.filter((c) => (c.type ?? "product") === "service"), [leaves])
  const getChildren = useCallback((parentId: string) =>
    categories.filter((c) => c.parentId === parentId),
  [categories])
  const getDescendantIds = useCallback((categoryId: string): string[] => {
    const kids = getChildren(categoryId)
    if (kids.length === 0) return [categoryId]
    return [categoryId, ...kids.flatMap((k) => getDescendantIds(k.id))]
  }, [getChildren])

  const [activeTab, setActiveTab] = useState<ActiveTab>("products")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeServiceCategory, setActiveServiceCategory] = useState("all")
  const [productPage, setProductPage] = useState(1)
  const [servicePage, setServicePage] = useState(1)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editCategoryTarget, setEditCategoryTarget] = useState<Category | null>(null)
  const [parentCategoryTarget, setParentCategoryTarget] = useState<Category | null>(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<Category | null>(null)

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = activeCategory === "all" || getDescendantIds(activeCategory).includes(p.category)
      const matchSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [products, activeCategory, searchQuery, getDescendantIds])

  const filteredServices = useMemo(() => {
    return services.filter((p) => {
      const matchCategory = activeServiceCategory === "all" || getDescendantIds(activeServiceCategory).includes(p.category)
      const matchSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [services, activeServiceCategory, searchQuery, getDescendantIds])

  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const serviceTotalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE))
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE),
    [filteredProducts, productPage]
  )
  const paginatedServices = useMemo(
    () => filteredServices.slice((servicePage - 1) * PAGE_SIZE, servicePage * PAGE_SIZE),
    [filteredServices, servicePage]
  )

  useEffect(() => {
    setProductPage(1)
  }, [activeCategory, searchQuery])

  useEffect(() => {
    setServicePage(1)
  }, [activeServiceCategory, searchQuery])

  const categoryCount = (catId: string) => {
    if (catId === "all") return products.length
    return products.filter((p) => getDescendantIds(catId).includes(p.category)).length
  }

  const serviceCategoryCount = (catId: string) => {
    if (catId === "all") return services.length
    return services.filter((p) => getDescendantIds(catId).includes(p.category)).length
  }

  const getCategoryBreadcrumb = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    if (!cat) return catId
    const parent = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null
    const name = toTitleCase(cat.name)
    return parent ? `${toTitleCase(parent.name)} > ${name}` : name
  }

  const filteredRoots = useMemo(() => {
    if (!searchQuery.trim()) return roots
    const q = searchQuery.toLowerCase()
    return roots.filter((r) => r.name.toLowerCase().includes(q) || getChildren(r.id).some((c) => c.name.toLowerCase().includes(q)))
  }, [roots, searchQuery, getChildren])

  const handleCreateProduct = useCallback(async (data: Omit<Product, "id">) => {
    const fd = new FormData()
    fd.set("name", data.name)
    fd.set("price", String(data.price))
    fd.set("categoryId", data.category)
    const r = await createProduct(fd)
    if (r.success) {
      router.refresh()
      setProducts((prev) => [...prev, r.data as Product])
      toast.success("Product created")
    } else {
      toast.error(r.error)
      throw new Error(r.error)
    }
  }, [router])

  const handleCreateService = useCallback(async (data: Omit<Product, "id">) => {
    const fd = new FormData()
    fd.set("name", data.name)
    fd.set("price", String(data.price))
    fd.set("categoryId", data.category)
    fd.set("isService", "true")
    const r = await createProduct(fd)
    if (r.success) {
      router.refresh()
      setServices((prev) => [...prev, r.data as Product])
      toast.success("Service created")
    } else {
      toast.error(r.error)
      throw new Error(r.error)
    }
  }, [router])

  const handleUpdateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, "id">>) => {
    const fd = new FormData()
    if (updates.name) fd.set("name", updates.name)
    if (updates.price != null) fd.set("price", String(updates.price))
    if (updates.category) fd.set("categoryId", updates.category)
    const r = await updateProduct(id, fd)
    if (r.success) {
      router.refresh()
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
      toast.success("Product updated")
    } else {
      toast.error(r.error)
      throw new Error(r.error)
    }
  }, [router])

  const handleUpdateService = useCallback(async (id: string, updates: Partial<Omit<Product, "id">>) => {
    const fd = new FormData()
    if (updates.name) fd.set("name", updates.name)
    if (updates.price != null) fd.set("price", String(updates.price))
    if (updates.category) fd.set("categoryId", updates.category)
    fd.set("isService", "true")
    const r = await updateProduct(id, fd)
    if (r.success) {
      router.refresh()
      setServices((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
      toast.success("Service updated")
    } else {
      toast.error(r.error)
      throw new Error(r.error)
    }
  }, [router])

  const handleDeleteProduct = useCallback(async () => {
    if (!deleteProductTarget) return
    const r = await deleteProduct(deleteProductTarget.id)
    if (r.success) {
      router.refresh()
      setProducts((prev) => prev.filter((p) => p.id !== deleteProductTarget.id))
      setServices((prev) => prev.filter((s) => s.id !== deleteProductTarget.id))
      setDeleteProductTarget(null)
      toast.success("Deleted")
    } else {
      toast.error(r.error)
    }
  }, [deleteProductTarget, router])

  const handleCreateCategory = useCallback(async (data: Omit<Category, "id">) => {
    const fd = new FormData()
    fd.set("name", data.name)
    fd.set("icon", data.icon)
    if (data.parentId) fd.set("parentId", data.parentId)
    if (data.type) fd.set("type", data.type)
    const r = await createCategory(fd)
    if (r.success) {
      router.refresh()
      const newCat = r.data as Category
      setCategories((prev) => [...prev, newCat])
    } else {
      throw new Error(r.error)
    }
  }, [router])

  const handleUpdateCategory = useCallback(async (id: string, data: Partial<Omit<Category, "id">>) => {
    const fd = new FormData()
    if (data.name) fd.set("name", data.name)
    if (data.icon) fd.set("icon", data.icon)
    if (data.parentId !== undefined) fd.set("parentId", data.parentId ?? "")
    if (data.type) fd.set("type", data.type)
    const r = await updateCategory(id, fd)
    if (r.success) {
      router.refresh()
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
    } else {
      throw new Error(r.error)
    }
  }, [router])

  const handleDeleteCategory = useCallback(async () => {
    if (!deleteCategoryTarget) return
    const r = await deleteCategory(deleteCategoryTarget.id)
    if (r.success) {
      router.refresh()
      setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryTarget.id))
      setDeleteCategoryTarget(null)
      toast.success("Category deleted")
    } else {
      toast.error(r.error)
    }
  }, [deleteCategoryTarget, router])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products & Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} product{products.length !== 1 && "s"} across {roots.length} categor{roots.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Button
          onClick={() => {
            if (activeTab === "products" || activeTab === "services") {
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
          {activeTab === "products"
            ? "Add Product"
            : activeTab === "services"
              ? "Add Service"
              : "Add Category"}
        </Button>
      </div>

      <div className="flex items-center gap-4 border-b border-border">
        <button
          onClick={() => { setActiveTab("products"); setSearchQuery("") }}
          className={cn("pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === "products" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          Products <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs">{products.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab("services"); setSearchQuery("") }}
          className={cn("pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === "services" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          Services <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs">{services.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab("categories"); setSearchQuery("") }}
          className={cn("pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === "categories" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          Categories <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs">{categories.filter((c) => c.id !== "all").length}</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "products"
                ? "Search products..."
                : activeTab === "services"
                  ? "Search services..."
                  : "Search categories..."
            }
            className="pl-10 bg-card border-border"
          />
        </div>
        {activeTab === "products" && (
          <div className="flex gap-1.5 overflow-x-auto rounded-lg bg-card border border-border p-1">
            <button onClick={() => setActiveCategory("all")} className={cn("rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap", activeCategory === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              All Items <span className="ml-1.5 opacity-60">{products.length}</span>
            </button>
              {roots.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap", (activeCategory === cat.id || getChildren(cat.id).some((c) => c.id === activeCategory)) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {toTitleCase(cat.name)} <span className="ml-1.5 opacity-60">{categoryCount(cat.id)}</span>
              </button>
            ))}
          </div>
        )}
        {activeTab === "services" && (
          <div className="flex gap-1.5 overflow-x-auto rounded-lg bg-card border border-border p-1">
            <button onClick={() => setActiveServiceCategory("all")} className={cn("rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap", activeServiceCategory === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              All Services <span className="ml-1.5 opacity-60">{services.length}</span>
            </button>
            {serviceRoots.map((cat) => (
              <button key={cat.id} onClick={() => setActiveServiceCategory(cat.id)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap", (activeServiceCategory === cat.id || getChildren(cat.id).some((c) => c.id === activeServiceCategory)) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {toTitleCase(cat.name)} <span className="ml-1.5 opacity-60">{serviceCategoryCount(cat.id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === "products" && (() => {
        const activeRoot = roots.find((r) => r.id === activeCategory)
        const activeChildParent = roots.find((r) => getChildren(r.id).some((c) => c.id === activeCategory))
        const parentToShow = activeRoot || activeChildParent
        const childrenToShow = parentToShow ? getChildren(parentToShow.id) : []
        if (childrenToShow.length === 0) return null
        return (
          <div className="flex gap-1.5 overflow-x-auto">
            <button onClick={() => setActiveCategory(parentToShow!.id)} className={cn("rounded-full px-3 py-1 text-xs font-medium border whitespace-nowrap", activeCategory === parentToShow!.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              All {toTitleCase(parentToShow!.name)}
            </button>
            {childrenToShow.map((child) => (
              <button key={child.id} onClick={() => setActiveCategory(child.id)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border whitespace-nowrap", activeCategory === child.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                {toTitleCase(child.name)} <span className="opacity-60">{categoryCount(child.id)}</span>
              </button>
            ))}
          </div>
        )
      })()}

      {activeTab === "services" && (() => {
        const activeRoot = serviceRoots.find((r) => r.id === activeServiceCategory)
        const activeChildParent = serviceRoots.find((r) => getChildren(r.id).some((c) => c.id === activeServiceCategory))
        const parentToShow = activeRoot || activeChildParent
        const childrenToShow = parentToShow ? getChildren(parentToShow.id) : []
        if (childrenToShow.length === 0) return null
        return (
          <div className="flex gap-1.5 overflow-x-auto">
            <button onClick={() => setActiveServiceCategory(parentToShow!.id)} className={cn("rounded-full px-3 py-1 text-xs font-medium border whitespace-nowrap", activeServiceCategory === parentToShow!.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              All {toTitleCase(parentToShow!.name)}
            </button>
            {childrenToShow.map((child) => (
              <button key={child.id} onClick={() => setActiveServiceCategory(child.id)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border whitespace-nowrap", activeServiceCategory === child.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                {toTitleCase(child.name)} <span className="opacity-60">{serviceCategoryCount(child.id)}</span>
              </button>
            ))}
          </div>
        )
      })()}

      {activeTab === "products" && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Price</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">{toTitleCase(product.name)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{getCategoryBreadcrumb(product.category)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditProduct(product); setProductModalOpen(true) }} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteProductTarget(product)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length > 0 && productTotalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card">
              <p className="text-sm text-muted-foreground">
                Showing {(productPage - 1) * PAGE_SIZE + 1}-{Math.min(productPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                  disabled={productPage <= 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">
                  Page {productPage} / {productTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProductPage((p) => Math.min(productTotalPages, p + 1))}
                  disabled={productPage >= productTotalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              </div>
            )}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mb-2" />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </>
      )}

      {activeTab === "services" && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Service</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Price</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedServices.map((service) => (
                  <tr key={service.id} className="hover:bg-secondary/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">{toTitleCase(service.name)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{getCategoryBreadcrumb(service.category)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold">{formatCurrency(service.price)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditProduct(service); setProductModalOpen(true) }} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteProductTarget(service)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredServices.length > 0 && serviceTotalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card">
                <p className="text-sm text-muted-foreground">
                  Showing {(servicePage - 1) * PAGE_SIZE + 1}-{Math.min(servicePage * PAGE_SIZE, filteredServices.length)} of {filteredServices.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServicePage((p) => Math.max(1, p - 1))}
                    disabled={servicePage <= 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-2">
                    Page {servicePage} / {serviceTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServicePage((p) => Math.min(serviceTotalPages, p + 1))}
                    disabled={servicePage >= serviceTotalPages}
                    className="h-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          {filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Wrench className="h-8 w-8 mb-2" />
              <p className="text-sm">No services found</p>
            </div>
          )}
        </>
      )}

      {activeTab === "categories" && (
        <>
          <div className="space-y-4">
            {filteredRoots.map((root) => {
              const RootIcon = getCategoryIcon(root.icon)
              const children = getChildren(root.id)
              const totalCount = (root.type ?? "product") === "service" ? serviceCategoryCount(root.id) : categoryCount(root.id)
              return (
                <div key={root.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <RootIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{toTitleCase(root.name)}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{totalCount} {(root.type ?? "product") === "service" ? "service" : "product"}{totalCount !== 1 && "s"}{children.length > 0 && ` · ${children.length} subcategor${children.length !== 1 ? "ies" : "y"}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditCategoryTarget(null); setParentCategoryTarget(root); setCategoryModalOpen(true) }} className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary"><Plus className="h-3.5 w-3.5" /> Sub</button>
                      <button onClick={() => { setEditCategoryTarget(root); setParentCategoryTarget(null); setCategoryModalOpen(true) }} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteCategoryTarget(root)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {children.length > 0 && (
                    <div className="border-t border-border divide-y divide-border">
                      {children.map((child) => {
                        const ChildIcon = getCategoryIcon(child.icon)
                        const childCount = (child.type ?? "product") === "service"
                          ? services.filter((p) => p.category === child.id).length
                          : products.filter((p) => p.category === child.id).length
                        return (
                          <div key={child.id} className="flex items-center justify-between px-5 py-3 pl-[72px] bg-secondary/20">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                                <ChildIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{toTitleCase(child.name)}</p>
                                <p className="text-xs text-muted-foreground">{childCount} {(child.type ?? "product") === "service" ? "service" : "product"}{childCount !== 1 && "s"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditCategoryTarget(child); setParentCategoryTarget(null); setCategoryModalOpen(true) }} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"><Pencil className="h-3 w-3" /></button>
                              <button onClick={() => setDeleteCategoryTarget(child)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          </div>
                        )
                      })}
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
            </div>
          )}
        </>
      )}

      <CreateProductModal
        currency={currency}
        open={productModalOpen}
        onClose={() => { setProductModalOpen(false); setEditProduct(null) }}
        editProduct={editProduct}
        roots={activeTab === "services" ? serviceRoots : productRoots}
        leaves={activeTab === "services" ? serviceLeaves : productLeaves}
        getChildren={getChildren}
        onProductCreate={activeTab === "services" ? handleCreateService : handleCreateProduct}
        onProductUpdate={activeTab === "services" ? handleUpdateService : handleUpdateProduct}
        isService={activeTab === "services"}
      />

      <CategoryModal
        open={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setEditCategoryTarget(null); setParentCategoryTarget(null) }}
        editCategory={editCategoryTarget}
        parentCategory={parentCategoryTarget}
        roots={roots}
        onCreate={handleCreateCategory}
        onUpdate={handleUpdateCategory}
      />

      <ConfirmDialog
        open={!!deleteProductTarget}
        onOpenChange={(o) => !o && setDeleteProductTarget(null)}
        title="Delete product"
        description={
          <p>Delete product &quot;{deleteProductTarget ? toTitleCase(deleteProductTarget.name) : ""}&quot;? This action cannot be undone.</p>
        }
        icon={<Trash2 className="h-6 w-6" />}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteProduct}
      />

      <ConfirmDialog
        open={!!deleteCategoryTarget}
        onOpenChange={(o) => !o && setDeleteCategoryTarget(null)}
        title="Delete category"
        description={
          <p>
            Delete category &quot;{deleteCategoryTarget ? toTitleCase(deleteCategoryTarget.name) : ""}&quot;?
            {getChildren(deleteCategoryTarget?.id ?? "").length > 0 && " All subcategories will also be deleted."}
            This action cannot be undone.
          </p>
        }
        icon={<Trash2 className="h-6 w-6" />}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteCategory}
      />
    </div>
  )
}
