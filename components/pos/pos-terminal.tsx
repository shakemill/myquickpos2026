"use client"

import { useState, useMemo, useCallback } from "react"
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
import { toast } from "sonner"

export function PosTerminal() {
  const { products: allProducts } = useProducts()
  const { getDescendantIds } = useCategories()
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [lastCart, setLastCart] = useState<CartItem[]>([])

  const filteredProducts = useMemo(() => {
    let result = allProducts
    if (activeCategory !== "all") {
      const ids = getDescendantIds(activeCategory)
      result = result.filter((p) => ids.includes(p.category))
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(query))
    }
    return result
  }, [activeCategory, searchQuery, allProducts, getDescendantIds])

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
    return subtotal + subtotal * 0.08
  }, [cart])

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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PosHeader onSearch={setSearchQuery} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="px-5 pt-4 pb-3">
            <CategoryBar
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          <ScrollArea className="flex-1 px-5 pb-5">
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-sm">No products found</p>
                <p className="text-xs mt-1">Try a different category or search</p>
              </div>
            )}
          </ScrollArea>
        </div>

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
              toast.info("Order held", { description: "You can resume this order later." })
            }
            onDiscount={() =>
              toast.info("Discount", { description: "Discount feature coming soon." })
            }
            onReceipt={handleReceiptQuickAction}
            onRefund={() =>
              toast.info("Refund", { description: "Refund feature coming soon." })
            }
          />
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={total}
        cart={cart}
        completedOrderCart={lastCart}
        taxRate={8}
        terminalName="Quick Terminal"
        cashierName="Cashier"
        onPaymentComplete={handlePaymentComplete}
      />

      <ReceiptPreviewModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        cart={lastCart}
        taxRate={8}
        paymentMethod="Card"
        terminalName="Quick Terminal"
        cashierName="Cashier"
      />
    </div>
  )
}
