"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { FileSpreadsheet, Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarNav } from "./sidebar-nav"
import { LectureSelector } from "./lecture-selector"
import { NAV_ITEMS } from "./nav-items"
import { useApp } from "@/components/app-provider"
import { LoginView } from "@/components/auth/login-view"
import { cn } from "cn"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, authChecked, login, dataSource } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const current =
    NAV_ITEMS.find((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
    ) ?? NAV_ITEMS[0]
  const isStudentView = pathname.startsWith("/student")

  // Keyboard Escape listener to close mobile menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileMenuOpen])

  // Body scroll locking when drawer is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Avoid flash before reading authentication status
  if (!authChecked) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Loading Lecture Lens...</p>
        </div>
      </div>
    )
  }

  // If user is not logged in, present the Login screen
  if (!isLoggedIn) {
    return (
      <LoginView
        onLoginSuccess={(u) => {
          login(u)
          if (pathname !== "/") {
            router.push("/")
          }
        }}
      />
    )
  }

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 border-r border-border bg-sidebar lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile Drawer Backdrop & Panel */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        <SidebarNav
          onNavigate={() => setMobileMenuOpen(false)}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/80 md:px-6">
          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-foreground hover:bg-muted"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
              {current.label}
            </h1>

            {dataSource === "synthetic" ? (
              <Badge
                variant="outline"
                className="hidden gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 sm:inline-flex"
              >
                <Sparkles className="size-3" />
                Synthetic Demo Engagement
              </Badge>
            ) : dataSource === "uploaded" ? (
              <Badge
                variant="outline"
                className="hidden gap-1 text-[11px] font-medium bg-primary/10 text-primary border-primary/30 sm:inline-flex"
              >
                <FileSpreadsheet className="size-3" />
                Uploaded Student Data
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="hidden gap-1 text-[11px] text-muted-foreground sm:inline-flex"
              >
                <Sparkles className="size-3" />
                Demo Mode
              </Badge>
            )}
          </div>

          {!isStudentView && <LectureSelector className="max-w-[16rem] sm:max-w-xs" />}
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
