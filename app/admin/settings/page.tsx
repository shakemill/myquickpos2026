"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Store,
  Percent,
  Globe,
  Printer,
  RotateCcw,
  Eye,
  EyeOff,
  Save,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ReceiptEditor } from "@/components/admin/receipt-editor"
import { usePrinter } from "@/hooks/use-printer"
import { WelcomeEmailTemplate } from "@/components/admin/welcome-email-template"

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("MyQuickPOS Demo Store")
  const [currency, setCurrency] = useState("USD")
  const [taxRate, setTaxRate] = useState("8")
  const [showPreview, setShowPreview] = useState(true)

  const { config, update, reset } = usePrinter()

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure global POS system preferences
        </p>
      </div>

      {/* Store Info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-card-foreground">
            Store Information
          </h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-name" className="text-sm text-card-foreground">
            Store Name
          </Label>
          <Input
            id="store-name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="bg-secondary border-border text-card-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm text-card-foreground">
              <Globe className="inline h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Currency
            </Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-secondary border-border text-card-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax" className="text-sm text-card-foreground">
              <Percent className="inline h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Default Tax Rate (%)
            </Label>
            <Input
              id="tax"
              type="number"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="bg-secondary border-border text-card-foreground"
            />
          </div>
        </div>
      </div>

      {/* Thermal Printer */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-card-foreground">
              Thermal Printer
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground"
            >
              {showPreview ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {showPreview ? "Hide" : "Show"} Preview
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Printer Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-card-foreground">Paper Width</Label>
            <div className="flex gap-2">
              {(["58mm", "80mm"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => update({ paperWidth: w })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    config.paperWidth === w
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-card-foreground">Auto-Print</Label>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={config.autoPrint}
                onCheckedChange={(checked) => update({ autoPrint: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {config.autoPrint ? "Print after every sale" : "Manual print"}
              </span>
            </div>
          </div>
        </div>

        {/* Editors + Preview Layout */}
        <div
          className={cn(
            "grid gap-6",
            showPreview ? "lg:grid-cols-[1fr_280px]" : "grid-cols-1"
          )}
        >
          {/* Editors Column */}
          <div className="space-y-5">
            <ReceiptEditor
              value={config.headerHtml}
              onChange={(html) => update({ headerHtml: html })}
              label="Receipt Header"
              description="Shown at the top of every receipt. Typically your store name, address, and phone."
            />

            <ReceiptEditor
              value={config.footerHtml}
              onChange={(html) => update({ footerHtml: html })}
              label="Receipt Footer"
              description="Shown at the bottom of every receipt. Typically a thank-you message or return policy."
            />
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">
                Live Preview
              </p>
              <p className="text-xs text-muted-foreground">
                Simulated {config.paperWidth} thermal receipt
              </p>
              <div
                className={cn(
                  "mx-auto rounded-md border border-dashed border-border bg-white text-black overflow-hidden",
                  config.paperWidth === "58mm" ? "max-w-[220px]" : "max-w-[280px]"
                )}
              >
                {/* Paper */}
                <div className="px-3 py-4 space-y-0">
                  {/* Header */}
                  <div
                    className="receipt-preview"
                    dangerouslySetInnerHTML={{ __html: config.headerHtml }}
                  />

                  {/* Dashed divider */}
                  <div className="border-t border-dashed border-neutral-300 my-2" />

                  {/* Sample items */}
                  <div className="space-y-1 text-[11px] leading-tight font-mono">
                    <div className="flex justify-between">
                      <span>Classic Burger x2</span>
                      <span>$17.98</span>
                    </div>
                    <div className="flex justify-between">
                      <span>French Fries x1</span>
                      <span>$4.49</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cola x2</span>
                      <span>$4.98</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-neutral-300 my-2" />

                  {/* Totals */}
                  <div className="space-y-0.5 text-[11px] leading-tight font-mono">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>$27.45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({taxRate}%)</span>
                      <span>${(27.45 * parseFloat(taxRate || "0") / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs pt-0.5">
                      <span>TOTAL</span>
                      <span>${(27.45 + 27.45 * parseFloat(taxRate || "0") / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-neutral-300 my-2" />

                  {/* Payment */}
                  <div className="space-y-0.5 text-[11px] leading-tight font-mono">
                    <div className="flex justify-between">
                      <span>Paid: Cash</span>
                      <span>$30.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change</span>
                      <span>${(30 - (27.45 + 27.45 * parseFloat(taxRate || "0") / 100)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-neutral-300 my-2" />

                  {/* Footer */}
                  <div
                    className="receipt-preview"
                    dangerouslySetInnerHTML={{ __html: config.footerHtml }}
                  />

                  {/* Timestamp */}
                  <p className="text-[10px] text-neutral-400 text-center pt-2 font-mono">
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[10px] text-neutral-400 text-center font-mono">
                    Terminal 01 - Receipt #0048
                  </p>
                </div>

                {/* Tear line */}
                <div className="border-t-2 border-dotted border-neutral-200" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Templates */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Email Templates
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize the welcome email sent to new business owners after signup
            </p>
          </div>
        </div>

        <WelcomeEmailTemplate />
      </div>

      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
        <Save className="h-4 w-4" />
        Save Changes
      </Button>
    </div>
  )
}
