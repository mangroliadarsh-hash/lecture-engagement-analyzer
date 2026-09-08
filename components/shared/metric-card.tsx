import { cn } from "cn"
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

export function MetricCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  trend,
  trendLabel,
  tone = "neutral",
}: {
  label: string
  value: string | number
  unit?: string
  hint?: string
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  tone?: "neutral" | "good" | "warn" | "bad"
}) {
  const trendIcon =
    trend === undefined || trend === 0 ? Minus : trend > 0 ? ArrowUpRight : ArrowDownRight
  const TrendIcon = trendIcon
  const toneClass = {
    neutral: "text-muted-foreground",
    good: "text-signal-engagement",
    warn: "text-signal-rewatch",
    bad: "text-signal-confusion",
  }[tone]

  return (
    <Card className="gap-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight tabular">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {(trend !== undefined || trendLabel) && (
          <span className={cn("inline-flex items-center gap-0.5 font-medium", toneClass)}>
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {trendLabel ?? `${trend! > 0 ? "+" : ""}${trend}%`}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  )
}
