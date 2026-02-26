"use client"

import {
  LayoutGrid,
  Beef,
  Pizza,
  CupSoda,
  Cookie,
  Cake,
  Salad,
  Coffee,
  Fish,
  Sandwich,
  Egg,
  IceCream,
  Apple,
  Soup,
  Wine,
  Beer,
  Milk,
  Wheat,
  Cherry,
  Grape,
  Citrus,
  Carrot,
  Popcorn,
  Drumstick,
  Ham,
  Dessert,
  Croissant,
  Flame,
  ChefHat,
} from "lucide-react"
import type { ElementType } from "react"

export interface CategoryIconOption {
  id: string
  label: string
  icon: ElementType
}

export const categoryIconMap: Record<string, ElementType> = {
  grid: LayoutGrid,
  beef: Beef,
  pizza: Pizza,
  "cup-soda": CupSoda,
  "french-fries": Cookie,
  cake: Cake,
  salad: Salad,
  coffee: Coffee,
  fish: Fish,
  sandwich: Sandwich,
  egg: Egg,
  "ice-cream": IceCream,
  apple: Apple,
  soup: Soup,
  wine: Wine,
  beer: Beer,
  milk: Milk,
  wheat: Wheat,
  cherry: Cherry,
  grape: Grape,
  citrus: Citrus,
  carrot: Carrot,
  popcorn: Popcorn,
  drumstick: Drumstick,
  ham: Ham,
  dessert: Dessert,
  croissant: Croissant,
  flame: Flame,
  "chef-hat": ChefHat,
}

export const categoryIconOptions: CategoryIconOption[] = [
  { id: "beef", label: "Beef / Meat", icon: Beef },
  { id: "drumstick", label: "Poultry", icon: Drumstick },
  { id: "ham", label: "Ham / Pork", icon: Ham },
  { id: "fish", label: "Fish / Seafood", icon: Fish },
  { id: "pizza", label: "Pizza", icon: Pizza },
  { id: "sandwich", label: "Sandwich", icon: Sandwich },
  { id: "egg", label: "Breakfast", icon: Egg },
  { id: "croissant", label: "Bakery", icon: Croissant },
  { id: "salad", label: "Salad / Greens", icon: Salad },
  { id: "carrot", label: "Vegetables", icon: Carrot },
  { id: "soup", label: "Soup / Bowl", icon: Soup },
  { id: "french-fries", label: "Snacks / Sides", icon: Cookie },
  { id: "popcorn", label: "Popcorn", icon: Popcorn },
  { id: "cake", label: "Cake / Pastry", icon: Cake },
  { id: "dessert", label: "Dessert", icon: Dessert },
  { id: "ice-cream", label: "Ice Cream", icon: IceCream },
  { id: "cherry", label: "Berry / Fruit", icon: Cherry },
  { id: "apple", label: "Apple / Fruit", icon: Apple },
  { id: "grape", label: "Grape", icon: Grape },
  { id: "citrus", label: "Citrus", icon: Citrus },
  { id: "cup-soda", label: "Soda / Juice", icon: CupSoda },
  { id: "coffee", label: "Coffee / Hot", icon: Coffee },
  { id: "milk", label: "Milk / Dairy", icon: Milk },
  { id: "beer", label: "Beer", icon: Beer },
  { id: "wine", label: "Wine / Bar", icon: Wine },
  { id: "wheat", label: "Grains / Pasta", icon: Wheat },
  { id: "flame", label: "Flame / Premium", icon: Flame },
  { id: "chef-hat", label: "Chef / Specialty", icon: ChefHat },
  { id: "grid", label: "General", icon: LayoutGrid },
]

export function getCategoryIcon(iconId: string): ElementType {
  return categoryIconMap[iconId] ?? LayoutGrid
}
