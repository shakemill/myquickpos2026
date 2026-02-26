import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Categories from pos-data (excluding "all")
const CATEGORIES = [
  { id: "burgers", name: "Burgers", icon: "beef", parentId: null },
  { id: "classic-burgers", name: "Classic", icon: "beef", parentId: "burgers" },
  { id: "premium-burgers", name: "Premium", icon: "flame", parentId: "burgers" },
  { id: "pizza", name: "Pizza", icon: "pizza", parentId: null },
  { id: "classic-pizza", name: "Classic", icon: "pizza", parentId: "pizza" },
  { id: "specialty-pizza", name: "Specialty", icon: "chef-hat", parentId: "pizza" },
  { id: "drinks", name: "Drinks", icon: "cup-soda", parentId: null },
  { id: "soft-drinks", name: "Soft Drinks", icon: "cup-soda", parentId: "drinks" },
  { id: "hot-drinks", name: "Hot Drinks", icon: "coffee", parentId: "drinks" },
  { id: "sides", name: "Sides", icon: "french-fries", parentId: null },
  { id: "desserts", name: "Desserts", icon: "cake", parentId: null },
]

const SERVICE_CATEGORIES = [
  { id: "services-care", name: "Care & Wellness", icon: "flame", parentId: null },
  { id: "services-delivery", name: "Delivery", icon: "grid", parentId: null },
]

const SERVICES = [
  { id: "svc1", name: "Coiffure", price: 25, category: "services-care" },
  { id: "svc2", name: "Manucure", price: 18, category: "services-care" },
  { id: "svc3", name: "Livraison", price: 5, category: "services-delivery" },
]

// Products from pos-data: { id, name, price, category }
const PRODUCTS = [
  { id: "p1", name: "Classic Burger", price: 8.99, category: "classic-burgers" },
  { id: "p2", name: "Cheese Burger", price: 9.99, category: "classic-burgers" },
  { id: "p5", name: "Veggie Burger", price: 9.49, category: "classic-burgers" },
  { id: "p3", name: "Double Burger", price: 12.99, category: "premium-burgers" },
  { id: "p4", name: "Bacon Burger", price: 11.49, category: "premium-burgers" },
  { id: "p6", name: "Chicken Burger", price: 10.49, category: "premium-burgers" },
  { id: "p7", name: "Margherita", price: 11.99, category: "classic-pizza" },
  { id: "p8", name: "Pepperoni", price: 13.99, category: "classic-pizza" },
  { id: "p9", name: "Hawaiian", price: 12.99, category: "classic-pizza" },
  { id: "p10", name: "BBQ Chicken", price: 14.49, category: "specialty-pizza" },
  { id: "p11", name: "Veggie Supreme", price: 12.49, category: "specialty-pizza" },
  { id: "p12", name: "Four Cheese", price: 13.49, category: "specialty-pizza" },
  { id: "p13", name: "Cola", price: 2.49, category: "soft-drinks" },
  { id: "p14", name: "Lemonade", price: 2.99, category: "soft-drinks" },
  { id: "p15", name: "Iced Tea", price: 2.79, category: "soft-drinks" },
  { id: "p16", name: "Water", price: 1.49, category: "soft-drinks" },
  { id: "p17", name: "Milkshake", price: 4.99, category: "soft-drinks" },
  { id: "p18", name: "Coffee", price: 3.49, category: "hot-drinks" },
  { id: "p19", name: "Fries", price: 3.99, category: "sides" },
  { id: "p20", name: "Onion Rings", price: 4.49, category: "sides" },
  { id: "p21", name: "Mozzarella Sticks", price: 5.99, category: "sides" },
  { id: "p22", name: "Coleslaw", price: 2.99, category: "sides" },
  { id: "p23", name: "Garlic Bread", price: 3.49, category: "sides" },
  { id: "p24", name: "Side Salad", price: 4.49, category: "sides" },
  { id: "p25", name: "Brownie", price: 4.49, category: "desserts" },
  { id: "p26", name: "Ice Cream", price: 3.99, category: "desserts" },
  { id: "p27", name: "Cheesecake", price: 5.99, category: "desserts" },
  { id: "p28", name: "Apple Pie", price: 4.99, category: "desserts" },
  { id: "p29", name: "Cookie", price: 2.49, category: "desserts" },
  { id: "p30", name: "Donut", price: 2.99, category: "desserts" },
]

