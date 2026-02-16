import Image from "next/image"
import { Monitor, BarChart3, Globe, Shield } from "lucide-react"

export function OnboardingCover() {
  return (
    <div className="relative hidden h-screen overflow-hidden lg:flex lg:flex-col lg:justify-between">
      {/* Background image */}
      <Image
        src="/images/login-cover.jpg"
        alt="Restaurant interior"
        fill
        className="object-cover"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/35" />

      {/* Top brand */}
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

      {/* Center content -- feature highlights */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8">
        <h2 className="text-3xl font-bold text-white leading-tight text-balance">
          Launch your point of sale in minutes
        </h2>
        <p className="mt-3 text-base text-white/70 leading-relaxed max-w-md">
          Set up terminals, manage products, and start accepting payments -- all from one place.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {[
            {
              icon: Globe,
              title: "Multi-location support",
              desc: "Manage all your terminals from a single dashboard",
            },
            {
              icon: BarChart3,
              title: "Real-time analytics",
              desc: "Track sales, revenue, and performance instantly",
            },
            {
              icon: Shield,
              title: "Enterprise-grade security",
              desc: "Role-based access with encrypted data at rest",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(142,71%,45%)]/15">
                <feature.icon className="h-4 w-4 text-[hsl(142,71%,45%)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="text-xs text-white/55">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="relative z-10 p-8">
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
            <p className="text-xl font-bold text-white">12k+</p>
            <p className="text-xs text-white/50">Active Terminals</p>
          </div>
          <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
            <p className="text-xl font-bold text-white">99.9%</p>
            <p className="text-xs text-white/50">Uptime</p>
          </div>
          <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
            <p className="text-xl font-bold text-white">4.2k</p>
            <p className="text-xs text-white/50">Businesses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
