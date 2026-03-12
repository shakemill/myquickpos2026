/** Currencies that use space as thousands separator (e.g. FCFA 60 393.86) */
const SPACE_THOUSANDS_CURRENCIES = ["FCFA", "XOF", "XAF"]

/** Common currency symbols for labels (e.g. "Points per $1" → "Points per 1 €") */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CHF: "CHF",
  XOF: "FCFA",
  XAF: "FCFA",
  FCFA: "FCFA",
  JPY: "¥",
  CAD: "CA$",
  AUD: "A$",
}

export function getCurrencySymbol(currency: string): string {
  const code = (currency || "USD").trim().toUpperCase()
  return CURRENCY_SYMBOLS[code] ?? code
}

/** Format amount only (no currency symbol) - for compact display in item lists */
export function formatAmountOnly(amount: number, currency: string): string {
  const code = (currency || "USD").trim().toUpperCase()
  const num = Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)
  const withSpaces = num.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return withSpaces
}

export function formatWithCurrency(amount: number, currency: string): string {
  const raw = (currency || "USD").trim()
  const code = raw.toUpperCase()
  const isoCurrency = code === "FCFA" ? "XOF" : code
  try {
    let formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: isoCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
    if (SPACE_THOUSANDS_CURRENCIES.includes(code)) {
      formatted = formatted.replace(/,/g, " ")
    }
    if (code === "FCFA" && (formatted.startsWith("XOF") || formatted.startsWith("CFA"))) {
      formatted = "FCFA " + formatted.replace(/^(XOF|CFA)\s*/, "")
    }
    return formatted
  } catch {
    const num = (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    return `${raw === "FCFA" ? "FCFA" : code} ${num}`
  }
}
