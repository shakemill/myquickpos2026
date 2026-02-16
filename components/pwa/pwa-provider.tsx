"use client"

import { useServiceWorker } from "@/hooks/use-service-worker"
import { PwaInstallPrompt } from "./pwa-install-prompt"
import { PwaUpdateBanner } from "./pwa-update-banner"

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { isUpdateAvailable, updateApp } = useServiceWorker()

  return (
    <>
      {children}
      <PwaInstallPrompt />
      {isUpdateAvailable && <PwaUpdateBanner onUpdate={updateApp} />}
    </>
  )
}
