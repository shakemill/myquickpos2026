import { useSyncExternalStore, useCallback } from "react"
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  subscribe,
  type User,
} from "@/lib/user-store"

export function useUsers() {
  const users = useSyncExternalStore(subscribe, getUsers, getUsers)

  const create = useCallback(
    (config: Omit<User, "id" | "createdAt" | "lastLogin">) => {
      return addUser(config)
    },
    []
  )

  const update = useCallback(
    (id: string, updates: Partial<User>) => {
      return updateUser(id, updates)
    },
    []
  )

  const remove = useCallback((id: string) => {
    return deleteUser(id)
  }, [])

  return { users, create, update, remove }
}
