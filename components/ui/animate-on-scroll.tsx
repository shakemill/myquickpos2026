"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimateOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: number
  once?: boolean
  rootMargin?: string
  threshold?: number
  animation?: "fade-up" | "fade-in" | "scale"
}

export function AnimateOnScroll({
  children,
  className,
  delay = 0,
  once = true,
  rootMargin = "0px 0px -80px 0px",
  threshold = 0,
  animation = "fade-up",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    if (mq.matches) setIsVisible(true)
    const handler = () => {
      setPrefersReducedMotion(mq.matches)
      if (mq.matches) setIsVisible(true)
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { rootMargin, threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin, threshold])

  const visible = prefersReducedMotion || isVisible

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        !prefersReducedMotion && animation === "fade-up" &&
          (visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"),
        !prefersReducedMotion && animation === "fade-in" &&
          (visible ? "opacity-100" : "opacity-0"),
        !prefersReducedMotion && animation === "scale" &&
          (visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"),
        prefersReducedMotion && "opacity-100",
        className
      )}
      style={
        visible && delay > 0 && !prefersReducedMotion
          ? { transitionDelay: `${delay}ms` }
          : undefined
      }
    >
      {children}
    </div>
  )
}