const LOYALTY_TIERS = [
  { id: "1", name: "Bronze", pointsRequired: 0, benefits: ["Earn 1 point per $1", "Birthday reward"], discount: 0, icon: "bronze" },
  { id: "2", name: "Silver", pointsRequired: 500, benefits: ["Earn 1.25 points per $1", "5% discount", "Priority support"], discount: 5, icon: "silver" },
  { id: "3", name: "Gold", pointsRequired: 2000, benefits: ["Earn 1.5 points per $1", "10% discount", "Free delivery", "Early access"], discount: 10, icon: "gold" },
  { id: "4", name: "Platinum", pointsRequired: 5000, benefits: ["Earn 2 points per $1", "15% discount", "Free delivery", "VIP support", "Exclusive events"], discount: 15, icon: "platinum" },
]

const LOYALTY_REWARDS = [
  { id: "1", name: "$5 Off", description: "$5 discount", pointsCost: 500, value: 5, type: "discount" },
  { id: "2", name: "$10 Off", description: "$10 discount", pointsCost: 1000, value: 10, type: "discount" },
  { id: "3", name: "Free Coffee", description: "Free regular coffee", pointsCost: 300, value: 3.5, type: "product" },
  { id: "4", name: "Free Dessert", description: "Choose any dessert", pointsCost: 400, value: 6, type: "product" },
]

