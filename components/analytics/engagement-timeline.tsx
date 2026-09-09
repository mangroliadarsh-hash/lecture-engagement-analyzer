"use client"

import * as React from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "cn"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SIGNALS, SIGNAL_FILTERS } from "@/lib/signals"
import { formatTime } from "@/lib/format"
import type { Hotspot, SignalFilter, SignalType, TimelinePoint } from "@/lib/data"
import { HotspotMarker } from "./hotspot-marker"
import { TimelineLegend } from "./timeline-legend"

const Y_AXIS_WIDTH = 36

export const SIGNAL_COLORS: Record<SignalType | "engagement", string> = {
  engagement: "#059669", // Emerald
  confusion: "#ea580c",  // Rich orange
  rewatch: "#d97706",    // Amber
  dropoff: "#dc2626",    // Red
  questions: "#2563eb",  // Royal blue
  difficulty: "#9333ea", // Purple
}

const chartConfig: ChartConfig = {
  engagement: { label: "Engagement", color: SIGNAL_COLORS.engagement },
  confusion: { label: "Confusion", color: SIGNAL_COLORS.confusion },
  rewatch: { label: "Re-watch", color: SIGNAL_COLORS.rewatch },
  dropoff: { label: "Drop-off", color: SIGNAL_COLORS.dropoff },
  questions: { label: "Questions", color: SIGNAL_COLORS.questions },
  difficulty: { label: "Difficulty", color: SIGNAL_COLORS.difficulty },
}

function visibleSignals(filter: SignalFilter): Set<SignalType | "engagement"> {
  if (filter === "all") return new Set(["engagement", "confusion", "questions", "rewatch", "dropoff", "difficulty"])
  if (filter === "engagement") return new Set(["engagement"])
  return new Set(["engagement", filter])
}

interface TooltipPayload {
  payload?: TimelinePoint & { topic?: string }
}

