"use client"

import { useState, useEffect } from "react"
import { Monitor, User, Search, ArrowLeft, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PosHeaderProps {
  onSearch: (query: string) => void
  terminalName?: string
  cashierName?: string
}

export function PosHeader({ onSearch, terminalName, cashierName }: PosHeaderProps) {
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-3">
      <div className="flex items-center gap-3">
        <Link
          href={currentUser?.role === "manager" ? "/admin" : "/pos"}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors"
          title={currentUser?.role === "manager" ? "Back to Admin" : "Switch Terminal"}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Monitor className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold text-card-foreground leading-none">
            MyQuickPOS
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{terminalName ?? "Terminal 01"}</p>
        </div>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-card-foreground font-mono leading-none">
            {time}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
        </div>
        <ThemeToggle />
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-secondary-foreground">
            {currentUser?.name ?? cashierName ?? "Cashier"}
          </span>
        </div>
        {currentUser?.role === "pos_user" && (
          <button
            onClick={() => {
              logout()
              router.push("/login")
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  )
}
