"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  Receipt,
  Star,
  User,
  Search,
  X,
  Gift,
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
type PaymentStep = "customer" | "method" | "processing" | "complete"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  tier: string
}

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

// Mock customers data (in real app, this would come from API)
const mockCustomers: Customer[] = [
  { id: "1", name: "John Smith", email: "john@example.com", phone: "555-0101", loyaltyPoints: 2450, tier: "Gold" },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "555-0102", loyaltyPoints: 1890, tier: "Silver" },
  { id: "3", name: "Mike Chen", email: "mike@example.com", phone: "555-0103", loyaltyPoints: 540, tier: "Bronze" },
  { id: "4", name: "Emma Davis", email: "emma@example.com", phone: "555-0104", loyaltyPoints: 3200, tier: "Platinum" },
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
  const [step, setStep] = useState<PaymentStep>("customer")
  const [cashAmount, setCashAmount] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState("")
  const [earnedPoints, setEarnedPoints] = useState(0)

  useEffect(() => {
    if (open) {
      // Calculate points to be earned (1 point per dollar)
      const points = Math.floor(total)
      setEarnedPoints(points)
    }
  }, [open, total])

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setStep("method")
  }

  const handleSkipCustomer = () => {
    setSelectedCustomer(null)
    setStep("method")
  }

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
    setStep("customer")
    setCashAmount("")
    setSelectedCustomer(null)
    setCustomerSearch("")
    onPaymentComplete()
  }

  const handleClose = () => {
    setMethod(null)
    setStep("customer")
    setCashAmount("")
    setSelectedCustomer(null)
    setCustomerSearch("")
    onClose()
  }

  const handleViewReceipt = () => {
    setShowReceipt(true)
  }

  const filteredCustomers = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  )

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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum": return "text-purple-600 bg-purple-100 dark:bg-purple-950"
      case "Gold": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-950"
      case "Silver": return "text-gray-600 bg-gray-100 dark:bg-gray-800"
      case "Bronze": return "text-orange-600 bg-orange-100 dark:bg-orange-950"
      default: return "text-muted-foreground bg-muted"
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {step === "complete" ? "Payment Successful" : step === "customer" ? "Customer Lookup" : "Payment"}
            </DialogTitle>
          </DialogHeader>

          {/* Customer Lookup Step */}
          {step === "customer" && (
            <div className="space-y-4">
              {selectedCustomer && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{selectedCustomer.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold", getTierColor(selectedCustomer.tier))}>
                            <Star className="h-3 w-3 fill-current" />
                            {selectedCustomer.tier}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {selectedCustomer.loyaltyPoints.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="rounded-lg p-1 hover:bg-secondary transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">+{earnedPoints} points</span>
                    <span className="text-muted-foreground">will be earned</span>
                  </div>
                </div>
              )}

              {!selectedCustomer && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search by name, phone, or email..."
                      className="pl-9 h-11"
                    />
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="w-full rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-secondary/50 active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </div>
                          <div className="text-right">
                            <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-bold", getTierColor(customer.tier))}>
                              {customer.tier}
                            </span>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {customer.loyaltyPoints.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} pts
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && customerSearch && (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No customers found
                      </p>
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
                <p className="text-4xl font-bold text-primary font-mono">
                  ${total.toFixed(2)}
                </p>
              </div>

              <Button
                onClick={handleSkipCustomer}
                className="w-full h-12 text-base font-bold"
                size="lg"
              >
                Continue to Payment
              </Button>
            </div>
          )}

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

              {selectedCustomer && (
                <div className="w-full rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <Star className="h-5 w-5 text-primary fill-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{selectedCustomer.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg font-bold text-primary">+{earnedPoints}</span>
                        <span className="text-xs text-muted-foreground">points earned</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    New balance: {(selectedCustomer.loyaltyPoints + earnedPoints).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} points
                  </div>
                </div>
              )}

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
