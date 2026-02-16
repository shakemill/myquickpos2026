"use client"

import { useState, useMemo, useCallback } from "react"
import { useTerminals } from "@/hooks/use-terminals"
import { useProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import type { CartItem, Product } from "@/lib/pos-data"
import { PosHeader } from "./pos-header"
import { CategoryBar } from "./category-bar"
import { ProductGrid } from "./product-grid"
import { OrderPanel } from "./order-panel"
import { PaymentModal } from "./payment-modal"
import { QuickActions } from "./quick-actions"
import { ReceiptPreviewModal } from "./receipt-preview-modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster, toast } from "sonner"
import { Monitor, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PosTerminalViewProps {
  terminalId: string
}

export function PosTerminalView({ terminalId }: PosTerminalViewProps) {
  const { terminals } = useTerminals()
  const { products: allProducts } = useProducts()
  const { getDescendantIds } = useCategories()
  const terminal = terminals.find((t) => t.id === terminalId)

  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [lastPaymentMethod, setLastPaymentMethod] = useState("Card")

  const assignedCategories = terminal?.assignedCategories ?? []
  const taxRate = terminal?.taxRate ?? 8

  const terminalProducts = useMemo(() => {
    if (!terminal) return []
    if (assignedCategories.length === 0) return allProducts
    return allProducts.filter((p) => assignedCategories.includes(p.category))
  }, [terminal, assignedCategories, allProducts])

  const filteredProducts = useMemo(() => {
    let result = terminalProducts
    if (activeCategory !== "all") {
      const ids = getDescendantIds(activeCategory)
      result = result.filter((p) => ids.includes(p.category))
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(query))
    }
    return result
  }, [activeCategory, searchQuery, terminalProducts, getDescendantIds])

  // keep a copy of last completed order for receipt reprint
  const [lastCart, setLastCart] = useState<CartItem[]>([])

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return
    setPaymentOpen(true)
  }, [cart.length])

  const total = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    return subtotal + subtotal * (taxRate / 100)
  }, [cart, taxRate])

  const handlePaymentComplete = useCallback(() => {
    setLastCart([...cart])
    setPaymentOpen(false)
    setCart([])
    toast.success("Order completed successfully!", {
      description: "Receipt is ready to print.",
    })
  }, [cart])

  const handleReceiptQuickAction = useCallback(() => {
    if (lastCart.length > 0) {
      setReceiptOpen(true)
    } else {
      toast.info("No recent order", {
        description: "Complete a sale to generate a receipt.",
      })
    }
  }, [lastCart.length])

  if (!terminal) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <Monitor className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Terminal Not Found</h1>
        <p className="text-sm text-muted-foreground">
          The terminal &quot;{terminalId}&quot; does not exist.
        </p>
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          className: "bg-card text-card-foreground border-border",
        }}
      />
      <PosHeader
        onSearch={setSearchQuery}
        terminalName={terminal.name}
        cashierName={terminal.cashier}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Product selection area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="px-5 pt-4 pb-3">
            <CategoryBar
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              allowedCategories={assignedCategories.length > 0 ? assignedCategories : undefined}
            />
          </div>

          <ScrollArea className="flex-1 px-5 pb-5">
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-sm">No products found</p>
                <p className="text-xs mt-1">
                  Try a different category or search
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right: Order panel */}
        <div className="flex w-[380px] flex-col gap-3 border-l border-border bg-background p-3">
          <div className="flex-1 overflow-hidden">
            <OrderPanel
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
              onCheckout={handleCheckout}
            />
          </div>
          <QuickActions
            onHoldOrder={() =>
              toast.info("Order held", {
                description: "You can resume this order later.",
              })
            }
            onDiscount={() =>
              toast.info("Discount", {
                description: "Discount feature coming soon.",
              })
            }
            onReceipt={handleReceiptQuickAction}
            onRefund={() =>
              toast.info("Refund", {
                description: "Refund feature coming soon.",
              })
            }
          />
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={total}
        cart={cart}
        taxRate={taxRate}
        terminalName={terminal.name}
        cashierName={terminal.cashier}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Receipt reprint from quick action */}
      <ReceiptPreviewModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        cart={lastCart}
        taxRate={taxRate}
        paymentMethod={lastPaymentMethod}
        terminalName={terminal.name}
        cashierName={terminal.cashier}
      />
    </div>
  )
}
