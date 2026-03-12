"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreditCard, Banknote, Smartphone, Loader2 } from "lucide-react"
import { completeTableOrder } from "@/app/actions/table-orders"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { toTitleCase } from "@/lib/utils"

export interface PendingTableOrder {
  id: string
  orderNumber: string
  orderLabel: string | null
  total: number
  createdAt: Date
  table: { id: string; name: string; slug: string } | null
  items: {
    productId: string
    quantity: number
    unitPrice: number
    total: number
    product: { name: string }
  }[]
}

interface TableOrderPaymentModalProps {
  open: boolean
  onClose: () => void
  order: PendingTableOrder | null
  formatCurrency: (amount: number) => string
}

const paymentOptions = [
  { id: "Card", label: "Carte", icon: CreditCard },
  { id: "Cash", label: "Espèces", icon: Banknote },
  { id: "MTN Money", label: "MTN Money", icon: Smartphone },
  { id: "Orange Money", label: "Orange Money", icon: Smartphone },
]

export function TableOrderPaymentModal({
  open,
  onClose,
  order,
  formatCurrency,
}: TableOrderPaymentModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const currentUserName = (session?.user as { name?: string } | undefined)?.name ?? ""
  const [paymentMethod, setPaymentMethod] = useState("Card")
  const [cashierName, setCashierName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && currentUserName) {
      setCashierName(currentUserName)
    }
  }, [open, currentUserName])

  const handleComplete = async () => {
    if (!order) return
    setSubmitting(true)
    const result = await completeTableOrder({
      orderId: order.id,
      paymentMethod,
      cashierName: cashierName.trim() || null,
    })
    setSubmitting(false)
    if (result.success) {
      toast.success("Commande réglée", { description: `${order.orderNumber} enregistrée.` })
      onClose()
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const label = order ? (order.orderLabel || order.table?.name || order.orderNumber) : ""

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] flex flex-col max-w-md">
        <DialogHeader>
          <DialogTitle>Régler la commande table</DialogTitle>
        </DialogHeader>
        {order && (
          <>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">
                {order.orderNumber} — {label}
              </p>
              <p className="text-muted-foreground">
                {new Date(order.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <ScrollArea className="max-h-[200px] rounded-md border p-3">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.quantity}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.quantity}× {toTitleCase(item.product.name)}
                    </span>
                    <span className="font-mono">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(order.total)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Mode de paiement
              </label>
              <div className="flex flex-wrap gap-2">
                {paymentOptions.map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={paymentMethod === opt.id ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setPaymentMethod(opt.id)}
                  >
                    <opt.icon className="mr-1.5 h-4 w-4" />
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="table-order-cashier" className="text-sm font-medium text-muted-foreground">
                Caissier
              </label>
              <Input
                id="table-order-cashier"
                value={cashierName}
                readOnly
                className="h-9 bg-muted"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleComplete}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                "Régler"
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
