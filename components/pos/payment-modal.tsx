"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  Receipt,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/lib/pos-data"
import { ReceiptPreviewModal } from "./receipt-preview-modal"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  total: number
  cart: CartItem[]
  taxRate: number
  terminalName?: string
  cashierName?: string
  onPaymentComplete: () => void
}

type PaymentMethod = "card" | "cash" | "mobile" | null
type PaymentStep = "method" | "processing" | "complete"

const paymentMethods = [
  {
    id: "card" as const,
    label: "Card",
    icon: CreditCard,
    description: "Credit or Debit",
  },
  {
    id: "cash" as const,
    label: "Cash",
    icon: Banknote,
    description: "Exact or Change",
  },
  {
    id: "mobile" as const,
    label: "Mobile",
    icon: Smartphone,
    description: "Tap to Pay",
  },
]

export function PaymentModal({
  open,
  onClose,
  total,
  cart,
  taxRate,
  terminalName = "Terminal",
  cashierName = "Cashier",
  onPaymentComplete,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>(null)
  const [step, setStep] = useState<PaymentStep>("method")
  const [cashAmount, setCashAmount] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)

  const handleSelectMethod = (m: PaymentMethod) => {
    setMethod(m)
    if (m === "cash") return
    setStep("processing")
    setTimeout(() => {
      setStep("complete")
    }, 1500)
  }

  const handleCashPayment = () => {
    setStep("processing")
    setTimeout(() => {
      setStep("complete")
    }, 1000)
  }

  const handleDone = () => {
    setMethod(null)
    setStep("method")
    setCashAmount("")
    onPaymentComplete()
  }

  const handleClose = () => {
    setMethod(null)
    setStep("method")
    setCashAmount("")
    onClose()
  }

  const handleViewReceipt = () => {
    setShowReceipt(true)
  }

  const cashValue = parseFloat(cashAmount) || 0
  const changeDue = cashValue - total

  const quickCashAmounts = [
    Math.ceil(total),
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
  ].filter((v, i, arr) => arr.indexOf(v) === i && v >= total)

  const methodLabel =
    method === "card" ? "Card" : method === "cash" ? "Cash" : "Mobile Pay"

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {step === "complete" ? "Payment Successful" : "Payment"}
            </DialogTitle>
          </DialogHeader>

          {step === "method" && !method && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-4xl font-bold text-primary font-mono mt-1">
                  ${total.toFixed(2)}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon
                  return (
                    <button
                      key={pm.id}
                      onClick={() => handleSelectMethod(pm.id)}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border p-5 transition-all hover:border-primary/40 hover:bg-secondary/50 active:scale-[0.97] touch-manipulation select-none"
                    >
                      <Icon className="h-8 w-8 text-primary" />
                      <span className="text-sm font-semibold">{pm.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {pm.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === "method" && method === "cash" && (
            <div className="space-y-5">
              <button
                onClick={() => setMethod(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-card-foreground transition-colors touch-manipulation"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-3xl font-bold text-primary font-mono mt-1">
                  ${total.toFixed(2)}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Cash Received
                </label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-4 text-center text-2xl font-bold font-mono text-card-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickCashAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashAmount(amount.toFixed(2))}
                    className={cn(
                      "rounded-lg border border-border px-4 py-2.5 text-sm font-semibold font-mono transition-all touch-manipulation select-none",
                      cashValue === amount
                        ? "border-primary bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground hover:border-primary/40"
                    )}
                  >
                    ${amount.toFixed(2)}
                  </button>
                ))}
              </div>

              {cashValue >= total && (
                <div className="rounded-xl bg-primary/10 p-3 text-center">
                  <p className="text-sm text-muted-foreground">Change Due</p>
                  <p className="text-2xl font-bold text-primary font-mono">
                    ${changeDue.toFixed(2)}
                  </p>
                </div>
              )}

              <button
                onClick={handleCashPayment}
                disabled={cashValue < total}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-all touch-manipulation select-none",
                  cashValue >= total
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Complete Payment
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Processing payment...
              </p>
            </div>
          )}

          {step === "complete" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary font-mono">
                  ${total.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Payment received via {methodLabel}
                </p>
                {method === "cash" && changeDue > 0 && (
                  <p className="text-sm font-semibold text-primary mt-1 font-mono">
                    Change: ${changeDue.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex w-full gap-2 mt-2">
                <button
                  onClick={handleViewReceipt}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3.5 text-sm font-semibold text-card-foreground transition-all hover:bg-secondary active:scale-[0.98] touch-manipulation select-none"
                >
                  <Receipt className="h-4 w-4" />
                  View Receipt
                </button>
                <button
                  onClick={handleDone}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] touch-manipulation select-none"
                >
                  New Order
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ReceiptPreviewModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        cart={cart}
        taxRate={taxRate}
        paymentMethod={methodLabel}
        terminalName={terminalName}
        cashierName={cashierName}
      />
    </>
  )
}
