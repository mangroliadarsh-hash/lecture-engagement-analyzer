import { cn } from "cn"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ConfidenceMeter({
  value,
  className,
}: {
  /** 0–1 */
  value: number
  className?: string
}) {
  const pct = Math.round(value * 100)
  const filled = Math.round(value * 5)
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px] text-muted-foreground",
              className,
            )}
          />
        }
      >
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2.5 w-1 rounded-sm",
                i < filled ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </span>
        <span className="tabular">{pct}% confidence</span>
      </TooltipTrigger>
      <TooltipContent>
        Estimated from available interaction data. Higher when multiple independent signals agree.
      </TooltipContent>
    </Tooltip>
  )
}
