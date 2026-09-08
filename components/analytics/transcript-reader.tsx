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
  const flagged = segment.annotations.length > 0
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(segment)}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "group flex w-full gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected
            ? "border-primary/30 bg-primary/5"
            : "hover:bg-accent/60",
        )}
      >
        <span
          className={cn(
            "mt-0.5 shrink-0 font-mono text-xs tabular",
            selected ? "text-primary" : "text-muted-foreground",
          )}
        >
          [{formatTime(segment.start)}]
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span
            className={cn(
              "text-sm leading-relaxed text-pretty",
              selected ? "text-foreground" : "text-foreground/85",
            )}
          >
            {segment.text}
          </span>
          {flagged && (
            <span className="flex flex-wrap gap-1">
              {segment.annotations.map((a) => (
                <SignalBadge key={a} signal={a} className="h-[18px] text-[10px]" />
              ))}
            </span>
          )}
        </span>
      </button>
    </li>
  )
}

export function TranscriptReader({
  transcript,
  selectedTimestamp,
  onSelectTimestamp,
  className,
  maxHeightClassName = "max-h-[32rem]",
}: {
  transcript: TranscriptSegment[]
  selectedTimestamp: number | null
  onSelectTimestamp: (t: number) => void
  className?: string
  maxHeightClassName?: string
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedId = React.useMemo(() => {
    if (selectedTimestamp === null) return null
    return (
      transcript.find((s) => selectedTimestamp >= s.start && selectedTimestamp < s.end)?.id ??
      null
    )
  }, [transcript, selectedTimestamp])

  React.useEffect(() => {
    if (!selectedId || !containerRef.current) return
    const el = containerRef.current.querySelector<HTMLElement>(`[data-segment="${selectedId}"]`)
    if (!el) return
    const container = containerRef.current
    const offset = el.offsetTop - container.offsetTop - 16
    container.scrollTo({ top: offset, behavior: "smooth" })
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
