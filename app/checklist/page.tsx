"use client"

import * as React from "react"
import Link from "next/link"
import { Check, CheckCircle2, Clock, Filter, Sparkles } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { PriorityBadge } from "@/components/shared/signal-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatTime } from "@/lib/format"
import { lectureLabel, type Priority } from "@/lib/data"

export default function ChecklistPage() {
  const { lecture, completedRecommendations, toggleRecommendation, selectHotspot } = useApp()
  const [priorityFilter, setPriorityFilter] = React.useState<"all" | Priority>("all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "done">("all")

  const total = lecture.recommendations.length
  const completedCount = lecture.recommendations.filter((r) =>
    completedRecommendations.has(r.id),
  ).length
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const filtered = lecture.recommendations.filter((r) => {
    const isDone = completedRecommendations.has(r.id)
    if (priorityFilter !== "all" && r.priority !== priorityFilter) return false
    if (statusFilter === "pending" && isDone) return false
    if (statusFilter === "done" && !isDone) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow={lectureLabel(lecture)}
        title="Revision Checklist"
        description="Actionable lecture adjustments synthesized from confusion indicators, student drop-offs, and repeated re-watches."
      />

      {/* Progress Overview Card */}
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:max-w-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            <h3 className="text-base font-semibold tracking-tight">Checklist Progress</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {completedCount} of {total} pedagogical improvements addressed ({progressPct}%).
          </p>
          <Progress value={progressPct} className="mt-2 h-2" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="text-xs"
          >
            All ({total})
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
            className="text-xs"
          >
            Pending ({total - completedCount})
          </Button>
          <Button
            variant={statusFilter === "done" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("done")}
            className="text-xs"
          >
            Completed ({completedCount})
          </Button>
        </div>
      </Card>

      {/* Priority Filters */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Filter className="size-3.5" /> Priority:
        </span>
        <div className="flex gap-1.5">
          {(["all", "High", "Medium", "Low"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                priorityFilter === p
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p === "all" ? "All Priorities" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No checklist items match the current filters.
          </Card>
        ) : (
          filtered.map((item) => {
            const isDone = completedRecommendations.has(item.id)
            return (
              <Card
                key={item.id}
                className={`flex flex-col gap-3 p-4 transition-all sm:p-5 ${
                  isDone ? "bg-muted/30 border-muted opacity-80" : "bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleRecommendation(item.id)}
                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                    className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:border-primary"
                    }`}
                  >
                    {isDone && <Check className="size-3.5" />}
                  </button>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={item.priority} />
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <Link
                        href="/analytics"
                        onClick={() => selectHotspot(item.hotspotId)}
                        className="text-xs text-primary hover:underline"
                      >
                        Inspect at timestamp
                      </Link>
                    </div>

                    <h4
                      className={`text-sm font-semibold tracking-tight ${
                        isDone ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.action}
                    </h4>

                    <div className="grid gap-2 text-xs md:grid-cols-2">
                      <div className="rounded-md border bg-muted/20 p-2.5">
                        <span className="font-semibold text-muted-foreground block mb-0.5">
                          Problem detected:
                        </span>
                        <p className="text-muted-foreground">{item.problem}</p>
                      </div>
                      <div className="rounded-md border bg-muted/20 p-2.5">
                        <span className="font-semibold text-muted-foreground block mb-0.5">
                          Supporting evidence:
                        </span>
                        <p className="text-muted-foreground">{item.evidence}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
