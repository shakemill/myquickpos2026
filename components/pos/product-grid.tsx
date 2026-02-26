"use client"

import type { Product } from "@/lib/pos-data"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  formatCurrency: (amount: number) => string
}

export function ProductGrid({ products, onAddToCart, formatCurrency }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const stock = product.stock ?? null
        const isOutOfStock = stock !== null && stock <= 0
        const isLowStock = stock !== null && stock > 0 && stock <= 5
        return (
          <button
            key={product.id}
            onClick={() => !isOutOfStock && onAddToCart(product)}
            disabled={isOutOfStock}
            className={cn(
              "group relative flex flex-col items-start rounded-xl border border-border bg-card p-4 text-left transition-all touch-manipulation select-none min-h-[120px]",
              isOutOfStock
                ? "opacity-70 cursor-not-allowed"
                : "hover:border-primary/40 hover:bg-card/80 active:scale-[0.97]"
            )}
          >
            <div className="flex w-full items-start justify-between">
              <span className="text-sm font-semibold text-card-foreground leading-tight">
                {product.name}
              </span>
              {!isOutOfStock && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Plus className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="mt-auto pt-3 flex flex-col gap-0.5">
              <span className="text-lg font-bold text-primary font-mono">
                {formatCurrency(product.price)}
              </span>
              {stock !== null && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    isOutOfStock && "text-destructive",
                    isLowStock && !isOutOfStock && "text-amber-600 dark:text-amber-400",
                    !isOutOfStock && !isLowStock && "text-muted-foreground"
                  )}
                >
                  {isOutOfStock ? "Out of stock" : `Stock: ${stock}`}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
