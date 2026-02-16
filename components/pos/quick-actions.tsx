"use client"

import { Receipt, Percent, Clock, RotateCcw } from "lucide-react"

interface QuickActionsProps {
  onHoldOrder: () => void
  onDiscount: () => void
  onReceipt: () => void
  onRefund: () => void
}

export function QuickActions({
  onHoldOrder,
  onDiscount,
  onReceipt,
  onRefund,
}: QuickActionsProps) {
  const actions = [
    { icon: Clock, label: "Hold", onClick: onHoldOrder },
    { icon: Percent, label: "Discount", onClick: onDiscount },
    { icon: Receipt, label: "Receipt", onClick: onReceipt },
    { icon: RotateCcw, label: "Refund", onClick: onRefund },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 text-muted-foreground transition-all hover:border-primary/30 hover:text-card-foreground active:scale-[0.97] touch-manipulation select-none"
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}
