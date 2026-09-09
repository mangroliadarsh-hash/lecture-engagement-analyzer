"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Lightbulb, MessageSquare } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import {
  DifficultyBadge,
  SeverityBadge,
  SignalBadge,
} from "@/components/shared/signal-badge"
import { ConfidenceMeter } from "@/components/shared/confidence-meter"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatRange } from "@/lib/format"
import { lectureLabel, type SignalFilter } from "@/lib/data"
import { SIGNALS } from "@/lib/signals"

export default function HotspotsPage() {
  const { lecture, selectHotspot } = useApp()
  const [filter, setFilter] = React.useState<SignalFilter>("all")

  const filteredHotspots = React.useMemo(() => {
    if (filter === "all") return lecture.hotspots
    return lecture.hotspots.filter((h) => h.primarySignal === filter)
  }, [lecture, filter])

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow={lectureLabel(lecture)}
        title="Confusion Hotspots"
        description="Detailed breakdown of detected friction points, why they occurred, and recommended teaching adaptations."
        actions={
          <Button
            size="sm"
            render={<Link href="/analytics" />}
            nativeButton={false}
          >
            Timeline analyzer
            <ArrowRight data-icon="inline-end" />
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="text-xs"
        >
          All Hotspots ({lecture.hotspots.length})
        </Button>
        {(["confusion", "rewatch", "dropoff", "questions", "difficulty"] as const).map((sig) => {
          const count = lecture.hotspots.filter((h) => h.primarySignal === sig).length
          if (count === 0) return null
          const meta = SIGNALS[sig]
          return (
            <Button
              key={sig}
              variant={filter === sig ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(sig)}
              className="text-xs gap-1.5"
            >
              <meta.icon className="size-3.5" />
              {meta.shortLabel} ({count})
            </Button>
          )
        })}
      </div>

      {/* Hotspots Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredHotspots.map((h) => {
          const cluster = lecture.clusters.find((c) => c.hotspotId === h.id)
          return (
            <Card key={h.id} className="flex flex-col justify-between p-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <SignalBadge signal={h.primarySignal} />
                    <SeverityBadge severity={h.severity} />
                  </div>
                  <span className="font-mono text-xs tabular text-muted-foreground">
                    {formatRange(h.start, h.end)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-tight">{h.topic}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
                    {h.label}
                  </p>
                </div>

                <ConfidenceMeter value={h.confidence} />

                {/* Evidence Metrics */}
                <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/40 p-2.5 text-center text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Questions</span>
                    <strong className="text-sm font-semibold">{h.questionCount}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Re-watches</span>
                    <strong className="text-sm font-semibold">+{h.rewatchIncrease}%</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Engagement</span>
                    <strong className="text-sm font-semibold">{h.engagementDelta}%</strong>
                  </div>
                </div>

                {/* AI Difficulty */}
                <div className="flex flex-col gap-1.5 rounded-lg border p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">AI Difficulty Score</span>
                    <DifficultyBadge score={h.difficulty.score} />
                  </div>
                  <Progress value={h.difficulty.score} className="h-1.5" />
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {h.difficulty.rationale}
                  </p>
                </div>

                {/* Question Quotes if available */}
                {cluster && cluster.representative.length > 0 && (
                  <div className="flex flex-col gap-1.5 rounded-lg bg-signal-questions/5 p-3 text-xs border border-signal-questions/20">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <MessageSquare className="size-3.5 text-signal-questions" />
                      Student Inquiries ({cluster.count})
                    </span>
                    <p className="italic text-muted-foreground">
                      &ldquo;{cluster.representative[0]}&rdquo;
                    </p>
                  </div>
                )}

                {/* Actionable Recommendation */}
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-xs text-foreground border border-primary/15">
                  <Lightbulb className="size-4 shrink-0 text-primary mt-0.5" />
                  <p className="leading-snug">{h.recommendation}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link
                      href={`/student?topic=${encodeURIComponent(h.topic)}&timestamp=${formatTime(h.peak)}&difficulty=${h.difficulty.score}&complexity=${encodeURIComponent(h.difficulty.complexity)}&excerpt=${encodeURIComponent(h.interpretation)}`}
                    />
                  }
                  className="text-xs border-primary/30 text-primary hover:bg-primary/5"
                  nativeButton={false}
                >
                  Test in Doubt Assistant
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href="/analytics" />}
                  onClick={() => selectHotspot(h.id)}
                  className="text-xs"
                >
                  Inspect on timeline
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
