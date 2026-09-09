"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Flame,
  MessageSquare,
  Printer,
  Sparkles,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ReportPage() {
  const { lecture } = useApp()
  const [printFriendlyMode, setPrintFriendlyMode] = React.useState(false)

  const handlePrint = () => {
    window.print()
  }

  // Export to CSV: compiles metadata, hotspots, recommendations, and question clusters
  const handleExportCsv = () => {
    try {
      const rows: string[] = []

      // Section 1: Lecture Metadata
      rows.push("LECTURE AUDIT REPORT - LECTURE LENS")
      rows.push(`Lecture ID,"${lecture.id}"`)
      rows.push(`Course,"${lecture.course}"`)
      rows.push(`Title,"${lecture.title}"`)
      rows.push(`Instructor,"${lecture.instructor}"`)
      rows.push(`Duration (seconds),${lecture.durationSec}`)
      rows.push(`Audience (enrolled students),${lecture.kpis.students}`)
      rows.push(`Average Engagement,${lecture.kpis.avgEngagement}%`)
      rows.push(`Rewatch Rate,${lecture.kpis.rewatchRate}%`)
      rows.push(`Drop-off Rate,${lecture.kpis.dropoffRate}%`)
      rows.push("")

      // Section 2: Detected Hotspots
      rows.push("DETECTED CONFUSION HOTSPOTS")
      rows.push(
        "Hotspot ID,Start Time,End Time,Topic,Severity,Primary Signal,Difficulty Score,Rewatch Increase %,Questions Count,Interpretation",
      )
      lecture.hotspots.forEach((h) => {
        rows.push(
          `"${h.id}","${formatTime(h.start)}","${formatTime(h.end)}","${h.topic.replace(/"/g, '""')}","${h.severity}","${h.primarySignal}",${h.difficulty.score},+${h.rewatchIncrease}%,${h.questionCount},"${h.interpretation.replace(/"/g, '""')}"`,
        )
      })
      rows.push("")

      // Section 3: Recommended Actions
      rows.push("PEDAGOGICAL RECOMMENDATIONS")
      rows.push("Recommendation ID,Priority,Timestamp,Action,Problem,Evidence")
      lecture.recommendations.forEach((r) => {
        rows.push(
          `"${r.id}","${r.priority}","${formatTime(r.timestamp)}","${r.action.replace(/"/g, '""')}","${r.problem.replace(/"/g, '""')}","${r.evidence.replace(/"/g, '""')}"`,
        )
      })
      rows.push("")

      // Section 4: Student Question Clusters
      rows.push("STUDENT INQUIRY THEMES")
      rows.push("Cluster ID,Topic,Count,Start Time,End Time,Severity,Representative Question")
      lecture.clusters.forEach((c) => {
        rows.push(
          `"${c.id}","${c.topic.replace(/"/g, '""')}",${c.count},"${formatTime(c.start)}","${formatTime(c.end)}","${c.severity}","${c.representative[0]?.replace(/"/g, '""') || ""}"`,
        )
      })

      const csvContent = rows.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `LectureLens_AuditReport_${lecture.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Executive report exported as CSV successfully.")
    } catch {
      toast.error("Failed to generate CSV export.")
    }
  }

  // Export to PDF: triggers browser print-to-pdf with print styling
  const handleExportPdf = () => {
    toast.info("Preparing PDF preview... Select 'Save as PDF' in the destination options.")
    setTimeout(() => {
      window.print()
    }, 400)
  }

  // Toggle Print-friendly View
  const handleTogglePrintFriendly = () => {
    setPrintFriendlyMode((prev) => !prev)
    if (!printFriendlyMode) {
      toast.success("Switched to Print-Friendly view mode.")
    }
  }

  return (
    <div className={`flex flex-col gap-6 pb-12 ${printFriendlyMode ? "print-friendly max-w-4xl mx-auto" : ""}`}>
      {/* Print-friendly banner when active */}
      {printFriendlyMode && (
        <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 p-4 text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Printer className="size-4 text-primary" />
            <span>
              Print-Friendly View is active: navigation bars and background artifacts are minimized for clean letter-page printing.
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint} className="text-xs h-7 gap-1">
              <Printer className="size-3" />
              Print Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePrintFriendly}
              className="text-xs h-7"
            >
              Exit Print View
            </Button>
          </div>
        </div>
      )}

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

            {/* Export Report Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Download className="size-3.5" />
                Export Report
                <ChevronDown className="size-3 opacity-70 ml-0.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="right" className="w-56">
                <DropdownMenuLabel>Export Audit Report</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleExportPdf}>
                  <FileText className="size-4 text-rose-500" />
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-foreground">Export as PDF (.pdf)</span>
                    <span className="text-[10px] text-muted-foreground">
                      Formatted printable executive document
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleExportCsv}>
                  <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-foreground">Export as CSV (.csv)</span>
                    <span className="text-[10px] text-muted-foreground">
                      Raw telemetry, hotspots & recommendations
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleTogglePrintFriendly}>
                  <Printer className="size-4 text-primary" />
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-foreground">
                      {printFriendlyMode ? "Exit Print View" : "Print-Friendly View"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Monochrome layout optimized for print
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <span className="text-sm font-semibold text-foreground truncate block">
              {lecture.title}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Duration</span>
            <span className="text-base font-semibold tabular text-foreground">
              {Math.floor(lecture.durationSec / 60)} minutes
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Audience</span>
            <span className="text-base font-semibold tabular text-foreground">
              {lecture.kpis.students} students
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
                  <strong>19 related inquiries</strong> concentrated in an 8-minute window
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
            <MessageSquare className="size-4 text-blue-500" />
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
