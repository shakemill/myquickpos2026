"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Eye,
  Send,
  Copy,
  Check,
  Monitor,
  Smartphone,
  Maximize2,
  X,
} from "lucide-react"

interface WelcomeEmailProps {
  companyName?: string
  adminName?: string
  adminEmail?: string
  subdomain?: string
  loginUrl?: string
}

function EmailBody({
  companyName = "Acme Restaurant",
  adminName = "John Doe",
  adminEmail = "john@acme.com",
  subdomain = "acme",
  loginUrl = "https://acme.myquickpos.app/login",
}: WelcomeEmailProps) {
  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#f4f4f5",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header Band */}
        <div
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            padding: "32px 32px 28px",
            textAlign: "center" as const,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.2)",
              marginBottom: 16,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h1
            style={{
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome to MyQuickPOS
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
              margin: 0,
            }}
          >
            Your point-of-sale system is ready
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "32px 32px 24px" }}>
          <p
            style={{
              color: "#18181b",
              fontSize: 15,
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            Hi <strong>{adminName}</strong>,
          </p>
          <p
            style={{
              color: "#3f3f46",
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            Your business <strong style={{ color: "#18181b" }}>{companyName}</strong> has been
            successfully created on MyQuickPOS. You can now sign in to your
            dedicated dashboard and start managing your terminals, products, and
            staff.
          </p>

          {/* Info Card */}
          <div
            style={{
              backgroundColor: "#f4f4f5",
              borderRadius: 8,
              padding: "20px 20px 16px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                color: "#71717a",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
                margin: "0 0 12px",
              }}
            >
              Your Account Details
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      color: "#71717a",
                      fontSize: 13,
                      padding: "6px 0",
                      verticalAlign: "top" as const,
                      width: 110,
                    }}
                  >
                    Business
                  </td>
                  <td
                    style={{
                      color: "#18181b",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "6px 0",
                    }}
                  >
                    {companyName}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      color: "#71717a",
                      fontSize: 13,
                      padding: "6px 0",
                      verticalAlign: "top" as const,
                    }}
                  >
                    Dashboard
                  </td>
                  <td
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "6px 0",
                    }}
                  >
                    <a
                      href={loginUrl}
                      style={{ color: "#16a34a", textDecoration: "none" }}
                    >
                      {subdomain}.myquickpos.app
                    </a>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      color: "#71717a",
                      fontSize: 13,
                      padding: "6px 0",
                      verticalAlign: "top" as const,
                    }}
                  >
                    Email
                  </td>
                  <td
                    style={{
                      color: "#18181b",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "6px 0",
                    }}
                  >
                    {adminEmail}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      color: "#71717a",
                      fontSize: 13,
                      padding: "6px 0",
                      verticalAlign: "top" as const,
                    }}
                  >
                    Role
                  </td>
                  <td
                    style={{
                      color: "#18181b",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "6px 0",
                    }}
                  >
                    Administrator
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center" as const, marginBottom: 24 }}>
            <a
              href={loginUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                padding: "12px 32px",
                borderRadius: 8,
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              Sign In to Your Dashboard
            </a>
          </div>

          {/* Getting Started Steps */}
          <div
            style={{
              borderTop: "1px solid #e4e4e7",
              paddingTop: 24,
              marginBottom: 8,
            }}
          >
            <p
              style={{
                color: "#71717a",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
                margin: "0 0 16px",
              }}
            >
              Getting Started
            </p>

            {[
              {
                step: "1",
                title: "Set up your terminals",
                desc: "Configure POS terminals for each checkout station.",
              },
              {
                step: "2",
                title: "Add your products",
                desc: "Create categories and add items with prices.",
              },
              {
                step: "3",
                title: "Invite your team",
                desc: "Add cashiers and managers to your account.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: "#f0fdf4",
                    color: "#16a34a",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <p
                    style={{
                      color: "#18181b",
                      fontSize: 13,
                      fontWeight: 600,
                      margin: "0 0 2px",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      color: "#71717a",
                      fontSize: 12,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#fafafa",
            borderTop: "1px solid #e4e4e7",
            padding: "20px 32px",
            textAlign: "center" as const,
          }}
        >
          <p
            style={{
              color: "#a1a1aa",
              fontSize: 12,
              margin: "0 0 8px",
              lineHeight: 1.5,
            }}
          >
            Need help? Reply to this email or visit our{" "}
            <a
              href="#"
              style={{ color: "#16a34a", textDecoration: "none" }}
            >
              Help Center
            </a>
          </p>
          <p
            style={{
              color: "#d4d4d8",
              fontSize: 11,
              margin: 0,
            }}
          >
            MyQuickPOS &middot; myquickpos.app
          </p>
        </div>
      </div>

      {/* Unsubscribe */}
      <p
        style={{
          color: "#a1a1aa",
          fontSize: 11,
          textAlign: "center" as const,
          marginTop: 20,
        }}
      >
        You received this email because an account was created for you at MyQuickPOS.
      </p>
    </div>
  )
}

/* ---- Exported wrapper with preview controls ---- */

export function WelcomeEmailTemplate() {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop")
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [sent, setSent] = useState(false)

  // Editable preview placeholders
  const [companyName, setCompanyName] = useState("Acme Restaurant")
  const [adminName, setAdminName] = useState("John Doe")
  const [adminEmail, setAdminEmail] = useState("john@acme.com")
  const [subdomain, setSubdomain] = useState("acme")

  const loginUrl = `https://${subdomain}.myquickpos.app/login`

  function handleCopy() {
    // Build static HTML string for clipboard
    const el = document.getElementById("email-preview-root")
    if (el) {
      navigator.clipboard.writeText(el.innerHTML)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleSendTest() {
    // Simulated send
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setSendOpen(false)
      setTestEmail("")
    }, 2000)
  }

  const emailProps: WelcomeEmailProps = {
    companyName,
    adminName,
    adminEmail,
    subdomain,
    loginUrl,
  }

  return (
    <div className="space-y-5">
      {/* Editable placeholders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Company Name</Label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-9 bg-secondary border-border text-card-foreground text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Admin Name</Label>
          <Input
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="h-9 bg-secondary border-border text-card-foreground text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Admin Email</Label>
          <Input
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="h-9 bg-secondary border-border text-card-foreground text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subdomain</Label>
          <Input
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            className="h-9 bg-secondary border-border text-card-foreground text-sm"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            onClick={() => setViewport("desktop")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              viewport === "desktop"
                ? "bg-secondary text-card-foreground"
                : "text-muted-foreground hover:text-card-foreground"
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              viewport === "mobile"
                ? "bg-secondary text-card-foreground"
                : "text-muted-foreground hover:text-card-foreground"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy HTML"}
          </button>
          <button
            onClick={() => setSendOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground"
          >
            <Send className="h-3.5 w-3.5" />
            Send Test
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Email Preview */}
      <div
        className={cn(
          "mx-auto rounded-xl border border-border overflow-hidden bg-[#f4f4f5] transition-all duration-300",
          viewport === "mobile" ? "max-w-[375px]" : "max-w-full"
        )}
      >
        <div
          className="overflow-y-auto"
          style={{ maxHeight: 600 }}
          id="email-preview-root"
        >
          <EmailBody {...emailProps} />
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-4xl h-[90vh] bg-card border-border p-0 flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-card-foreground">
                  Welcome Email Preview
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Full-size preview of the welcome email template
                </DialogDescription>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                <button
                  onClick={() => setViewport("desktop")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    viewport === "desktop"
                      ? "bg-secondary text-card-foreground"
                      : "text-muted-foreground hover:text-card-foreground"
                  )}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop
                </button>
                <button
                  onClick={() => setViewport("mobile")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    viewport === "mobile"
                      ? "bg-secondary text-card-foreground"
                      : "text-muted-foreground hover:text-card-foreground"
                  )}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-[#e4e4e7] p-6">
            <div
              className={cn(
                "mx-auto transition-all duration-300",
                viewport === "mobile" ? "max-w-[375px]" : "max-w-[600px]"
              )}
            >
              <EmailBody {...emailProps} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Test Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Send Test Email
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Send a preview of this welcome email to a test address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm text-card-foreground">
                Recipient Email
              </Label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="bg-secondary border-border text-card-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border text-muted-foreground"
                onClick={() => setSendOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!testEmail.trim() || sent}
                onClick={handleSendTest}
              >
                {sent ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
