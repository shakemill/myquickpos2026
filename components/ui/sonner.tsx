'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react'

type ToasterProps = React.ComponentProps<typeof Sonner>

const toastIcons = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />,
  error: <XCircle className="h-4 w-4 text-red-500" aria-hidden />,
  info: <Info className="h-4 w-4 text-blue-500" aria-hidden />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />,
  loading: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />,
  close: <X className="h-3.5 w-3" aria-hidden />,
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={toastIcons}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
