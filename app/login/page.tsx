import { LoginCover } from "@/components/auth/login-cover"
import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - MyQuickPOS",
  description: "Sign in to your MyQuickPOS admin dashboard",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Left: Cover image panel */}
      <div className="hidden lg:block lg:w-1/2">
        <LoginCover />
      </div>

      {/* Right: Login form panel */}
      <div className="w-full bg-background lg:w-1/2">
        <LoginForm />
      </div>
    </main>
  )
}
