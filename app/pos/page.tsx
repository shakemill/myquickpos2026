"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { TerminalPicker } from "@/components/pos/terminal-picker"

export default function PosPickerPage() {
  const { currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login")
    }
  }, [currentUser, router])

  if (!currentUser) return null

  return <TerminalPicker />
}
