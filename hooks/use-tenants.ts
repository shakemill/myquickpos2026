import { useSyncExternalStore } from "react"
import {
  getTenants,
  getCurrentTenant,
  createTenant,
  isSubdomainAvailable,
  slugify,
  subscribe,
  type Tenant,
} from "@/lib/tenant-store"

export function useTenants() {
  const tenants = useSyncExternalStore(subscribe, getTenants, getTenants)
  const current = useSyncExternalStore(subscribe, getCurrentTenant, getCurrentTenant)

  return {
    tenants,
    current,
    create: createTenant,
    isSubdomainAvailable,
    slugify,
  } as const
}

export type { Tenant }
