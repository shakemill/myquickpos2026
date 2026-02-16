export interface Tenant {
  id: string
  companyName: string
  subdomain: string
  businessType: "restaurant" | "cafe" | "retail" | "bar" | "food-truck" | "bakery"
  currency: string
  timezone: string
  createdAt: string
}

const RESERVED_SUBDOMAINS = [
  "app",
  "api",
  "www",
  "admin",
  "dashboard",
  "help",
  "support",
  "billing",
  "status",
  "docs",
  "mail",
  "ftp",
  "myquickpos",
  "demo",
]

let tenants: Tenant[] = []
let listeners: (() => void)[] = []

function emit() {
  listeners.forEach((l) => l())
}

/** Slugify a string for subdomain use */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

/** Check if a subdomain is available (not taken & not reserved) */
export function isSubdomainAvailable(subdomain: string): boolean {
  if (!subdomain || subdomain.length < 3) return false
  if (RESERVED_SUBDOMAINS.includes(subdomain)) return false
  return !tenants.some((t) => t.subdomain === subdomain)
}

/** Create a new tenant and its first admin user */
export function createTenant(
  data: Omit<Tenant, "id" | "createdAt">
): Tenant {
  const id = `tenant-${String(tenants.length + 1).padStart(3, "0")}`
  const tenant: Tenant = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  }
  tenants = [...tenants, tenant]
  emit()
  return tenant
}

export function getTenants(): Tenant[] {
  return tenants
}

export function getTenant(id: string): Tenant | undefined {
  return tenants.find((t) => t.id === id)
}

export function getCurrentTenant(): Tenant | undefined {
  return tenants[0]
}

export function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}
