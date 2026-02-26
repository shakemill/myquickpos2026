"use client"

import { useSyncExternalStore, useCallback } from "react"
import {
  getPrinterConfig,
  updatePrinterConfig,
  resetPrinterConfig,
  subscribePrinter,
  type PrinterConfig,
} from "@/lib/printer-store"

export function usePrinter() {
  const config = useSyncExternalStore(subscribePrinter, getPrinterConfig, getPrinterConfig)

  const update = useCallback((updates: Partial<PrinterConfig>) => {
    updatePrinterConfig(updates)
  }, [])

  const reset = useCallback(() => {
    resetPrinterConfig()
  }, [])

  return { config, update, reset }
}
