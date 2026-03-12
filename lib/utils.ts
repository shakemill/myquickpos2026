import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Capitalize first letter of each word (title case) */
export function toTitleCase(str: string): string {
  return str.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}
