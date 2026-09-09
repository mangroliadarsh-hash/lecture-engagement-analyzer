"use client"

import * as React from "react"
import { cn } from "cn"

interface DropdownContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DropdownContext = React.createContext<DropdownContextType | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  className,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(DropdownContext)
  if (!ctx) throw new Error("DropdownMenuTrigger must be in DropdownMenu")

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen((prev) => !prev)}
      aria-expanded={ctx.open}
      aria-haspopup="true"
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  className,
  align = "right",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "left" | "right" }) {
  const ctx = React.useContext(DropdownContext)
  if (!ctx) throw new Error("DropdownMenuContent must be in DropdownMenu")

  if (!ctx.open) return null

  return (
    <div
      role="menu"
      className={cn(
        "absolute z-50 mt-2 min-w-[13rem] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95",
        align === "right" ? "right-0" : "left-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(DropdownContext)

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return
        onClick?.(e)
        ctx?.setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 text-left",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1.5 my-1 h-px bg-border", className)} />
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("px-2.5 py-1 text-[11px] font-semibold text-muted-foreground", className)}>
      {children}
    </div>
  )
}
