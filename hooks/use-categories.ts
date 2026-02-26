import { useSyncExternalStore, useCallback } from "react"
import {
  getCategories,
  getSelectableCategories,
  getRootCategories,
  getChildrenOf,
  getDescendantIds,
  getLeafCategories,
  subscribeCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/product-store"
import type { Category } from "@/lib/pos-data"

export function useCategories() {
  const categories = useSyncExternalStore(subscribeCategories, getCategories, getCategories)
  const selectable = useSyncExternalStore(
    subscribeCategories,
    getSelectableCategories,
    getSelectableCategories
  )
  const roots = useSyncExternalStore(
    subscribeCategories,
    getRootCategories,
    getRootCategories
  )
  const leaves = useSyncExternalStore(
    subscribeCategories,
    getLeafCategories,
    getLeafCategories
  )

  const create = useCallback((data: Omit<Category, "id">) => {
    return addCategory(data)
  }, [])

  const update = useCallback((id: string, updates: Partial<Omit<Category, "id">>) => {
    return updateCategory(id, updates)
  }, [])

  const remove = useCallback((id: string) => {
    return deleteCategory(id)
  }, [])

  return {
    categories,
    selectable,
    roots,
    leaves,
    getChildren: getChildrenOf,
    getDescendantIds,
    create,
    update,
    remove,
  }
}
