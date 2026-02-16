"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePrinter } from "@/hooks/use-printer"
import { Printer, X, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/lib/pos-data"

interface ReceiptPreviewModalProps {
  open: boolean
  onClose: () => void
  cart: CartItem[]
  taxRate: number
  paymentMethod?: string
  terminalName?: string
  cashierName?: string
}

export function ReceiptPreviewModal({
  open,
  onClose,
  cart,
  taxRate,
  paymentMethod = "Card",
  terminalName = "Terminal",
  cashierName = "Cashier",
}: ReceiptPreviewModalProps) {
  const { config } = usePrinter()
  const receiptRef = useRef<HTMLDivElement>(null)
  const [printing, setPrinting] = useState(false)
  const [printed, setPrinted] = useState(false)

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const orderNo = "#" + String(Math.floor(Math.random() * 9000) + 1000)

  const paperWidthPx = config.paperWidth === "58mm" ? 220 : 300

  useEffect(() => {
    if (open) {
      setPrinting(false)
      setPrinted(false)
    }
  }, [open])

  const handlePrint = useCallback(() => {
    setPrinting(true)
    setTimeout(() => {
      setPrinting(false)
      setPrinted(true)
    }, 2200)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-card-foreground text-base font-semibold">
              Receipt Preview
            </DialogTitle>
            <span className="text-xs text-muted-foreground font-mono">
              {config.paperWidth}
            </span>
          </div>
        </DialogHeader>

        <div className="flex justify-center bg-secondary/30 py-6 px-4 max-h-[60vh] overflow-y-auto">
          <div
            ref={receiptRef}
            className={cn(
              "bg-white text-black shadow-lg relative",
              "font-mono text-[11px] leading-[1.35]",
              printing && "animate-receipt-print"
            )}
            style={{
              width: paperWidthPx,
              padding: config.paperWidth === "58mm" ? "12px 8px" : "16px 14px",
            }}
          >
            {config.headerHtml && (
              <div
                className="receipt-preview text-center mb-1"
                dangerouslySetInnerHTML={{ __html: config.headerHtml }}
              />
            )}

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="flex justify-between text-[10px] text-gray-600">
              <span>{dateStr}</span>
              <span>{timeStr}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
              <span>Order {orderNo}</span>
              <span>{terminalName}</span>
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5">
              Cashier: {cashierName}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              <span className="flex-1">Item</span>
              <span className="w-8 text-center">Qty</span>
              <span className="w-14 text-right">Price</span>
            </div>

            <div className="space-y-0.5">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span className="flex-1 truncate pr-1">{item.product.name}</span>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <span className="w-14 text-right">
                    {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center text-gray-400 py-3 text-[10px]">
                No items
              </div>
            )}

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax ({taxRate}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 my-1" />
              <div className="flex justify-between font-bold text-[13px]">
                <span>TOTAL</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Payment</span>
              <span className="font-semibold">{paymentMethod}</span>
            </div>

            {config.footerHtml && (
              <>
                <div className="border-t border-dashed border-gray-400 my-2" />
                <div
                  className="receipt-preview text-center"
                  dangerouslySetInnerHTML={{ __html: config.footerHtml }}
                />
              </>
            )}

            <div
              className="absolute bottom-0 left-0 right-0 h-3 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, white 33.33%, transparent 33.33%), linear-gradient(225deg, white 33.33%, transparent 33.33%)",
                backgroundSize: "8px 100%",
                backgroundPosition: "bottom",
              }}
            />
            <div className="h-3" />
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-border">
          {printed ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm font-medium text-primary py-3">
              <CheckCircle2 className="h-4 w-4" />
              Sent to printer
            </div>
          ) : (
            <button
              onClick={handlePrint}
              disabled={printing}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all touch-manipulation select-none",
                printing
                  ? "bg-muted text-muted-foreground cursor-wait"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
              )}
            >
              {printing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Printing...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors touch-manipulation select-none"
          >
            <X className="h-4 w-4 mr-1.5" />
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
