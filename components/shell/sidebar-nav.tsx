"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"
import { Waves } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NAV_GROUPS, NAV_ITEMS } from "./nav-items"
import { useApp } from "@/components/app-provider"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { studentQuestions } = useApp()
  const newQuestions = studentQuestions.filter((q) => q.status === "new").length

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Waves className="size-4" aria-hidden="true" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">Lecture Lens</span>
          <span className="text-[11px] text-muted-foreground">Engagement Analyzer</span>
        </div>
      </div>

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
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.href === "/questions" && newQuestions > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 px-1.5 tabular">
                      {newQuestions}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            PR
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">Dr. Priya Raman</span>
            <span className="truncate text-[11px] text-muted-foreground">Instructor · Demo workspace</span>
          </div>
        </div>
      </div>
    </div>
  )
}
