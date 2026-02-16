"use client"

import type { Product } from "@/lib/pos-data"
import { Plus } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onAddToCart(product)}
          className="group relative flex flex-col items-start rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-card/80 active:scale-[0.97] touch-manipulation select-none min-h-[120px]"
        >
          <div className="flex w-full items-start justify-between">
            <span className="text-sm font-semibold text-card-foreground leading-tight">
              {product.name}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Plus className="h-4 w-4" />
            </div>
          </div>
          <span className="mt-auto pt-3 text-lg font-bold text-primary font-mono">
            ${product.price.toFixed(2)}
          </span>
        </button>
      ))}
    </div>
  )
}
