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
            Click a marker under the timeline, or any transcript segment, to see the evidence
            behind the signal and the recommended action.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const Icon = SIGNALS[hotspot.primarySignal].icon

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SignalBadge signal={hotspot.primarySignal} />
          <SeverityBadge severity={hotspot.severity} />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">{hotspot.topic}</h3>
          <span className="font-mono text-sm tabular text-muted-foreground">
            {formatRange(hotspot.start, hotspot.end)}
          </span>
        </div>
        <ConfidenceMeter value={hotspot.confidence} />
      </div>

      <Separator />

      <Section step="Signal" title="What was detected">
        <p className="flex items-start gap-2 text-sm text-muted-foreground text-pretty">
          <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {hotspot.label} while introducing {hotspot.topic.toLowerCase()}, with{" "}
          {hotspot.questionCount} related student questions.
        </p>
      </Section>

      <Section step="Evidence" title="Why it was flagged">
        <ul className="flex flex-col gap-1.5">
          {hotspot.evidence.map((e, i) => {
            const meta = SIGNALS[e.signal]
            const EIcon = meta.icon
            return (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className={cn("flex size-5 items-center justify-center rounded", meta.badge)}>
                  <EIcon className="size-3" aria-hidden="true" />
                </span>
                {e.label}
              </li>
            )
          })}
        </ul>
        <div className="mt-1 grid grid-cols-3 gap-2">
          <Stat label="Questions" value={String(hotspot.questionCount)} />
          <Stat label="Re-watch" value={`+${hotspot.rewatchIncrease}%`} />
          <Stat label="Engagement" value={`${hotspot.engagementDelta}%`} />
        </div>
      </Section>

      <Section step="Difficulty" title="AI-estimated difficulty">
        <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <DifficultyBadge score={hotspot.difficulty.score} />
            <span className="text-xs text-muted-foreground">
              Complexity: <span className="font-medium text-foreground">{hotspot.difficulty.complexity}</span>
            </span>
          </div>
          <Progress value={hotspot.difficulty.score} aria-label="Difficulty score" />
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            {hotspot.difficulty.rationale}
          </p>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <ConceptList label="Detected concepts" items={hotspot.difficulty.concepts} />
            <ConceptList label="Prerequisites" items={hotspot.difficulty.prerequisites} />
          </div>
        </div>
      </Section>

      {cluster && (
        <Section step="Questions" title={`${cluster.count} students asked`}>
          <ul className="flex flex-col gap-1.5">
            {cluster.representative.slice(0, 3).map((q) => (
              <li
                key={q}
                className="rounded-md border-l-2 border-signal-questions/60 bg-signal-questions/5 px-3 py-1.5 text-sm italic text-foreground/90"
              >
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section step="Interpretation" title="AI-detected pattern">
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {hotspot.interpretation}
        </p>
      </Section>

      <Section step="Recommendation" title="What to do">
        <div className="flex flex-col gap-3 rounded-md border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-start gap-2 text-sm font-medium text-pretty">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {hotspot.recommendation}
          </p>
          {recommendations.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {recommendations.map((r) => {
                const done = completed.has(r.id)
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onToggleRecommendation(r.id)}
                      aria-pressed={done}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-background/60"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                          done ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
                        )}
                        aria-hidden="true"
                      >
                        {done && <Check className="size-3" />}
                      </span>
                      <span className={cn(done && "text-muted-foreground line-through")}>{r.action}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            render={<Link href="/checklist" />}
            nativeButton={false}
          >
            Open revision checklist
            <ArrowRight data-icon="inline-end" />
          </Button>
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
