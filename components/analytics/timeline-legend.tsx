import { cn } from "cn"
import { SIGNALS } from "@/lib/signals"
import type { SignalType } from "@/lib/data"

const ORDER: (SignalType | "engagement")[] = [
  "engagement",
  "confusion",
  "questions",
  "rewatch",
  "dropoff",
  "difficulty",
]

export function TimelineLegend({
  active,
  className,
}: {
  active: Set<SignalType | "engagement">
  className?: string
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs", className)}>
      {ORDER.map((key) => {
        const meta = SIGNALS[key]
        const Icon = meta.icon
        const on = active.has(key)
        return (
          <li
            key={key}
            className={cn(
              "flex items-center gap-1.5 transition-opacity",
              on ? "text-foreground" : "text-muted-foreground/60",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", meta.dot, !on && "opacity-40")}
            />
            <Icon className="size-3.5" aria-hidden="true" />
            <span>{meta.shortLabel}</span>
          </li>
        )
      })}
    </ul>
  )
}
