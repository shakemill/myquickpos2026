"use client"

import { use } from "react"
import { PosTerminalView } from "@/components/pos/pos-terminal-view"

export default function PosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <PosTerminalView terminalId={id} />
}
