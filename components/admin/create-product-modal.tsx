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
import { ShoppingBag, ChevronDown } from "lucide-react"
import type { Product, Category } from "@/lib/pos-data"
import { getCurrencySymbol } from "@/lib/format-currency"
import { toTitleCase } from "@/lib/utils"

interface CreateProductModalProps {
  currency?: string
  open: boolean
  onClose: () => void
  editProduct?: Product | null
  roots: Category[]
  leaves: Category[]
  getChildren: (parentId: string) => Category[]
  products?: Product[]
  onProductCreate?: (data: Omit<Product, "id">) => void | Promise<void>
  onProductUpdate?: (id: string, data: Partial<Omit<Product, "id">>) => void | Promise<void>
  /** When true, modal is for services (title and category list are for services). */
  isService?: boolean
}

export function CreateProductModal({
  currency = "USD",
  open,
  onClose,
  editProduct,
  roots,
  leaves,
  getChildren,
  onProductCreate,
  onProductUpdate,
  isService = false,
}: CreateProductModalProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const isEdit = !!editProduct

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name)
      setPrice(editProduct.price.toString())
      setCategory(editProduct.category)
    } else {
      setName("")
      setPrice("")
      setCategory(leaves[0]?.id ?? "")
    }
  }, [editProduct, leaves, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price.trim() || !category || loading) return

    const parsed = parseFloat(price)
    if (isNaN(parsed) || parsed <= 0) return

    setLoading(true)
    try {
      if (isEdit && editProduct && onProductUpdate) {
        await onProductUpdate(editProduct.id, { name: name.trim(), price: parsed, category })
      } else if (!isEdit && onProductCreate) {
        await onProductCreate({ name: name.trim(), price: parsed, category })
      }
      reset()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setName("")
    setPrice("")
    setCategory(leaves[0]?.id ?? "")
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEdit ? (isService ? "Edit Service" : "Edit Product") : isService ? "Add Service" : "Add New Product"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? (isService ? "Update service details below." : "Update product details below.")
              : isService ? "Fill in the service details to add it to your catalog." : "Fill in the product details to add it to your catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="product-name" className="text-sm font-medium text-card-foreground">
              {isService ? "Service Name" : "Product Name"}
            </Label>
            <div className="relative">
              <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Classic Burger"
                className="pl-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price" className="text-sm font-medium text-card-foreground">
              Price ({getCurrencySymbol(currency)})
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {getCurrencySymbol(currency)}
              </span>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99"
                className="pl-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category" className="text-sm font-medium text-card-foreground">
              Category
            </Label>
            <div className="relative">
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-secondary pl-3 pr-8 text-sm text-card-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {roots.map((root) => {
                  const children = getChildren(root.id)
                  if (children.length === 0) {
                    // Leaf root -- directly selectable
                    return (
                      <option key={root.id} value={root.id}>
                        {toTitleCase(root.name)}
                      </option>
                    )
                  }
                  // Parent with children -- show as optgroup
                  return (
                    <optgroup key={root.id} label={toTitleCase(root.name)}>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {toTitleCase(child.name)}
                        </option>
                      ))}
                    </optgroup>
                  )
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : isService ? "Add Service" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
