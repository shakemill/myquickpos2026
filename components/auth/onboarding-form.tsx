"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { slugify } from "@/lib/tenant-store"
import { checkSubdomain, signup } from "@/app/actions/signup"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BusinessData {
  companyName: string
  businessType: string
  subdomain: string
  currency: string
}

interface AdminData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe / Coffee Shop" },
  { value: "retail", label: "Retail Store" },
  { value: "bar", label: "Bar / Lounge" },
  { value: "food-truck", label: "Food Truck" },
  { value: "bakery", label: "Bakery / Pastry" },
]

const STEPS = [
  { id: 1, label: "Business", icon: Building2 },
  { id: 2, label: "Admin Account", icon: User },
  { id: 3, label: "Confirm", icon: CheckCircle2 },
]

/* ------------------------------------------------------------------ */
/*  Subdomain field                                                    */
/* ------------------------------------------------------------------ */

function SubdomainField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const check = useCallback((slug: string) => {
    if (!slug || slug.length < 3) {
      setStatus("idle")
      return
    }
    setStatus("checking")
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const result = await checkSubdomain(slug)
      setStatus(result.available ? "available" : "taken")
    }, 400)
  }, [])

  useEffect(() => {
    check(value)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, check])

  return (
    <div className="space-y-2">
      <Label htmlFor="subdomain" className="text-foreground">
        Subdomain
      </Label>
      <div className="flex items-stretch">
        <div className="flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3">
          <Globe className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground select-none whitespace-nowrap">
            https://
          </span>
        </div>
        <div className="relative flex-1">
          <Input
            id="subdomain"
            value={value}
            onChange={(e) => {
              const slug = slugify(e.target.value)
              onChange(slug)
            }}
            placeholder="my-business"
            className="h-11 rounded-none border-x-0 bg-card text-card-foreground placeholder:text-muted-foreground"
            required
          />
        </div>
        <div className="flex items-center rounded-r-lg border border-l-0 border-input bg-muted px-3">
          <span className="text-sm text-muted-foreground select-none whitespace-nowrap">
            .myquickpos.app
          </span>
          <span className="ml-2 flex h-5 w-5 items-center justify-center">
            {status === "checking" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            {status === "available" && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
            {status === "taken" && (
              <X className="h-3.5 w-3.5 text-destructive" />
            )}
          </span>
        </div>
      </div>
      {status === "taken" && (
        <p className="text-xs text-destructive">
          This subdomain is already taken. Try another one.
        </p>
      )}
      {status === "available" && (
        <p className="text-xs text-primary">
          Great, this subdomain is available!
        </p>
      )}
      {value.length > 0 && value.length < 3 && (
        <p className="text-xs text-muted-foreground">
          Subdomain must be at least 3 characters.
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Password strength                                                  */
/* ------------------------------------------------------------------ */

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" }
  if (score === 2) return { score, label: "Fair", color: "bg-chart-3" }
  if (score === 3) return { score, label: "Good", color: "bg-chart-2" }
  return { score, label: "Strong", color: "bg-primary" }
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const done = current > step.id
        const active = current === step.id
        const StepIcon = step.icon
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  done || active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-3 mb-5 h-0.5 w-12 rounded-full transition-colors duration-300",
                  current > step.id + 1
                    ? "bg-primary"
                    : current > step.id
                      ? "bg-primary/50"
                      : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main form                                                          */
/* ------------------------------------------------------------------ */

export function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [business, setBusiness] = useState<BusinessData>({
    companyName: "",
    businessType: "",
    subdomain: "",
    currency: "USD",
  })

  const [admin, setAdmin] = useState<AdminData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Auto-suggest subdomain from company name
  const prevNameRef = useRef("")
  useEffect(() => {
    const slug = slugify(business.companyName)
    // Only auto-fill if user hasn't manually edited the subdomain yet
    if (
      business.subdomain === "" ||
      business.subdomain === slugify(prevNameRef.current)
    ) {
      setBusiness((prev) => ({ ...prev, subdomain: slug }))
    }
    prevNameRef.current = business.companyName
  }, [business.companyName, business.subdomain])

  /* ------ Validation ------ */

  const [subdomainAvailable, setSubdomainAvailable] = useState(false)
  useEffect(() => {
    if (business.subdomain.length < 3) {
      setSubdomainAvailable(false)
      return
    }
    let cancelled = false
    checkSubdomain(business.subdomain).then((r) => {
      if (!cancelled) setSubdomainAvailable(r.available)
    })
    return () => { cancelled = true }
  }, [business.subdomain])

  const isStep1Valid =
    business.companyName.trim().length > 0 &&
    business.businessType !== "" &&
    business.subdomain.length >= 3 &&
    subdomainAvailable

  const passwordStrength = getPasswordStrength(admin.password)

  const isStep2Valid =
    admin.fullName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email) &&
    admin.password.length >= 8 &&
    admin.password === admin.confirmPassword

  /* ------ Submit ------ */

  const [submitError, setSubmitError] = useState("")

  async function handleSubmit() {
    setIsSubmitting(true)
    setSubmitError("")
    const result = await signup({
      companyName: business.companyName.trim(),
      subdomain: business.subdomain,
      businessType: business.businessType,
      currency: business.currency,
      fullName: admin.fullName.trim(),
      email: admin.email.trim().toLowerCase(),
      password: admin.password,
    })
    setIsSubmitting(false)
    if (result.ok) {
      setStep(4)
    } else {
      setSubmitError(result.error ?? "Something went wrong")
    }
  }

  /* ------ Render ------ */

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 lg:px-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started with MyQuickPOS in a few steps
            </p>
          </div>
        </div>

        {/* Step indicator (hide on success) */}
        {step <= 3 && (
          <div className="mb-8">
            <StepIndicator current={step} />
          </div>
        )}

        {/* ---- Step 1: Business ---- */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-1">
                Business Information
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tell us about your business so we can set everything up.
              </p>

              <div className="flex flex-col gap-5">
                {/* Company name */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    value={business.companyName}
                    onChange={(e) =>
                      setBusiness((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    placeholder="My Awesome Restaurant"
                    className="h-11 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                {/* Business type */}
                <div className="space-y-2">
                  <Label className="text-foreground">Business Type</Label>
                  <Select
                    value={business.businessType}
                    onValueChange={(v) =>
                      setBusiness((prev) => ({ ...prev, businessType: v }))
                    }
                  >
                    <SelectTrigger className="h-11 bg-secondary border-border text-card-foreground">
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((bt) => (
                        <SelectItem key={bt.value} value={bt.value}>
                          {bt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subdomain */}
                <SubdomainField
                  value={business.subdomain}
                  onChange={(v) =>
                    setBusiness((prev) => ({ ...prev, subdomain: v }))
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                size="lg"
                className="h-11 w-full text-sm font-semibold"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ---- Step 2: Admin Account ---- */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-1">
                Admin Account
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Create the first administrator account for your business.
              </p>

              <div className="flex flex-col gap-5">
                {/* Full name */}
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullname"
                    value={admin.fullName}
                    onChange={(e) =>
                      setAdmin((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="John Doe"
                    className="h-11 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={admin.email}
                    onChange={(e) =>
                      setAdmin((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="john@mybusiness.com"
                    className="h-11 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={admin.password}
                      onChange={(e) =>
                        setAdmin((prev) => ({ ...prev, password: e.target.value }))
                      }
                      placeholder="Min. 8 characters"
                      className="h-11 pr-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {admin.password.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex h-1.5 gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-full flex-1 rounded-full transition-colors duration-300",
                              level <= passwordStrength.score
                                ? passwordStrength.color
                                : "bg-border"
                            )}
                          />
                        ))}
                      </div>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          passwordStrength.score <= 1
                            ? "text-destructive"
                            : passwordStrength.score === 2
                              ? "text-chart-3"
                              : passwordStrength.score === 3
                                ? "text-chart-2"
                                : "text-primary"
                        )}
                      >
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <Label htmlFor="admin-confirm" className="text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-confirm"
                      type={showConfirm ? "text" : "password"}
                      value={admin.confirmPassword}
                      onChange={(e) =>
                        setAdmin((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Re-enter your password"
                      className="h-11 pr-10 bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {admin.confirmPassword.length > 0 &&
                    admin.password !== admin.confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match.
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-4">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal text-card-foreground cursor-pointer leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-medium text-primary hover:text-primary/80 transition-colors underline"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="font-medium text-primary hover:text-primary/80 transition-colors underline"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 flex-1 border-border text-muted-foreground"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                size="lg"
                className="h-11 flex-1 text-sm font-semibold"
                disabled={!isStep2Valid || !acceptedTerms}
                onClick={() => setStep(3)}
              >
                Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ---- Step 3: Review & Confirm ---- */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-1">
                Review & Create
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Please verify your information before creating the account.
              </p>

              {/* Business summary */}
              <div className="rounded-lg border border-border bg-secondary/50 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-card-foreground">Business</h3>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Company</dt>
                  <dd className="text-card-foreground font-medium">{business.companyName}</dd>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="text-card-foreground font-medium capitalize">
                    {BUSINESS_TYPES.find((bt) => bt.value === business.businessType)?.label}
                  </dd>
                  <dt className="text-muted-foreground">Subdomain</dt>
                  <dd className="text-card-foreground font-medium">
                    <span className="text-primary">{business.subdomain}</span>
                    <span className="text-muted-foreground">.myquickpos.app</span>
                  </dd>
                </dl>
              </div>

              {/* Admin summary */}
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-card-foreground">Admin Account</h3>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="text-card-foreground font-medium">{admin.fullName}</dd>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="text-card-foreground font-medium break-all">{admin.email}</dd>
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="text-card-foreground font-medium">Administrator</dd>
                </dl>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {submitError}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 flex-1 border-border text-muted-foreground"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                size="lg"
                className="h-11 flex-1 text-sm font-semibold"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ---- Step 4: Success ---- */}
        {step === 4 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 mb-5">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Account Created Successfully!
            </h2>
            <p className="text-sm text-muted-foreground mb-2 max-w-xs">
              Your business <span className="font-semibold text-foreground">{business.companyName}</span> is
              now set up and ready to go.
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              Your dashboard is available at{" "}
              <span className="font-medium text-primary">
                {business.subdomain}.myquickpos.app
              </span>
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                size="lg"
                className="h-11 w-full text-sm font-semibold"
                onClick={() => router.push(`/login?tenantSlug=${encodeURIComponent(business.subdomain)}`)}
              >
                Go to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                Sign in with subdomain <span className="font-medium text-foreground">{business.subdomain}</span> and email{" "}
                <span className="font-medium text-foreground">{admin.email}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
