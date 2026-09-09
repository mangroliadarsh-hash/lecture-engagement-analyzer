"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "cn"
import { LogOut, Waves, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NAV_GROUPS, NAV_ITEMS } from "./nav-items"
import { useApp } from "@/components/app-provider"

export function SidebarNav({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { studentQuestions, user, logout, dataSource, studentCount } = useApp()
  const newQuestions = studentQuestions.filter((q) => q.status === "new").length

  const handleLogout = () => {
    onNavigate?.()
    logout()
    router.push("/")
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-xs">
            <Waves className="size-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">Lecture Lens</span>
            <span className="text-[11px] text-muted-foreground">Engagement Analyzer</span>
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Nav Groups */}
      <nav aria-label="Main" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.key} className="flex flex-col gap-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            {NAV_ITEMS.filter((i) => i.group === group.key).map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-xs"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.href === "/questions" && newQuestions > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 px-1.5 tabular text-[10px]">
                      {newQuestions}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        ))}

        {/* Telemetry Status Indicator */}
        <div className="mt-auto rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-2.5 text-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Audience Telemetry
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-foreground font-medium">
              {dataSource === "uploaded"
                ? "Real CSV Data"
                : `Synthetic (${studentCount} Students)`}
            </span>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 rounded-md p-1">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary shrink-0">
              {user?.avatar || "PR"}
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-xs font-medium text-foreground">
                {user?.name || "Dr. Priya Raman"}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {user?.email || "professor@demo.com"}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLogout}
            title="Log out"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
