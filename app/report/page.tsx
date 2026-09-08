"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  Download,
  Flame,
  MessageSquare,
  Printer,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { SeverityBadge } from "@/components/shared/signal-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { formatRange, formatTime } from "@/lib/format"
import { lectureLabel } from "@/lib/data"

export default function ReportPage() {
  const { lecture } = useApp()

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    toast.success("Executive summary report exported to PDF format.")
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow={lectureLabel(lecture)}
        title="Summary Report"
        description="Comprehensive pedagogical audit synthesizing student drop-off curves, cognitive difficulty hotspots, and revision priorities."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button size="sm" onClick={handleExport} className="gap-1.5 text-xs">
              <Download className="size-3.5" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Executive Summary & Key Findings Card */}
      <Card className="flex flex-col gap-5 p-5 sm:p-6 bg-card border shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="size-5" />
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Lecture Audit Overview
            </h3>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {lecture.title}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 rounded-lg border bg-muted/20 p-4">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Lecture</span>
            <span className="text-sm font-semibold text-foreground">
              {lecture.title}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Duration</span>
            <span className="text-base font-semibold tabular text-foreground">
              58 minutes
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Audience</span>
            <span className="text-base font-semibold tabular text-foreground">
              128 students
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Avg Engagement</span>
            <span className="text-base font-semibold tabular text-emerald-600 dark:text-emerald-400">
              {lecture.kpis.avgEngagement}%
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Key Findings */}
          <div className="flex flex-col gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Key Findings
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  <strong>Major confusion detected at 17:15</strong> during Gradient Descent
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  <strong>34% re-watch increase</strong> (students replaying the update rule formula)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  <strong>19 related questions</strong> concentrated in an 8-minute window
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  <strong>Highest drop-off at 24:31</strong> (46 students exited after MSE formula)
                </span>
              </li>
            </ul>
          </div>

          {/* Recommended Actions */}
          <div className="flex flex-col gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Recommended Actions
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong>Revise Gradient Descent introduction</strong> with geometric intuition
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong>Add visual explanation</strong> (ball rolling down loss landscape animation)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong>Add recap of derivatives</strong> before presenting the mathematical update rule
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground text-pretty pt-1 border-t">
          {lecture.summary}
        </p>
      </Card>

      {/* Concept Difficulty Hierarchy */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Brain className="size-4 text-primary" />
            <h3 className="text-sm font-semibold tracking-tight">
              Relative Concept Difficulty Rankings
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            AI evaluated semantic density and student review patterns to estimate friction by topic.
          </p>

          <div className="flex flex-col gap-3">
            {lecture.concepts.map((concept) => (
              <div key={concept.name} className="flex flex-col gap-1.5 rounded-lg border p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{concept.name}</span>
                  <span className="font-mono tabular font-medium text-muted-foreground">
                    {concept.score}/100
                  </span>
                </div>
                <Progress value={concept.score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Clustered Student Question Themes */}
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-signal-questions" />
            <h3 className="text-sm font-semibold tracking-tight">
              Primary Inquiries & Confusion Clusters
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Common questions automatically clustered by semantic similarity and timestamp.
          </p>

          <div className="flex flex-col gap-3">
            {lecture.clusters.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-lg border p-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">{c.topic}</span>
                    <SeverityBadge severity={c.severity} className="text-[10px]" />
                  </div>
                  <span className="font-mono text-muted-foreground">
                    {formatRange(c.start, c.end)}
                  </span>
                </div>

                <div className="rounded bg-muted/40 p-2 italic text-muted-foreground">
                  &ldquo;{c.representative[0]}&rdquo;
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{c.count} students asked similar questions</span>
                  <Link
                    href="/questions"
                    className="font-medium text-primary hover:underline"
                  >
                    View inquiries
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Suggested Follow-ups */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight mb-2">Pedagogical Recommendations</h3>
        <ul className="flex flex-col gap-2">
          {lecture.recommendations.map((rec) => (
            <li
              key={rec.id}
              className="flex items-start gap-2.5 rounded-lg border bg-muted/20 p-3 text-xs"
            >
              <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="font-medium text-foreground block">{rec.action}</strong>
                <span className="text-muted-foreground">{rec.problem}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
