"use client"

import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { EngagementTimeline } from "@/components/analytics/engagement-timeline"
import {
  DifficultyBadge,
  PriorityBadge,
  SeverityBadge,
  SignalBadge,
} from "@/components/shared/signal-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatRange, formatTime, relativeTime } from "@/lib/format"
import { lectureLabel } from "@/lib/data"

export default function OverviewPage() {
  const {
    lecture,
    selectedHotspotId,
    selectedTimestamp,
    selectHotspot,
    selectTimestamp,
    signalFilter,
    setSignalFilter,
    completedRecommendations,
    toggleRecommendation,
    studentQuestions,
  } = useApp()

  const pendingQuestions = studentQuestions.filter(
    (q) => q.lectureId === lecture.id && q.status === "new",
  )

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow={lectureLabel(lecture)}
        title={lecture.title}
        description={lecture.summary}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/report" />}
              nativeButton={false}
            >
              <BookOpen data-icon="inline-start" />
              Summary report
            </Button>
            <Button
              size="sm"
              render={<Link href="/analytics" />}
              nativeButton={false}
            >
              Interactive timeline
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        }
      />

      {/* Primary KPI Metrics */}
      <section aria-label="Key lecture metrics">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label="Total Students"
            value={lecture.kpis.students.toLocaleString()}
            hint="Enrolled viewers"
            icon={Users}
          />
          <MetricCard
            label="Avg Engagement"
            value={lecture.kpis.avgEngagement}
            unit="%"
            trend={lecture.kpis.engagementTrend}
            trendLabel={`${lecture.kpis.engagementTrend > 0 ? "+" : ""}${lecture.kpis.engagementTrend}% vs avg`}
            tone="good"
            icon={Activity}
          />
          <MetricCard
            label="Confusion Hotspots"
            value={lecture.kpis.hotspots}
            hint="Requires attention"
            tone="bad"
            icon={Flame}
          />
          <MetricCard
            label="Re-watch Rate"
            value={lecture.kpis.rewatchRate}
            unit="%"
            hint="Spikes indicate friction"
            tone="warn"
            icon={RotateCcw}
          />
          <MetricCard
            label="Drop-off Rate"
            value={lecture.kpis.dropoffRate}
            unit="%"
            hint="Before conclusion"
            icon={LogOut}
          />
        </div>
      </section>

      {/* Engagement Timeline Preview Card */}
      <Card className="flex flex-col gap-4 p-5 md:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">
                Engagement & Confusion Timeline
              </h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {formatTime(lecture.durationSec)} duration
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Correlated student pauses, rewinds, and questions mapped along lecture audio.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="self-start text-xs text-muted-foreground hover:text-foreground sm:self-auto"
            render={<Link href="/analytics" />}
            nativeButton={false}
          >
            Open in Deep Analyzer
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        <div className="rounded-lg border bg-background/50 p-3 sm:p-4">
          <EngagementTimeline
            timeline={lecture.timeline}
            hotspots={lecture.hotspots}
            durationSec={lecture.durationSec}
            selectedTimestamp={selectedTimestamp}
            selectedHotspotId={selectedHotspotId}
            filter={signalFilter}
            onFilterChange={setSignalFilter}
            onSelectHotspot={selectHotspot}
            onSelectTimestamp={selectTimestamp}
            compact={false}
            showFilters={true}
          />
        </div>
      </Card>

      {/* Two Column Grid: Detected Hotspots & Recommended Action Items */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Confusion Hotspots */}
        <section className="flex flex-col gap-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Detected Confusion Hotspots ({lecture.hotspots.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Segments with high student friction, rewinds, or dropped questions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/hotspots" />}
              nativeButton={false}
            >
              View all
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {lecture.hotspots.map((h) => {
              const isSelected = h.id === selectedHotspotId
              return (
                <div
                  key={h.id}
                  onClick={() => selectHotspot(h.id)}
                  className={`group relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all hover:border-primary/40 hover:shadow-sm ${
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <SignalBadge signal={h.primarySignal} />
                      <SeverityBadge severity={h.severity} />
                      <DifficultyBadge score={h.difficulty.score} />
                    </div>
                    <span className="font-mono text-xs font-medium tabular text-muted-foreground">
                      {formatRange(h.start, h.end)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold tracking-tight group-hover:text-primary">
                      {h.topic}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {h.interpretation}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>
                        <strong className="font-medium text-foreground">{h.questionCount}</strong>{" "}
                        questions
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="font-medium text-foreground">+{h.rewatchIncrease}%</strong>{" "}
                        rewatches
                      </span>
                    </div>
                    <Link
                      href="/analytics"
                      onClick={(e) => {
                        e.stopPropagation()
                        selectHotspot(h.id)
                      }}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      Inspect segment
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Priority Revision Checklist & Questions Preview */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Priority Checklist */}
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Revision Checklist</h3>
                <p className="text-xs text-muted-foreground">
                  AI-synthesized adjustments for future lectures.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                render={<Link href="/checklist" />}
                nativeButton={false}
              >
                Full list
              </Button>
            </div>

            <ul className="flex flex-col gap-2.5">
              {lecture.recommendations.slice(0, 4).map((r) => {
                const done = completedRecommendations.has(r.id)
                return (
                  <li
                    key={r.id}
                    className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-2.5 transition-colors hover:bg-muted/60"
                  >
                    <button
                      type="button"
                      onClick={() => toggleRecommendation(r.id)}
                      aria-label={done ? "Mark as incomplete" : "Mark as complete"}
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:border-primary/50"
                      }`}
                    >
                      {done && <Check className="size-3" />}
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <PriorityBadge priority={r.priority} className="text-[10px] py-0 px-1.5" />
                        <span className="font-mono text-[11px] tabular text-muted-foreground">
                          {formatTime(r.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-medium leading-snug ${
                          done ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {r.action}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Student Questions Awaiting Review */}
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <h3 className="text-base font-semibold tracking-tight">Recent Doubts</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                render={<Link href="/questions" />}
                nativeButton={false}
              >
                View all ({pendingQuestions.length} new)
              </Button>
            </div>

            {pendingQuestions.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                All questions reviewed for this lecture!
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {pendingQuestions.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-col gap-1.5 rounded-lg border bg-background p-3 text-xs"
                  >
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-medium text-foreground">{q.studentName}</span>
                      <span className="font-mono tabular">{formatTime(q.timestamp)}</span>
                    </div>
                    <p className="font-medium text-foreground text-pretty">&ldquo;{q.question}&rdquo;</p>
                    <p className="text-[11px] text-muted-foreground">
                      Submitted {relativeTime(q.submittedAt)} · Topic: {q.topic}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
