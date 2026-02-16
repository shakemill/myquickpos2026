import Link from "next/link"
import Image from "next/image"
import {
  Monitor,
  Globe,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
  Receipt,
  Package,
  Smartphone,
  WifiOff,
  Users,
  Heart,
  Coffee,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "MyQuickPOS - Point of Sale",
  description:
    "Modern touch-screen point of sale system for restaurants, cafés, and retail. Manage terminals, orders, and payments from one place.",
}

const FEATURES = [
  {
    icon: Globe,
    title: "Multi-location",
    description: "Manage all your terminals from a single dashboard",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description: "Track sales, revenue, and performance instantly",
  },
  {
    icon: Shield,
    title: "Secure & reliable",
    description: "Role-based access with encrypted data at rest",
  },
  {
    icon: Receipt,
    title: "Custom receipts",
    description: "Print or email branded receipts with your logo and details",
  },
  {
    icon: Package,
    title: "Inventory management",
    description: "Track stock levels, categories, and product variants",
  },
  {
    icon: Smartphone,
    title: "Touch-optimized",
    description: "Designed for tablets and touch screens at the counter",
  },
  {
    icon: WifiOff,
    title: "Offline mode",
    description: "Keep selling when the connection drops — syncs when back online",
  },
  {
    icon: Users,
    title: "Team & roles",
    description: "Add cashiers and managers with role-based permissions",
  },
]

const TESTIMONIALS = [
  {
    quote:
      "MyQuickPOS transformed how we manage our restaurant. Setting up terminals across three locations took minutes, not hours.",
    name: "Maria Rodriguez",
    role: "Owner, La Cocina Restaurant",
    initials: "MR",
  },
  {
    quote:
      "Finally, a POS that just works. No subscriptions, no hidden fees. We switched from our old system and never looked back.",
    name: "James Chen",
    role: "Manager, Urban Café",
    initials: "JC",
  },
  {
    quote:
      "The touch interface is perfect for our busy counter. Our staff picked it up in a day. Best decision we made this year.",
    name: "Sarah Williams",
    role: "Owner, The Daily Bakery",
    initials: "SW",
  },
]

const BENEFITS = [
  "Set up in under 2 minutes",
  "No credit card required",
  "Free to get started",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 transition-shadow duration-300">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-all duration-300 hover:opacity-90 focus:opacity-90 active:scale-[0.98]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Monitor className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              MyQuickPOS
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <a href="#donate">Donate</a>
            </Button>
            <Button size="sm" asChild className="shadow-sm">
              <Link href="/signup">
                Get started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-14 pb-12 sm:min-h-screen">
        <div className="absolute inset-0">
          <Image
            src="/images/login-cover.jpg"
            alt=""
            fill
            className="object-cover object-center transition-transform duration-700 ease-out"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background transition-opacity duration-500"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary opacity-0 animate-fade-up-in"
            style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
          >
            <Zap className="h-3.5 w-3.5" />
            Launch your POS in minutes
          </p>
          <h1
            className="text-4xl font-bold tracking-tight text-balance opacity-0 animate-fade-up-in sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            Point of sale that{" "}
            <span className="text-primary">just works</span>
          </h1>
          <p
            className="mt-6 text-base text-muted-foreground opacity-0 animate-fade-up-in sm:text-lg md:text-xl"
            style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
          >
            Set up terminals, manage products, and start accepting payments — all
            from one place.
          </p>

          <div
            className="mt-8 flex flex-col items-center justify-center gap-4 opacity-0 animate-fade-up-in sm:flex-row sm:gap-3"
            style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
          >
            <Button
              size="lg"
              asChild
              className="group h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              <Link href="/signup">
                Create free account
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-2 px-8 text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>

          <ul
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground opacity-0 animate-fade-up-in"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust bar */}
      <AnimateOnScroll animation="fade-up" rootMargin="0px 0px -60px 0px">
        <section className="border-y border-border bg-card/30 py-6">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-4 text-center sm:gap-12">
            <div className="transition-transform duration-300 hover:scale-105">
              <p className="text-2xl font-bold text-foreground">12k+</p>
              <p className="text-xs text-muted-foreground">Active terminals</p>
            </div>
            <div className="transition-transform duration-300 hover:scale-105">
              <p className="text-2xl font-bold text-foreground">99.9%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
            <div className="transition-transform duration-300 hover:scale-105">
              <p className="text-2xl font-bold text-foreground">4.2k</p>
              <p className="text-xs text-muted-foreground">Businesses</p>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Features */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need
              </h2>
              <p className="mt-3 text-muted-foreground">
                A complete solution for restaurants, cafés, and retail
              </p>
            </div>
          </AnimateOnScroll>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }, idx) => (
              <AnimateOnScroll
                key={title}
                animation="fade-up"
                delay={idx * 50}
                rootMargin="0px 0px -50px 0px"
              >
                <div className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-card/20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by businesses
              </h2>
              <p className="mt-3 text-muted-foreground">
                See what our users say about MyQuickPOS
              </p>
            </div>
          </AnimateOnScroll>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, initials }, idx) => (
              <AnimateOnScroll
                key={name}
                animation="fade-up"
                delay={idx * 80}
                rootMargin="0px 0px -60px 0px"
              >
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
                  <blockquote className="text-sm leading-relaxed text-foreground">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Donate - Free for life */}
      <AnimateOnScroll animation="scale" rootMargin="0px 0px -80px 0px">
        <section
          id="donate"
          className="scroll-mt-20 border-t border-border bg-primary/5 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-2xl px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 transition-transform duration-500 hover:scale-110">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
              Free for life. No subscription.
            </h2>
            <p className="mt-4 text-muted-foreground">
              MyQuickPOS is 100% free with no hidden fees or subscriptions. If it
              helps your business thrive, consider supporting its development so we
              can keep it free for everyone.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-primary/30 transition-all duration-300 hover:scale-105 hover:border-primary/50"
              >
                <a
                  href="https://www.buymeacoffee.com/myquickpos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  Buy Me a Coffee
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-primary/30 transition-all duration-300 hover:scale-105 hover:border-primary/50"
              >
                <a
                  href="https://github.com/sponsors/myquickpos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  GitHub Sponsors
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-primary/30 transition-all duration-300 hover:scale-105 hover:border-primary/50"
              >
                <a
                  href="https://paypal.me/myquickpos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PayPal
                </a>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Every donation helps maintain the servers and add new features.
            </p>
          </div>
        </section>
      </AnimateOnScroll>

      {/* CTA */}
      <AnimateOnScroll animation="fade-up" rootMargin="0px 0px -80px 0px">
        <section className="border-t border-border bg-card/20 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create your account for free. No credit card required.
            </p>
            <Button
              size="lg"
              asChild
              className="group mt-8 h-12 px-8 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              <Link href="/signup">
                Create free account
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Monitor className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">MyQuickPOS</span>
          </Link>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link
              href="/login"
              className="transition-colors duration-200 hover:text-foreground focus:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="transition-colors duration-200 hover:text-foreground focus:text-foreground"
            >
              Get started
            </Link>
            <a
              href="#donate"
              className="transition-colors duration-200 hover:text-foreground focus:text-foreground"
            >
              Donate
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
