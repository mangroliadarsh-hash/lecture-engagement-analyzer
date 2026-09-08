"use client"

import * as React from "react"
import { cn } from "cn"
import { SignalBadge } from "@/components/shared/signal-badge"
import { formatTime } from "@/lib/format"
import type { TranscriptSegment } from "@/lib/data"

function TranscriptSegmentRow({
  segment,
  selected,
  onSelect,
}: {
  segment: TranscriptSegment
  selected: boolean
  onSelect: (segment: TranscriptSegment) => void
}) {
  const isGradientDescent = segment.hotspotId === "h-1715"
  const flagged = segment.annotations.length > 0 || isGradientDescent

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(segment)}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "group flex w-full gap-3 rounded-lg border px-3.5 py-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected
            ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
            : "border-transparent hover:border-border/60 hover:bg-accent/40",
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <span
            className={cn(
              "shrink-0 font-mono text-xs font-semibold tabular",
              selected ? "text-primary" : "text-muted-foreground",
            )}
          >
            [{formatTime(segment.start)}]
          </span>
          {selected && (
            <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p
            className={cn(
              "text-sm leading-relaxed text-pretty",
              selected ? "font-medium text-foreground" : "text-foreground/85",
            )}
          >
            {segment.text}
          </p>
          {flagged && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {isGradientDescent ? (
                <>
                  <span className="inline-flex items-center rounded-md border border-signal-confusion/30 bg-signal-confusion/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-signal-confusion">
                    HIGH CONFUSION
                  </span>
                  <span className="inline-flex items-center rounded-md border border-signal-rewatch/30 bg-signal-rewatch/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-signal-rewatch">
                    RE-WATCH SPIKE
                  </span>
                  <span className="inline-flex items-center rounded-md border border-signal-questions/30 bg-signal-questions/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-signal-questions">
                    QUESTION HOTSPOT
                  </span>
                </>
              ) : (
                segment.annotations.map((a) => (
                  <SignalBadge key={a} signal={a} className="h-[20px] text-[10px] font-semibold" />
                ))
              )}
            </div>
          )}
        </div>
      </button>
    </li>
  )
}

export function TranscriptReader({
  transcript,
  selectedTimestamp,
  selectedHotspotId,
  onSelectTimestamp,
  className,
  maxHeightClassName = "max-h-[34rem]",
}: {
  transcript: TranscriptSegment[]
  selectedTimestamp: number | null
  selectedHotspotId?: string | null
  onSelectTimestamp: (t: number) => void
  className?: string
  maxHeightClassName?: string
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedId = React.useMemo(() => {
    if (selectedHotspotId) {
      const match = transcript.find((s) => s.hotspotId === selectedHotspotId)
      if (match) return match.id
    }
    if (selectedTimestamp === null) return null
    return (
      transcript.find((s) => selectedTimestamp >= s.start && selectedTimestamp <= s.end)?.id ??
      transcript.find((s) => Math.abs(selectedTimestamp - s.start) <= 60)?.id ??
      null
    )
  }, [transcript, selectedTimestamp, selectedHotspotId])

  React.useEffect(() => {
    if (!selectedId || !containerRef.current) return
    const el = containerRef.current.querySelector<HTMLElement>(`[data-segment="${selectedId}"]`)
    if (!el) return
    const container = containerRef.current
    const offset = el.offsetTop - container.offsetTop - 24
    container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" })
  }, [selectedId])

  const sections = React.useMemo(() => {
    const out: { section: string; segments: TranscriptSegment[] }[] = []
    for (const s of transcript) {
      const last = out[out.length - 1]
      if (last && last.section === s.section) last.segments.push(s)
      else out.push({ section: s.section, segments: [s] })
    }
    return out
  }, [transcript])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-y-auto scrollbar-thin", maxHeightClassName, className)}
      aria-label="Lecture transcript"
    >
      <div className="flex flex-col gap-4 p-2">
        {sections.map((group) => (
          <section key={group.section} className="flex flex-col gap-0.5">
            <h4 className="sticky top-0 z-10 -mx-2 bg-card/95 px-5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
              {group.section}
            </h4>
            <ul className="flex flex-col gap-0.5">
              {group.segments.map((s) => (
                <div key={s.id} data-segment={s.id}>
                  <TranscriptSegmentRow
                    segment={s}
                    selected={s.id === selectedId}
                    onSelect={(seg) => onSelectTimestamp(seg.hotspotId ? (seg.start + seg.end) / 2 : seg.start)}
                  />
                </div>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
