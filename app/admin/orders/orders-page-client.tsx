"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { formatWithCurrency } from "@/lib/format-currency"
import { Receipt, Search, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"

export interface OrderRow {
  id: string
  orderNumber: string
  createdAt: string
  total: number
  paymentMethod: string
  status: string
  terminalName: string
  customerName: string | null
  cashierName: string | null
  itemCount: number
}

export function OrdersPageClient({
  orders,
  currency,
}: {
  orders: OrderRow[]
  currency: string
}) {
  const [search, setSearch] = useState("")
  const formatCurrency = (amount: number) => formatWithCurrency(amount, currency)

  const filtered = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.terminalName.toLowerCase().includes(q) ||
        (o.customerName?.toLowerCase().includes(q) ?? false) ||
        (o.cashierName?.toLowerCase().includes(q) ?? false) ||
        o.paymentMethod.toLowerCase().includes(q)
    )
  }, [orders, search])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and search all orders
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order #, terminal, cashier, customer, payment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border text-card-foreground"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Terminal</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cashier</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/30">
                <td className="px-5 py-3">
                  <span className="font-mono font-medium text-card-foreground">{order.orderNumber}</span>
                  <p className="text-xs text-muted-foreground">{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</p>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-5 py-3 text-sm text-card-foreground">{order.terminalName}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {order.cashierName ?? "Non renseigné"}
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {order.customerName ?? "—"}
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{order.paymentMethod}</td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-card-foreground">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                    title="View details"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Receipt className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">No orders found</p>
            <p className="text-xs mt-1">
              {search.trim() ? "Try a different search." : "Orders will appear here after sales."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
