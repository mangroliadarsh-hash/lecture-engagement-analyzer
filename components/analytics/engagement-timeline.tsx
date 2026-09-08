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

const chartConfig: ChartConfig = {
  engagement: { label: "Engagement", color: "var(--signal-engagement)" },
  confusion: { label: "Confusion", color: "var(--signal-confusion)" },
  rewatch: { label: "Re-watch", color: "var(--signal-rewatch)" },
  dropoff: { label: "Drop-off", color: "var(--signal-dropoff)" },
  questions: { label: "Questions", color: "var(--signal-questions)" },
  difficulty: { label: "Difficulty", color: "var(--signal-difficulty)" },
}

function visibleSignals(filter: SignalFilter): Set<SignalType | "engagement"> {
  if (filter === "all") return new Set(["engagement", "confusion", "questions", "rewatch", "dropoff", "difficulty"])
  if (filter === "engagement") return new Set(["engagement"])
  return new Set(["engagement", filter])
}

interface TooltipPayload {
  payload?: TimelinePoint
}

function TimelineTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
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
    <div className="min-w-48 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <p className="mb-1.5 font-medium tabular">{formatTime(point.t)}</p>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
        {rows.map((r) => (
          <React.Fragment key={r.key}>
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              {r.key !== "students" && (
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", SIGNALS[r.key].dot)}
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

  const handleClick = (state: { activePayload?: { payload: TimelinePoint }[] }) => {
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
                <stop offset="0%" stopColor="var(--color-engagement)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-engagement)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
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
              return (
                <ReferenceArea
                  key={h.id}
                  yAxisId="pct"
                  x1={h.start}
                  x2={h.end}
                  fill={`var(--color-${h.primarySignal})`}
                  fillOpacity={isSelected ? 0.18 : 0.07}
                  stroke={isSelected ? `var(--color-${h.primarySignal})` : undefined}
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                />
              )
            })}

            <RechartsTooltip
              content={<TimelineTooltip />}
              cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.25, strokeDasharray: "3 3" }}
            />

            <Area
              yAxisId="pct"
              type="monotone"
              dataKey="engagement"
              stroke="var(--color-engagement)"
              strokeWidth={2}
              fill="url(#engagementFill)"
              fillOpacity={engagementOpacity}
              strokeOpacity={engagementOpacity}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {visible.has("questions") && (
              <Bar
                yAxisId="count"
                dataKey="questions"
                fill="var(--color-questions)"
                fillOpacity={focusOne ? 0.9 : 0.55}
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
                stroke="var(--color-confusion)"
                strokeWidth={focusOne ? 2.5 : 1.75}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {visible.has("rewatch") && (
              <Line
                yAxisId="pct"
                type="monotone"
                dataKey="rewatch"
                stroke="var(--color-rewatch)"
                strokeWidth={focusOne ? 2.5 : 1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {visible.has("difficulty") && (
              <Line
                yAxisId="pct"
                type="monotone"
                dataKey="difficulty"
                stroke="var(--color-difficulty)"
                strokeWidth={focusOne ? 2.5 : 1.5}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {visible.has("dropoff") && (
              <Bar
                yAxisId="pct"
                dataKey="dropoff"
                fill="var(--color-dropoff)"
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
