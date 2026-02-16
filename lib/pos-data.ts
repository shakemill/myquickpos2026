export interface Product {
  id: string
  name: string
  price: number
  category: string
  image?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Category {
  id: string
  name: string
  icon: string
  parentId: string | null
}

export const categories: Category[] = [
  { id: "all", name: "All Items", icon: "grid", parentId: null },
  // ── Burgers (parent) ──
  { id: "burgers", name: "Burgers", icon: "beef", parentId: null },
  { id: "classic-burgers", name: "Classic", icon: "beef", parentId: "burgers" },
  { id: "premium-burgers", name: "Premium", icon: "flame", parentId: "burgers" },
  // ── Pizza (parent) ──
  { id: "pizza", name: "Pizza", icon: "pizza", parentId: null },
  { id: "classic-pizza", name: "Classic", icon: "pizza", parentId: "pizza" },
  { id: "specialty-pizza", name: "Specialty", icon: "chef-hat", parentId: "pizza" },
  // ── Drinks (parent) ──
  { id: "drinks", name: "Drinks", icon: "cup-soda", parentId: null },
  { id: "soft-drinks", name: "Soft Drinks", icon: "cup-soda", parentId: "drinks" },
  { id: "hot-drinks", name: "Hot Drinks", icon: "coffee", parentId: "drinks" },
  // ── Sides (leaf, no children) ──
  { id: "sides", name: "Sides", icon: "french-fries", parentId: null },
  // ── Desserts (leaf, no children) ──
  { id: "desserts", name: "Desserts", icon: "cake", parentId: null },
]

export const products: Product[] = [
  // Classic Burgers
  { id: "1", name: "Classic Burger", price: 8.99, category: "classic-burgers" },
  { id: "2", name: "Cheese Burger", price: 9.99, category: "classic-burgers" },
  { id: "5", name: "Veggie Burger", price: 9.49, category: "classic-burgers" },
  // Premium Burgers
  { id: "3", name: "Double Burger", price: 12.99, category: "premium-burgers" },
  { id: "4", name: "Bacon Burger", price: 11.49, category: "premium-burgers" },
  { id: "6", name: "Chicken Burger", price: 10.49, category: "premium-burgers" },
  // Classic Pizza
  { id: "7", name: "Margherita", price: 11.99, category: "classic-pizza" },
  { id: "8", name: "Pepperoni", price: 13.99, category: "classic-pizza" },
  { id: "9", name: "Hawaiian", price: 12.99, category: "classic-pizza" },
  // Specialty Pizza
  { id: "10", name: "BBQ Chicken", price: 14.49, category: "specialty-pizza" },
  { id: "11", name: "Veggie Supreme", price: 12.49, category: "specialty-pizza" },
  { id: "12", name: "Four Cheese", price: 13.49, category: "specialty-pizza" },
  // Soft Drinks
  { id: "13", name: "Cola", price: 2.49, category: "soft-drinks" },
  { id: "14", name: "Lemonade", price: 2.99, category: "soft-drinks" },
  { id: "15", name: "Iced Tea", price: 2.79, category: "soft-drinks" },
  { id: "16", name: "Water", price: 1.49, category: "soft-drinks" },
  // Hot Drinks
  { id: "17", name: "Milkshake", price: 4.99, category: "soft-drinks" },
  { id: "18", name: "Coffee", price: 3.49, category: "hot-drinks" },
  // Sides (leaf)
  { id: "19", name: "Fries", price: 3.99, category: "sides" },
  { id: "20", name: "Onion Rings", price: 4.49, category: "sides" },
  { id: "21", name: "Mozzarella Sticks", price: 5.99, category: "sides" },
  { id: "22", name: "Coleslaw", price: 2.99, category: "sides" },
  { id: "23", name: "Garlic Bread", price: 3.49, category: "sides" },
  { id: "24", name: "Side Salad", price: 4.49, category: "sides" },
  // Desserts (leaf)
  { id: "25", name: "Brownie", price: 4.49, category: "desserts" },
  { id: "26", name: "Ice Cream", price: 3.99, category: "desserts" },
  { id: "27", name: "Cheesecake", price: 5.99, category: "desserts" },
  { id: "28", name: "Apple Pie", price: 4.99, category: "desserts" },
  { id: "29", name: "Cookie", price: 2.49, category: "desserts" },
  { id: "30", name: "Donut", price: 2.99, category: "desserts" },
]