function TimelineTooltip({
  active,
  payload,
  hotspots = [],
}: {
  active?: boolean
  payload?: TooltipPayload[]
  hotspots?: Hotspot[]
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  // Find active hotspot at this timestamp if any
  const matchedHotspot = hotspots.find((h) => point.t >= h.start && point.t <= h.end)

  const rows: { key: SignalType | "engagement" | "students"; label: string; value: string }[] = [
    { key: "engagement", label: "Engagement", value: `${point.engagement}%` },
    { key: "students", label: "Students watching", value: point.students.toLocaleString() },
    { key: "rewatch", label: "Re-watch activity", value: `${point.rewatch}%` },
    { key: "questions", label: "Questions", value: String(point.questions) },
    { key: "difficulty", label: "AI-est. difficulty", value: `${point.difficulty}/100` },
    { key: "confusion", label: "Confusion level", value: `${point.confusion}%` },
    { key: "dropoff", label: "Drop-off", value: `${point.dropoff}%` },
  ]

  return (
    <div className="min-w-56 rounded-xl border bg-popover/95 p-3 text-xs text-popover-foreground shadow-xl backdrop-blur-xs">
      <div className="flex items-center justify-between border-b pb-1.5 mb-2">
        <span className="font-mono font-bold tabular text-foreground text-sm">
          {formatTime(point.t)}
        </span>
        {matchedHotspot && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {matchedHotspot.topic}
          </span>
        )}
      </div>

      {point.topic && !matchedHotspot && (
        <p className="text-[11px] font-medium text-muted-foreground mb-2 truncate">
          Topic: {point.topic}
        </p>
      )}

      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
        {rows.map((r) => (
          <React.Fragment key={r.key}>
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              {r.key !== "students" && (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{ backgroundColor: SIGNAL_COLORS[r.key] }}
                />
              )}
              {r.label}
            </dt>
            <dd className="text-right font-medium tabular">{r.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  )
}

export function EngagementTimeline({
  timeline,
  hotspots,
  durationSec,
  selectedTimestamp,
  selectedHotspotId,
  filter,
  onFilterChange,
  onSelectHotspot,
  onSelectTimestamp,
  compact = false,
  showFilters = true,
}: {
  timeline: TimelinePoint[]
  hotspots: Hotspot[]
  durationSec: number
  selectedTimestamp: number | null
  selectedHotspotId: string | null
  filter: SignalFilter
  onFilterChange?: (f: SignalFilter) => void
  onSelectHotspot: (id: string) => void
  onSelectTimestamp?: (t: number) => void
  compact?: boolean
  showFilters?: boolean
}) {
  const visible = visibleSignals(filter)
  const focusOne = filter !== "all" && filter !== "engagement"
  const engagementOpacity = focusOne ? 0.35 : 1

  const ticks = React.useMemo(() => {
    const step = durationSec > 45 * 60 ? 600 : 300
    const out: number[] = []
    for (let t = 0; t <= durationSec; t += step) out.push(t)
    return out
  }, [durationSec])

  const handleClick = (state: any) => {
    const point = state?.activePayload?.[0]?.payload
    if (point && onSelectTimestamp) onSelectTimestamp(point.t)
  }

  const visibleHotspots = filter === "all" || filter === "engagement"
    ? hotspots
    : hotspots

  return (
    <div className="flex flex-col gap-3">
      {showFilters && onFilterChange && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-1 overflow-x-auto px-1 scrollbar-thin">
            <ToggleGroup
              value={[filter]}
              onValueChange={(v) => {
                const next = v[0] as SignalFilter | undefined
                if (next) onFilterChange(next)
              }}
              aria-label="Filter timeline signals"
              className="w-max"
            >
              {SIGNAL_FILTERS.map((f) => (
                <ToggleGroupItem key={f.value} value={f.value} size="sm" className="px-3 text-xs">
                  {f.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <TimelineLegend active={visible} />
        </div>
      )}

      <div className="flex flex-col">
        <ChartContainer
          config={chartConfig}
          className={cn("w-full", compact ? "h-44" : "h-64 md:h-80")}
        >
          <ComposedChart
            data={timeline}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            onClick={handleClick}
            style={{ cursor: onSelectTimestamp ? "pointer" : "default" }}
          >
            <defs>
              <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SIGNAL_COLORS.engagement} stopOpacity={0.32} />
                <stop offset="100%" stopColor={SIGNAL_COLORS.engagement} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, durationSec]}
              ticks={ticks}
              tickFormatter={formatTime}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              className="tabular"
            />
            <YAxis
              yAxisId="pct"
              domain={[0, 100]}
              width={Y_AXIS_WIDTH}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => `${v}`}
              ticks={[0, 25, 50, 75, 100]}
            />
            <YAxis yAxisId="count" orientation="right" domain={[0, 40]} hide />

            {hotspots.map((h) => {
              const isSelected = h.id === selectedHotspotId
              const signalColor = SIGNAL_COLORS[h.primarySignal] || SIGNAL_COLORS.confusion
              return (
                <ReferenceArea
                  key={h.id}
                  yAxisId="pct"
                  x1={h.start}
                  x2={h.end}
                  fill={signalColor}
                  fillOpacity={isSelected ? 0.22 : 0.08}
                  stroke={isSelected ? signalColor : undefined}
                  strokeOpacity={0.8}
                  strokeWidth={isSelected ? 1.5 : 1}
                  strokeDasharray="3 3"
                />
              )
            })}

            <RechartsTooltip
              content={<TimelineTooltip hotspots={hotspots} />}
              cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.25, strokeDasharray: "3 3" }}
            />

            <Area
              yAxisId="pct"
              type="monotone"
              dataKey="engagement"
              stroke={SIGNAL_COLORS.engagement}
              strokeWidth={2.2}
              fill="url(#engagementFill)"
              fillOpacity={engagementOpacity}
              strokeOpacity={engagementOpacity}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, stroke: SIGNAL_COLORS.engagement, strokeWidth: 2, fill: "#fff" }}
            />

            {visible.has("questions") && (
              <Bar
                yAxisId="count"
                dataKey="questions"
                fill={SIGNAL_COLORS.questions}
                fillOpacity={focusOne ? 0.9 : 0.65}
                radius={[2, 2, 0, 0]}
                barSize={compact ? 3 : 5}
                isAnimationActive={false}
              />
            )}

            {visible.has("confusion") && (
              <Line
                yAxisId="pct"
                type="monotone"
                dataKey="confusion"
                stroke={SIGNAL_COLORS.confusion}
                strokeWidth={focusOne ? 2.5 : 1.8}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {visible.has("rewatch") && (
              <Line
                yAxisId="pct"
                type="monotone"
                dataKey="rewatch"
                stroke={SIGNAL_COLORS.rewatch}
                strokeWidth={focusOne ? 2.5 : 1.8}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {visible.has("difficulty") && (
              <Line
                yAxisId="pct"
                type="monotone"
                dataKey="difficulty"
                stroke={SIGNAL_COLORS.difficulty}
                strokeWidth={focusOne ? 2.5 : 1.8}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {visible.has("dropoff") && (
              <Bar
                yAxisId="pct"
                dataKey="dropoff"
                fill={SIGNAL_COLORS.dropoff}
                fillOpacity={0.85}
                radius={[2, 2, 0, 0]}
                barSize={compact ? 3 : 5}
                isAnimationActive={false}
              />
            )}

            {selectedTimestamp !== null && (
              <ReferenceLine
                yAxisId="pct"
                x={selectedTimestamp}
                stroke="var(--foreground)"
                strokeWidth={1.5}
                label={{
                  value: formatTime(selectedTimestamp),
                  position: "top",
                  fontSize: 11,
                  fill: "var(--foreground)",
                  fontWeight: 600,
                }}
              />
            )}
          </ComposedChart>
        </ChartContainer>

        <div
          className="relative mt-1 h-10"
          style={{ marginLeft: Y_AXIS_WIDTH, marginRight: 8 }}
          role="group"
          aria-label="Confusion hotspots"
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" aria-hidden="true" />
          {visibleHotspots.map((h) => (
            <HotspotMarker
              key={h.id}
              hotspot={h}
              durationSec={durationSec}
              selected={h.id === selectedHotspotId}
              dimmed={focusOne && h.primarySignal !== filter}
              onSelect={onSelectHotspot}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
