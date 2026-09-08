"use client"

import { cn } from "cn"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SIGNALS } from "@/lib/signals"
import { formatTime } from "@/lib/format"
import type { Hotspot } from "@/lib/data"

const RING: Record<Hotspot["primarySignal"], string> = {
  confusion: "bg-signal-confusion text-primary-foreground ring-signal-confusion/30",
  rewatch: "bg-signal-rewatch text-foreground ring-signal-rewatch/30",
  dropoff: "bg-signal-dropoff text-primary-foreground ring-signal-dropoff/30",
  questions: "bg-signal-questions text-primary-foreground ring-signal-questions/30",
  difficulty: "bg-signal-difficulty text-primary-foreground ring-signal-difficulty/30",
}

export function HotspotMarker({
  hotspot,
  durationSec,
  selected,
  dimmed,
  onSelect,
}: {
  hotspot: Hotspot
  durationSec: number
  selected: boolean
  dimmed: boolean
  onSelect: (id: string) => void
}) {
  const meta = SIGNALS[hotspot.primarySignal]
  const Icon = meta.icon
  const left = `${(hotspot.peak / durationSec) * 100}%`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() => onSelect(hotspot.id)}
            aria-pressed={selected}
            aria-label={`${formatTime(hotspot.peak)} — ${hotspot.label}, ${hotspot.topic}`}
            style={{ left }}
            className={cn(
              "absolute top-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-sm ring-4 transition-all outline-none focus-visible:ring-ring",
              RING[hotspot.primarySignal],
              selected ? "scale-110 ring-[6px]" : "hover:scale-105",
              dimmed && !selected && "opacity-30",
            )}
          />
        }
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="tabular font-medium">{formatTime(hotspot.peak)}</span>
        <span className="opacity-60">·</span>
        {hotspot.label} — {hotspot.topic}
      </TooltipContent>
    </Tooltip>
  )
}
