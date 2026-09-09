"use client"

import * as React from "react"
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
import { Card } from "@/components/ui/card"

interface LoginViewProps {
  onLoginSuccess: () => void
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = React.useState("professor@demo.com")
  const [password, setPassword] = React.useState("demo123")
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(true)

  // Direct React click handler: Switch directly from Login to Dashboard
  const handleEnterDashboard = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    onLoginSuccess()
  }

  // Direct React click handler: Switch directly from Login to Dashboard
  const handleContinueAsDemo = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    onLoginSuccess()
  }

  const handleFillDemo = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setEmail("professor@demo.com")
    setPassword("demo123")
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

          <form onSubmit={handleEnterDashboard} className="space-y-4">
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
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="professor@demo.com"
                  className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                  autoComplete="email"
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
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-10 py-1.5 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                  autoComplete="current-password"
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
            <button
              type="button"
              id="enter-dashboard-btn"
              onClick={handleEnterDashboard}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring select-none"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="size-4" />
            </button>

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
            <button
              type="button"
              id="continue-as-demo-btn"
              onClick={handleContinueAsDemo}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/5 py-2.5 px-4 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring select-none"
            >
              <Sparkles className="size-4 text-primary" />
              <span>Continue as Demo Instructor</span>
            </button>
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
