"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  ArrowRight,
  Brain,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DEMO_USER, saveUser, type AuthUser } from "@/lib/auth"

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const router = useRouter()
  const [email, setEmail] = React.useState("professor@demo.com")
  const [password, setPassword] = React.useState("demo123")
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Proper React submit handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanEmail = email.trim()
    const cleanPassword = password.trim()

    if (!cleanEmail) {
      setError("Please enter your academic email address.")
      return
    }
    if (!cleanPassword) {
      setError("Please enter your password.")
      return
    }

    const isDemoEmail = cleanEmail.toLowerCase() === "professor@demo.com"
    const isDemoPassword = cleanPassword === "demo123"

    if (!isDemoEmail || !isDemoPassword) {
      setError("Invalid demo credentials. Use professor@demo.com / demo123")
      return
    }

    const user: AuthUser = {
      ...DEMO_USER,
      email: cleanEmail,
    }

    // Persist authenticated state in localStorage
    saveUser(user, rememberMe)
    toast.success(`Welcome back, ${user.name}!`)
    onLoginSuccess(user)
    router.push("/")
  }

  // Populate demo credentials
  const handleFillDemo = () => {
    setEmail("professor@demo.com")
    setPassword("demo123")
    setError(null)
    toast.info("Demo credentials filled: professor@demo.com / demo123")
  }

  // Quick action: Continue as Demo Instructor immediately
  const handleContinueAsDemo = () => {
    setEmail("professor@demo.com")
    setPassword("demo123")
    setError(null)

    const user: AuthUser = { ...DEMO_USER }
    saveUser(user, true)
    toast.success(`Welcome back, ${user.name}!`)
    onLoginSuccess(user)
    router.push("/")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-4 ring-primary/10">
            <Waves className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Lecture Lens
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              AI-Based Lecture Engagement Analyzer
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 border shadow-lg bg-card/95 backdrop-blur-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Instructor Portal Sign In
            </h2>
            <p className="text-xs text-muted-foreground">
              Access timestamped confusion hotspots, cognitive friction metrics, and student doubt trends.
            </p>
          </div>

          {error && (
            <div
              id="login-error-alert"
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-medium text-destructive flex items-start gap-2"
            >
              <span className="font-semibold shrink-0">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-medium text-foreground flex items-center justify-between"
              >
                <span>Academic Email</span>
                <span className="text-[10px] text-muted-foreground">Demo: professor@demo.com</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="professor@demo.com"
                  className="pl-9 text-sm"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-medium text-foreground flex items-center justify-between"
              >
                <span>Password</span>
                <span className="text-[10px] text-muted-foreground">Demo: demo123</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="••••••••"
                  className="pl-9 pr-10 text-sm font-mono"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Fill demo */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-primary/20 accent-primary"
                />
                <span>Remember me on this browser</span>
              </label>
              <button
                type="button"
                id="fill-demo-btn"
                onClick={handleFillDemo}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Fill demo
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              id="enter-dashboard-btn"
              className="w-full gap-2 text-xs font-semibold py-2.5 cursor-pointer shadow-xs"
            >
              Enter Dashboard
              <ArrowRight className="size-4" />
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                or quick access
              </span>
            </div>

            {/* Continue as Demo Instructor Button */}
            <Button
              type="button"
              id="continue-as-demo-btn"
              variant="outline"
              onClick={handleContinueAsDemo}
              className="w-full gap-2 text-xs font-semibold py-2.5 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              <Sparkles className="size-4 text-primary" />
              Continue as Demo Instructor
            </Button>
          </form>

          {/* Demo Helper Box */}
          <div className="rounded-xl border bg-muted/40 p-3.5 text-xs space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldCheck className="size-4 text-primary" />
              <span>Demo Account Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground">
              <div className="rounded bg-background/80 p-2 border">
                <span className="block text-foreground font-medium">Email:</span>
                professor@demo.com
              </div>
              <div className="rounded bg-background/80 p-2 border">
                <span className="block text-foreground font-medium">Password:</span>
                demo123
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">
              Click &quot;Enter Dashboard&quot; or &quot;Continue as Demo Instructor&quot; to begin evaluating university lectures.
            </p>
          </div>
        </Card>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border bg-background/50 px-2.5 py-1">
            <Sparkles className="size-3 text-primary" /> Gemini Video AI
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border bg-background/50 px-2.5 py-1">
            <Activity className="size-3 text-emerald-500" /> Synthetic Audience Sim
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border bg-background/50 px-2.5 py-1">
            <Brain className="size-3 text-purple-500" /> Cognitive Friction 0-100
          </span>
        </div>
      </div>
    </div>
  )
}
