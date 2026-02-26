import { OnboardingCover } from "@/components/auth/onboarding-cover"
import { OnboardingForm } from "@/components/auth/onboarding-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account - MyQuickPOS",
  description: "Create your MyQuickPOS business account in minutes",
}

export default function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <OnboardingCover />
      <OnboardingForm />
    </div>
  )
}
