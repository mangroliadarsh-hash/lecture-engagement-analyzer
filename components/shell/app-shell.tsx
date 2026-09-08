"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SidebarNav } from "./sidebar-nav"
import { LectureSelector } from "./lecture-selector"
import { NAV_ITEMS } from "./nav-items"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const current =
    NAV_ITEMS.find((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
    ) ?? NAV_ITEMS[0]
  const isStudentView = pathname.startsWith("/student")

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 border-r lg:block">
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarNav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h1 className="truncate text-sm font-medium">{current.label}</h1>
            <Badge
              variant="outline"
              className="hidden gap-1 text-muted-foreground sm:inline-flex"
            >
              <Sparkles data-icon="inline-start" />
              Demo data
            </Badge>
          </div>

          {!isStudentView && <LectureSelector className="max-w-[16rem] sm:max-w-xs" />}
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