function daysAgo(d: number) {
  const t = new Date()
  t.setDate(t.getDate() - d)
  return t
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

async function main() {
  const hashedAdmin = await bcrypt.hash("admin123", 10)
  const hashedManager = await bcrypt.hash("manager123", 10)
  const hashedCashier = await bcrypt.hash("cashier123", 10)

  // 1. Tenants
  const t1 = await prisma.tenant.upsert({
    where: { slug: "tenant1" },
    update: {},
    create: {
      slug: "tenant1",
      name: "Boulangerie Martin",
      plan: "pro",
      settings: { storeName: "Boulangerie Martin", currency: "EUR", taxRate: 8, printer: { paperWidth: "80mm", autoPrint: false } },
    },
  })
  const t2 = await prisma.tenant.upsert({
    where: { slug: "tenant2" },
    update: {},
    create: {
      slug: "tenant2",
      name: "Café du Commerce",
      plan: "pro",
      settings: { storeName: "Café du Commerce", currency: "EUR", taxRate: 10, printer: { paperWidth: "80mm", autoPrint: false } },
    },
  })

  for (const tenant of [t1, t2]) {
    const tenantId = tenant.id

    // 2. Users: 1 admin, 1 manager, 2 cashiers
    await prisma.user.upsert({
      where: { email_tenantId: { email: `admin@${tenant.slug}.com`, tenantId } },
      update: {},
      create: {
        email: `admin@${tenant.slug}.com`,
        password: hashedAdmin,
        name: `Admin ${tenant.name}`,
        role: Role.ADMIN,
        tenantId,
      },
    })
    await prisma.user.upsert({
      where: { email_tenantId: { email: `manager@${tenant.slug}.com`, tenantId } },
      update: {},
      create: {
        email: `manager@${tenant.slug}.com`,
        password: hashedManager,
        name: `Manager ${tenant.name}`,
        role: Role.MANAGER,
        tenantId,
      },
    })
    await prisma.user.upsert({
      where: { email_tenantId: { email: `cashier1@${tenant.slug}.com`, tenantId } },
      update: {},
      create: {
        email: `cashier1@${tenant.slug}.com`,
        password: hashedCashier,
        name: `Cashier 1`,
        role: Role.CASHIER,
        tenantId,
      },
    })
    await prisma.user.upsert({
      where: { email_tenantId: { email: `cashier2@${tenant.slug}.com`, tenantId } },
      update: {},
      create: {
        email: `cashier2@${tenant.slug}.com`,
        password: hashedCashier,
        name: `Cashier 2`,
        role: Role.CASHIER,
        tenantId,
      },
    })

    // 3. Categories (product type by default)
    for (const c of CATEGORIES) {
      await prisma.category.upsert({
        where: { id: `${tenantId}-${c.id}` },
        update: {},
        create: {
          id: `${tenantId}-${c.id}`,
          name: c.name,
          icon: c.icon,
          parentId: c.parentId ? `${tenantId}-${c.parentId}` : null,
          tenantId,
          type: "product",
        },
      })
    }
    for (const c of SERVICE_CATEGORIES) {
      await prisma.category.upsert({
        where: { id: `${tenantId}-${c.id}` },
        update: {},
        create: {
          id: `${tenantId}-${c.id}`,
          name: c.name,
          icon: c.icon,
          parentId: c.parentId ? `${tenantId}-${c.parentId}` : null,
          tenantId,
          type: "service",
        },
      })
    }

    // 4. Stores: central + 2 magasins pour les transferts
    const centralStore = await prisma.store.upsert({
      where: { id: `${tenantId}-store-central` },
      update: {},
      create: {
        id: `${tenantId}-store-central`,
        tenantId,
        name: "Magasin central",
        isCentral: true,
      },
    })
    await prisma.store.upsert({
      where: { id: `${tenantId}-store-a` },
      update: {},
      create: {
        id: `${tenantId}-store-a`,
        tenantId,
        name: "Point de vente A",
        isCentral: false,
      },
    })
    await prisma.store.upsert({
      where: { id: `${tenantId}-store-b` },
      update: {},
      create: {
        id: `${tenantId}-store-b`,
        tenantId,
        name: "Point de vente B",
        isCentral: false,
      },
    })

    // 5. Products (no stock field; stock is in StoreStock)
    for (const p of PRODUCTS) {
      const cost = Math.round(p.price * 0.6 * 100) / 100
      await prisma.product.upsert({
        where: { sku_tenantId: { sku: `SKU-${tenant.slug}-${p.id}`, tenantId } },
        update: {},
        create: {
          name: p.name,
          sku: `SKU-${tenant.slug}-${p.id}`,
          price: p.price,
          cost,
          categoryId: `${tenantId}-${p.category}`,
          tenantId,
          minStock: 5,
          isService: false,
        },
      })
    }
    for (const s of SERVICES) {
      const cost = Math.round(s.price * 0.5 * 100) / 100
      await prisma.product.upsert({
        where: { sku_tenantId: { sku: `SKU-${tenant.slug}-${s.id}`, tenantId } },
        update: {},
        create: {
          name: s.name,
          sku: `SKU-${tenant.slug}-${s.id}`,
          price: s.price,
          cost,
          categoryId: `${tenantId}-${s.category}`,
          tenantId,
          minStock: 0,
          isService: true,
        },
      })
    }
    const products = await prisma.product.findMany({ where: { tenantId, isService: false } })
    for (const prod of products) {
      const quantity = Math.floor(seededRandom(tenant.slug === "tenant1" ? 33 : 44)() * 80) + 20
      await prisma.storeStock.upsert({
        where: { storeId_productId: { storeId: centralStore.id, productId: prod.id } },
        update: {},
        create: {
          storeId: centralStore.id,
          productId: prod.id,
          quantity,
        },
      })
    }

    // 5. Customers (10+ per tenant)
    const customersData = [
      { name: "Sarah Johnson", email: "sarah.j@example.com", phone: "+1 555 123-4567", loyaltyPoints: 2450, totalSpent: 4580.5, visits: 42, tier: "gold" },
      { name: "Michael Chen", email: "m.chen@example.com", phone: "+1 555 987-6543", loyaltyPoints: 890, totalSpent: 1250, visits: 15, tier: "silver" },
      { name: "Emma Davis", email: "emma.davis@example.com", phone: "+1 555 456-7890", loyaltyPoints: 5200, totalSpent: 8950.75, visits: 68, tier: "platinum" },
      { name: "John Smith", email: "john@example.com", phone: "555-0101", loyaltyPoints: 1200, totalSpent: 2100, visits: 25, tier: "silver" },
      { name: "Lisa Brown", email: "lisa@example.com", phone: "555-0105", loyaltyPoints: 350, totalSpent: 580, visits: 8, tier: "bronze" },
      { name: "David Wilson", email: "david@example.com", phone: "555-0106", loyaltyPoints: 4100, totalSpent: 7200, visits: 55, tier: "gold" },
      { name: "Anna Martinez", email: "anna@example.com", phone: "555-0107", loyaltyPoints: 90, totalSpent: 150, visits: 3, tier: "bronze" },
      { name: "James Lee", email: "james@example.com", phone: "555-0108", loyaltyPoints: 2100, totalSpent: 3800, visits: 35, tier: "gold" },
      { name: "Maria Garcia", email: "maria@example.com", phone: "555-0109", loyaltyPoints: 6000, totalSpent: 10500, visits: 72, tier: "platinum" },
      { name: "Robert Taylor", email: "robert@example.com", phone: "555-0110", loyaltyPoints: 450, totalSpent: 780, visits: 12, tier: "bronze" },
      { name: "Sophie Martin", email: "sophie@example.com", phone: "555-0111", loyaltyPoints: 1800, totalSpent: 3200, visits: 28, tier: "gold" },
    ]
    const customerIds: string[] = []
    for (let i = 0; i < customersData.length; i++) {
      const c = customersData[i]
      const cust = await prisma.customer.upsert({
        where: { id: `${tenantId}-cust-${i + 1}` },
        update: {},
        create: {
          id: `${tenantId}-cust-${i + 1}`,
          name: c.name,
          email: c.email,
          phone: c.phone,
          tenantId,
          loyaltyPoints: c.loyaltyPoints,
          loyaltyTier: c.tier,
          totalSpent: c.totalSpent,
          visits: c.visits,
        },
      })
      customerIds.push(cust.id)
    }

    // 6. Terminals (linked to central store)
    const categoryIds = (await prisma.category.findMany({ where: { tenantId }, select: { id: true } })).map((c) => c.id)
    const term1 = await prisma.terminal.upsert({
      where: { id: `${tenantId}-term-01` },
      update: { storeId: centralStore.id },
      create: {
        id: `${tenantId}-term-01`,
        name: "terminal-01",
        label: "Caisse 1",
        tenantId,
        storeId: centralStore.id,
        settings: { assignedCategories: categoryIds, taxRate: 8 },
      },
    })
    const term2 = await prisma.terminal.upsert({
      where: { id: `${tenantId}-term-02` },
      update: { storeId: centralStore.id },
      create: {
        id: `${tenantId}-term-02`,
        name: "terminal-02",
        label: "Caisse 2",
        tenantId,
        storeId: centralStore.id,
        settings: { assignedCategories: categoryIds, taxRate: 8 },
      },
    })

    // 7. Loyalty program
    await prisma.loyaltyProgram.upsert({
      where: { tenantId },
      update: {},
      create: {
        tenantId,
        pointsPerEuro: 10,
        tiers: LOYALTY_TIERS,
        rewards: LOYALTY_REWARDS,
        isActive: true,
      },
    })

    // 8. Orders (30 days of history)
    const rand = seededRandom(tenant.slug === "tenant1" ? 1111 : 2222)
    let orderNum = 1000
    const productsForOrders = await prisma.product.findMany({ where: { tenantId } })

    for (let d = 29; d >= 0; d--) {
      const date = daysAgo(d)
      const ordersPerDay = Math.floor(rand() * 15) + 8
      for (let o = 0; o < ordersPerDay; o++) {
        const terminal = Math.random() < 0.6 ? term1 : term2
        const customer = Math.random() < 0.4 ? customerIds[Math.floor(rand() * customerIds.length)] : null
        const itemCount = Math.floor(rand() * 5) + 1
        const selectedProducts = [...productsForOrders].sort(() => rand() - 0.5).slice(0, itemCount)
        let subtotal = 0
        const orderItems: { productId: string; quantity: number; unitPrice: number; total: number }[] = []
        for (const prod of selectedProducts) {
          const qty = Math.floor(rand() * 3) + 1
          const price = Number(prod.price)
          const total = price * qty
          subtotal += total
          orderItems.push({
            productId: prod.id,
            quantity: qty,
            unitPrice: price,
            total,
          })
        }
        const tax = Math.round(subtotal * 0.08 * 100) / 100
        const total = subtotal + tax
        const cashierNames = ["Cashier 1", "Cashier 2"]
        const cashierName = cashierNames[Math.floor(rand() * cashierNames.length)]
        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-${orderNum++}`,
            tenantId,
            terminalId: terminal.id,
            customerId: customer,
            status: "COMPLETED",
            subtotal,
            tax,
            discount: 0,
            total,
            paymentMethod: ["card", "cash", "mobile"][Math.floor(rand() * 3)],
            cashierName,
            items: {
              create: orderItems,
            },
            createdAt: date,
          },
        })
        // Stock movements (OUT) for this order - from terminal's store
        const termStoreId = terminal.storeId ?? centralStore.id
        for (const item of orderItems) {
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              tenantId,
              type: "OUT",
              quantity: -item.quantity,
              reason: `Order ${order.orderNumber}`,
              fromStoreId: termStoreId,
              fromLocation: terminal.name,
              createdAt: date,
            },
          })
        }
      }
    }

    // 9. Reconcile StoreStock with OUT movements (seed orders created movements; update StoreStock to reflect)
    for (const prod of productsForOrders) {
      const movements = await prisma.stockMovement.findMany({
        where: { productId: prod.id, fromStoreId: centralStore.id },
      })
      const outQty = movements.filter((m) => m.quantity < 0).reduce((sum, m) => sum + m.quantity, 0)
      const current = await prisma.storeStock.findUnique({
        where: { storeId_productId: { storeId: centralStore.id, productId: prod.id } },
      })
      const baseQty = current?.quantity ?? 50
      const newQty = Math.max(0, baseQty + outQty)
      await prisma.storeStock.upsert({
        where: { storeId_productId: { storeId: centralStore.id, productId: prod.id } },
        update: { quantity: newQty },
        create: {
          storeId: centralStore.id,
          productId: prod.id,
          quantity: newQty,
        },
      })
    }
  }

  console.log("Seed completed successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
