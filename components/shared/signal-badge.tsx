import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { SEVERITY_STYLES, SIGNALS, PRIORITY_STYLES, difficultyTone } from "@/lib/signals"
import type { Priority, Severity, SignalType } from "@/lib/data"

export function SignalBadge({
  signal,
  short = false,
  className,
}: {
  signal: SignalType | "engagement"
  short?: boolean
  className?: string
}) {
  const meta = SIGNALS[signal]
  const Icon = meta.icon
  return (
    <Badge variant="outline" className={cn("gap-1 border", meta.badge, className)}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      {short ? meta.shortLabel : meta.label}
    </Badge>
  )
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  const s = SEVERITY_STYLES[severity]
  return (
    <Badge variant="outline" className={cn("border", s.className, className)}>
      {s.label}
    </Badge>
  )
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("border", PRIORITY_STYLES[priority], className)}>
      {priority} priority
    </Badge>
  )
}

export function DifficultyBadge({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const tone = difficultyTone(score)
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border tabular", SEVERITY_STYLES[tone].className, className)}
      title="AI-estimated difficulty, 0–100"
    >
      <span className="text-[10px] uppercase tracking-wide opacity-70">AI est.</span>
      {score}/100
    </Badge>
  )
}
