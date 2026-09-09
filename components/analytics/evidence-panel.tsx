"use client"

import Link from "next/link"
import { ArrowRight, Check, Lightbulb, MousePointerClick } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { DifficultyBadge, SeverityBadge, SignalBadge } from "@/components/shared/signal-badge"
import { ConfidenceMeter } from "@/components/shared/confidence-meter"
import { SIGNALS } from "@/lib/signals"
import { formatRange } from "@/lib/format"
import type { Hotspot, QuestionCluster, Recommendation } from "@/lib/data"

function Section({
  step,
  title,
  children,
}: {
  step: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {step}
        </span>
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      {children}
    </section>
  )
}

export function EvidencePanel({
  hotspot,
  cluster,
  recommendations,
  completed,
  onToggleRecommendation,
  className,
}: {
  hotspot: Hotspot | null
  cluster: QuestionCluster | null
  recommendations: Recommendation[]
  completed: Set<string>
  onToggleRecommendation: (id: string) => void
  className?: string
}) {
  if (!hotspot) {
    return (
      <Empty className={cn("h-full min-h-72 border-dashed", className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MousePointerClick />
          </EmptyMedia>
          <EmptyTitle>Select a hotspot</EmptyTitle>
          <EmptyDescription>
            Click any marker under the timeline (e.g. 17:15 Gradient Descent) or click a transcript segment to inspect the evidence and recommended actions.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const isGradientDescent = hotspot.id === "h-1715"

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-2 rounded-lg border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <SignalBadge signal={hotspot.primarySignal} />
            <SeverityBadge severity={hotspot.severity} />
            {isGradientDescent && (
              <span className="inline-flex items-center rounded-md border border-signal-confusion/30 bg-signal-confusion/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-signal-confusion">
                HIGH CONFUSION
              </span>
            )}
          </div>
          <span className="font-mono text-xs font-semibold tabular text-muted-foreground">
            {formatRange(hotspot.start, hotspot.end)}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground">{hotspot.topic}</h3>
          <span className="text-xs text-muted-foreground">{hotspot.label}</span>
        </div>
        <ConfidenceMeter value={hotspot.confidence} />
      </div>

      <Section step="Evidence" title="Why it was flagged">
        <div className="rounded-lg border bg-card p-3 shadow-xs">
          <ul className="flex flex-col gap-2">
            {hotspot.evidence.map((e, i) => {
              const meta = SIGNALS[e.signal]
              const EIcon = meta.icon
              return (
                <li key={i} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded", meta.badge)}>
                    <EIcon className="size-3" aria-hidden="true" />
                  </span>
                  <span>{e.label}</span>
                </li>
              )
            })}
          </ul>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3">
            <Stat label="Questions" value={String(hotspot.questionCount)} />
            <Stat label="Re-watch" value={`+${hotspot.rewatchIncrease}%`} />
            <Stat label="Engagement" value={`${hotspot.engagementDelta}%`} />
          </div>
        </div>
      </Section>

      <Section step="Interpretation" title="Why this was flagged">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm leading-relaxed text-foreground/90">
          <p className="font-medium text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider mb-1">
            AI-Detected Pattern
          </p>
          <p>{hotspot.interpretation}</p>
        </div>
      </Section>

      <Section step="Difficulty" title="AI-estimated difficulty">
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI-Estimated Difficulty
              </span>
              <DifficultyBadge score={hotspot.difficulty.score} />
            </div>
            <span className="text-xs text-muted-foreground">
              Concept Complexity:{" "}
              <span className="font-bold uppercase text-foreground">{hotspot.difficulty.complexity}</span>
            </span>
          </div>
          <Progress value={hotspot.difficulty.score} aria-label="Difficulty score" className="h-2" />
          <div className="rounded border bg-background/80 p-2.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Why flagged: </span>
            {hotspot.difficulty.rationale}
          </div>
          <div className="grid gap-3 text-xs sm:grid-cols-2">
            <ConceptList label="Detected Concepts:" items={hotspot.difficulty.concepts} />
            <ConceptList label="Prerequisites:" items={hotspot.difficulty.prerequisites} />
          </div>
        </div>
      </Section>

      {cluster && (
        <Section step="Questions" title="Question cluster">
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {cluster.count} related questions
              </span>
              <span className="text-muted-foreground">Topic: {cluster.topic}</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Representative questions:</p>
            <ul className="flex flex-col gap-1.5">
              {cluster.representative.map((q) => (
                <li
                  key={q}
                  className="rounded-md border-l-2 border-signal-questions bg-signal-questions/5 px-3 py-2 text-xs font-medium italic text-foreground"
                >
                  &ldquo;{q}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <Section step="Action" title="Recommended action">
        <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 shadow-sm">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                AI Teaching Recommendation
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5 text-pretty">
                {hotspot.recommendation}
              </p>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-primary/20 pt-3">
              <p className="text-xs font-medium text-muted-foreground">
                Action Items (Click to complete):
              </p>
              <ul className="flex flex-col gap-2">
                {recommendations.map((r) => {
                  const done = completed.has(r.id)
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => onToggleRecommendation(r.id)}
                        aria-pressed={done}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-md border p-2.5 text-left text-xs transition-all",
                          done
                            ? "border-emerald-500/30 bg-emerald-500/10 text-muted-foreground"
                            : "border-border bg-background hover:border-primary/50 hover:bg-background/80 text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                            done
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-input bg-card",
                          )}
                          aria-hidden="true"
                        >
                          {done && <Check className="size-3" />}
                        </span>
                        <div className="flex flex-1 flex-col gap-0.5">
                          <span className={cn("font-medium", done && "line-through")}>{r.action}</span>
                          <span className="text-[11px] text-muted-foreground">
                            Reason: {r.problem}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                            done
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : r.priority === "High"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                          )}
                        >
                          {done ? "Completed" : r.priority}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                render={<Link href="/checklist" />}
                nativeButton={false}
              >
                Revision checklist
                <ArrowRight className="size-3 ml-1" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary"
                render={
                  <Link
                    href={`/student?topic=${encodeURIComponent(hotspot.topic)}&timestamp=${formatTime(hotspot.peak)}&difficulty=${hotspot.difficulty.score}&complexity=${encodeURIComponent(hotspot.difficulty.complexity)}&excerpt=${encodeURIComponent(hotspot.interpretation)}`}
                  />
                }
                nativeButton={false}
              >
                Open in Doubt Assistant
              </Button>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {completed.size} of {recommendations.length} marked complete
            </span>
          </div>
        </div>
      </Section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card px-2.5 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular">{value}</p>
    </div>
  )
}

function ConceptList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground">{label}</p>
      <ul className="flex flex-wrap gap-1">
        {items.map((c) => (
          <li key={c} className="rounded border bg-background px-1.5 py-0.5 text-foreground">
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}
