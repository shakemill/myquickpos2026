"use client"

export interface PrinterConfig {
  paperWidth: "58mm" | "80mm"
  autoPrint: boolean
  headerHtml: string
  footerHtml: string
}

const DEFAULT_HEADER = `<p style="text-align: center"><strong>MyQuickPOS Demo Store</strong></p><p style="text-align: center">123 Main Street, Suite 100</p><p style="text-align: center">Tel: (555) 123-4567</p>`

const DEFAULT_FOOTER = `<p style="text-align: center">Thank you for your purchase!</p><p style="text-align: center">Visit us at myquickpos.app</p><p style="text-align: center"><em>Returns accepted within 30 days</em></p>`

let config: PrinterConfig = {
  paperWidth: "80mm",
  autoPrint: false,
  headerHtml: DEFAULT_HEADER,
  footerHtml: DEFAULT_FOOTER,
}

let listeners: (() => void)[] = []

function emit() {
  listeners.forEach((l) => l())
}

export function getPrinterConfig(): PrinterConfig {
  return config
}

export function updatePrinterConfig(updates: Partial<PrinterConfig>) {
  config = { ...config, ...updates }
  emit()
}

export function resetPrinterConfig() {
  config = {
    paperWidth: "80mm",
    autoPrint: false,
    headerHtml: DEFAULT_HEADER,
    footerHtml: DEFAULT_FOOTER,
  }
  emit()
}

export function subscribePrinter(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}
