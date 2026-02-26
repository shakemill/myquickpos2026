/** Currencies that use space as thousands separator (e.g. FCFA 60 393.86) */
const SPACE_THOUSANDS_CURRENCIES = ["FCFA", "XOF", "XAF"]

export function formatWithCurrency(amount: number, currency: string): string {
  const raw = (currency || "USD").trim()
  const code = raw.toUpperCase()
  const isoCurrency = code === "FCFA" ? "XOF" : code
  try {
    let formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: isoCurrency,
      minimumFractionDigits: 2,
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
    const num = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    return `${raw === "FCFA" ? "FCFA" : code} ${num}`
  }
}
