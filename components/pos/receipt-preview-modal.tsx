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

export type ReceiptPrinterConfig = {
  paperWidth: "58mm" | "80mm"
  headerHtml: string
  footerHtml: string
}

interface ReceiptPreviewModalProps {
  open: boolean
  onClose: () => void
  cart: CartItem[]
  taxRate: number
  formatCurrency: (amount: number) => string
  paymentMethod?: string
  terminalName?: string
  cashierName?: string
  /** When provided (e.g. from tenant settings), overrides usePrinter() config for this modal */
  printerConfig?: ReceiptPrinterConfig
}

export function ReceiptPreviewModal({
  open,
  onClose,
  cart,
  taxRate,
  formatCurrency,
  paymentMethod = "Card",
  terminalName = "Terminal",
  cashierName = "Cashier",
  printerConfig: printerConfigProp,
}: ReceiptPreviewModalProps) {
  const { config: storeConfig } = usePrinter()
  const config = printerConfigProp ?? storeConfig
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
          {/* Ticket thermal format pro : 58mm / 80mm, mise en page soignée */}
          <div
            ref={receiptRef}
            className={cn(
              "bg-white text-black shadow-lg relative receipt-thermal-pro",
              "font-mono leading-snug",
              config.paperWidth === "58mm" ? "text-[10px]" : "text-[11px]",
              printing && "animate-receipt-print"
            )}
            style={{
              width: paperWidthPx,
              padding: config.paperWidth === "58mm" ? "14px 10px" : "18px 16px",
            }}
          >
            {/* En-tête commerce */}
            {config.headerHtml && (
              <div
                className="receipt-preview text-center mb-2 text-[inherit]"
                dangerouslySetInnerHTML={{ __html: config.headerHtml }}
              />
            )}

            <div className="border-t-2 border-black my-2" />

            {/* Infos commande */}
            <div className="text-center mb-2">
              <p className="font-bold uppercase tracking-wide text-[0.95em]">{orderNo}</p>
              <p className="text-[0.9em] text-gray-700">{dateStr} · {timeStr}</p>
              <p className="text-[0.9em] text-gray-700">{terminalName} · Caissier: {cashierName}</p>
            </div>

            <div className="border-t border-dashed border-gray-500 my-2" />

            {/* Colonnes articles */}
            <div className="flex justify-between font-bold uppercase tracking-wide text-[0.9em] mb-1 text-gray-700">
              <span className="flex-1 min-w-0">Article</span>
              <span className="w-6 text-center shrink-0">Qté</span>
              <span className="w-12 text-right shrink-0">Montant</span>
            </div>

            <div className="space-y-0.5 mb-2">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between gap-1">
                  <span className="flex-1 min-w-0 truncate">{item.product.name}</span>
                  <span className="w-6 text-center shrink-0">{item.quantity}</span>
                  <span className="w-12 text-right shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center text-gray-500 py-2 text-[0.9em]">
                Aucun article
              </div>
            )}

            <div className="border-t border-dashed border-gray-500 my-2" />

            {/* Totaux */}
            <div className="space-y-0.5 text-[0.95em]">
              <div className="flex justify-between">
                <span>Sous-total ({itemCount} art.)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {(taxRate ?? 0) > 0 ? (
                <div className="flex justify-between text-gray-700">
                  <span>TVA ({taxRate}%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-gray-600">
                  <span>TVA</span>
                  <span>—</span>
                </div>
              )}
              <div className="border-t-2 border-black my-1.5" />
              <div className="flex justify-between font-bold text-[1.05em]">
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-500 my-2" />

            <div className="flex justify-between text-[0.95em]">
              <span className="text-gray-700">Paiement</span>
              <span className="font-semibold">{paymentMethod}</span>
            </div>

            {config.footerHtml && (
              <>
                <div className="border-t border-dashed border-gray-500 my-2" />
                <div
                  className="receipt-preview text-center text-[0.9em]"
                  dangerouslySetInnerHTML={{ __html: config.footerHtml }}
                />
              </>
            )}

            <div
              className="absolute bottom-0 left-0 right-0 h-3 pointer-events-none opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, transparent, transparent 2px, #999 2px, #999 3px)",
              }}
            />
            <div className="h-3" />
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-border">
          {printed ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm font-medium text-primary py-3">
              <CheckCircle2 className="h-4 w-4" />
              Envoyé à l&apos;imprimante
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
                  Impression…
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Imprimer ticket (thermal)
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors touch-manipulation select-none"
          >
            <X className="h-4 w-4 mr-1.5" />
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
