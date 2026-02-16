import Image from "next/image"
import { Monitor } from "lucide-react"

export function LoginCover() {
  return (
    <div className="relative hidden h-screen overflow-hidden lg:flex lg:flex-col lg:justify-between">
      {/* Background image */}
      <Image
        src="/images/login-cover.jpg"
        alt="Restaurant interior with warm lighting"
        fill
        className="object-cover"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

      {/* Top brand watermark */}
      <div className="relative z-10 p-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(142,71%,45%)]">
            <Monitor className="h-4 w-4 text-[hsl(220,14%,6%)]" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            MyQuickPOS
          </span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 p-8">
        {/* Testimonial card */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <blockquote className="text-base leading-relaxed text-white/90 font-medium">
            {'"MyQuickPOS transformed how we manage our restaurant. Setting up terminals across three locations took minutes, not hours."'}
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/20 text-sm font-bold text-[hsl(142,71%,45%)]">
              MR
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Maria Rodriguez
              </p>
              <p className="text-xs text-white/60">
                Owner, La Cocina Restaurant
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
            <p className="text-xl font-bold text-white">12k+</p>
            <p className="text-xs text-white/50">Active Terminals</p>
          </div>
          <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
            <p className="text-xl font-bold text-white">99.9%</p>
            <p className="text-xs text-white/50">Uptime</p>
          </div>
          <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
            <p className="text-xl font-bold text-white">2.4M</p>
            <p className="text-xs text-white/50">Daily Transactions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
