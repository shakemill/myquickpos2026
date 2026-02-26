"use client"

import { useSyncExternalStore, useCallback } from "react"
import {
  getTerminals,
  getTerminal,
  addTerminal,
  updateTerminal,
  deleteTerminal,
  subscribe,
  type PosTerminalConfig,
} from "@/lib/pos-store"

export function useTerminals() {
  const terminals = useSyncExternalStore(subscribe, getTerminals, getTerminals)

  const create = useCallback(
    (config: Omit<PosTerminalConfig, "id" | "createdAt" | "lastActive" | "todaySales" | "todayOrders" | "products" | "categories">) => {
      return addTerminal(config)
    },
    []
  )

  const update = useCallback(
    (id: string, updates: Partial<PosTerminalConfig>) => {
      return updateTerminal(id, updates)
    },
    []
  )

  const remove = useCallback((id: string) => {
    return deleteTerminal(id)
  }, [])

  return { terminals, create, update, remove, getTerminal }
}
