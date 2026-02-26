import { useSyncExternalStore, useCallback } from "react"
import {
  getProducts,
  subscribeProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/product-store"
import type { Product } from "@/lib/pos-data"

export function useProducts() {
  const products = useSyncExternalStore(subscribeProducts, getProducts, getProducts)

  const create = useCallback((data: Omit<Product, "id">) => {
    return addProduct(data)
  }, [])

  const update = useCallback((id: string, updates: Partial<Omit<Product, "id">>) => {
    return updateProduct(id, updates)
  }, [])

  const remove = useCallback((id: string) => {
    return deleteProduct(id)
  }, [])

  return { products, create, update, remove }
}
