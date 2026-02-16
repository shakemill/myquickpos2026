import { useSyncExternalStore, useCallback } from "react"
import {
  getLocations,
  getStockLevels,
  getMovements,
  getStockLevel,
  getLocationStock,
  getProductStock,
  getStockStatus,
  getLowStockCount,
  getOutOfStockCount,
  getTotalUnits,
  getTotalStockValue,
  addRestock,
  addTransfer,
  addAdjustment,
  recordSale,
  quickAdjust,
  updateThreshold,
  subscribeStock,
} from "@/lib/stock-store"
import type { StockLevel, StockLocation } from "@/lib/stock-store"

export function useStock() {
  const locations = useSyncExternalStore(subscribeStock, getLocations, getLocations)
  const stockLevels = useSyncExternalStore(subscribeStock, getStockLevels, getStockLevels)
  const movements = useSyncExternalStore(subscribeStock, getMovements, getMovements)

  const lowCount = getLowStockCount()
  const outCount = getOutOfStockCount()
  const totalUnits = getTotalUnits()
  const totalValue = getTotalStockValue()

  const getLevel = useCallback(
    (productId: string, locationId: string) => getStockLevel(productId, locationId),
    []
  )

  const getLocationLevels = useCallback((locationId: string) => getLocationStock(locationId), [])
  const getProductLevels = useCallback((productId: string) => getProductStock(productId), [])

  const getStatus = useCallback((level: StockLevel) => getStockStatus(level), [])

  const restock = useCallback(
    (items: { productId: string; quantity: number }[], supplier: string, note: string) =>
      addRestock(items, supplier, note),
    []
  )

  const transfer = useCallback(
    (
      items: { productId: string; quantity: number }[],
      from: string,
      to: string,
      note: string
    ) => addTransfer(items, from, to, note),
    []
  )

  const adjust = useCallback(
    (productId: string, locationId: string, newCount: number, note: string) =>
      addAdjustment(productId, locationId, newCount, note),
    []
  )

  const sale = useCallback(
    (productId: string, locationId: string, quantity: number) =>
      recordSale(productId, locationId, quantity),
    []
  )

  const quick = useCallback(
    (productId: string, locationId: string, delta: number, note: string) =>
      quickAdjust(productId, locationId, delta, note),
    []
  )

  const setThreshold = useCallback(
    (productId: string, locationId: string, min: number) =>
      updateThreshold(productId, locationId, min),
    []
  )

  return {
    locations,
    stockLevels,
    movements,
    lowCount,
    outCount,
    totalUnits,
    totalValue,
    getLevel,
    getLocationLevels,
    getProductLevels,
    getStatus,
    restock,
    transfer,
    adjust,
    sale,
    quick,
    setThreshold,
  }
}
