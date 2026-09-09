"use client"

import * as React from "react"
import Link from "next/link"
import {
  Check,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { useApp, type ChecklistStatus } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { PriorityBadge } from "@/components/shared/signal-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { formatTime } from "@/lib/format"
import { lectureLabel, type Priority } from "@/lib/data"

export default function ChecklistPage() {
  const {
    lecture,
    checklistItems,
    updateChecklistItemStatus,
    addRecommendationToChecklist,
    selectHotspot,
  } = useApp()

  const [priorityFilter, setPriorityFilter] = React.useState<"all" | Priority>("all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | ChecklistStatus>("all")

  // Form for adding custom action items
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [newAction, setNewAction] = React.useState("")
  const [newProblem, setNewProblem] = React.useState("")
  const [newEvidence, setNewEvidence] = React.useState("")
  const [newPriority, setNewPriority] = React.useState<Priority>("Medium")
  const [newTimestampSec, setNewTimestampSec] = React.useState<number>(1020)

  const total = checklistItems.length
  const completedCount = checklistItems.filter((r) => r.status === "completed").length
  const inProgressCount = checklistItems.filter((r) => r.status === "in-progress").length
  const todoCount = checklistItems.filter((r) => r.status === "to-do").length
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const filtered = checklistItems.filter((r) => {
    if (priorityFilter !== "all" && r.priority !== priorityFilter) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    return true
  })

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAction.trim()) return

    addRecommendationToChecklist({
      action: newAction.trim(),
      problem: newProblem.trim() || "Instructor targeted revision point.",
      evidence: newEvidence.trim() || "Synthesized from student queries and confusion signals.",
      priority: newPriority,
      timestamp: newTimestampSec,
    })

    setNewAction("")
    setNewProblem("")
    setNewEvidence("")
    setShowAddForm(false)
    toast.success("Added revision item to checklist!")
  }

  // Export checklist as Markdown
  const handleExportChecklist = () => {
    const lines: string[] = []
    lines.push(`# Revision Checklist: ${lecture.title}`)
    lines.push(`Course: ${lecture.course} | Instructor: ${lecture.instructor}`)
    lines.push(
      `Status: ${completedCount}/${total} Completed (${progressPct}%) | ${inProgressCount} In Progress`,
    )
    lines.push("")

    checklistItems.forEach((item, idx) => {
      const box = item.status === "completed" ? "[x]" : item.status === "in-progress" ? "[-]" : "[ ]"
      lines.push(`${idx + 1}. ${box} **[${item.priority}]** ${item.action} (${formatTime(item.timestamp)})`)
      lines.push(`   - *Problem:* ${item.problem}`)
      lines.push(`   - *Evidence:* ${item.evidence}`)
      lines.push("")
    })

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Lecture_Revision_Checklist_${lecture.id}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Revision checklist downloaded as Markdown.")
  }

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl mx-auto">
      <PageHeader
        eyebrow={lectureLabel(lecture)}
        title="Revision Checklist"
        description="Actionable lecture adjustments synthesized from confusion indicators, student drop-offs, and repeated re-watches."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportChecklist}
              className="gap-1.5 text-xs"
            >
              <Download className="size-3.5" />
              Export Checklist
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              Add Revision Item
            </Button>
          </div>
        }
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
            variant={statusFilter === "to-do" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("to-do")}
            className="text-xs"
          >
            To-Do ({todoCount})
          </Button>
          <Button
            variant={statusFilter === "in-progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("in-progress")}
            className="text-xs"
          >
            In Progress ({inProgressCount})
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
            className="text-xs"
          >
            Completed ({completedCount})
          </Button>
        </div>
      </Card>

      {/* Add Item Drawer / Form */}
      {showAddForm && (
        <Card className="p-5 border-primary/40 bg-primary/5 animate-in fade-in-0">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Add Custom Pedagogical Revision Item
          </h4>
          <form onSubmit={handleCreateItem} className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Actionable Revision Goal
                </label>
                <Input
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="e.g. Provide geometric 3D visualization of gradient vectors before derivation"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  Problem Observed
                </label>
                <Input
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  placeholder="e.g. Students confuse vector dot product direction"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  Supporting Evidence / Timestamps
                </label>
                <Input
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  placeholder="e.g. 14 student inquiries at 17:15 and 32% re-watch spike"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  Target Timestamp (Seconds)
                </label>
                <Input
                  type="number"
                  value={newTimestampSec}
                  onChange={(e) => setNewTimestampSec(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Add to Checklist
              </Button>
            </div>
          </form>
        </Card>
      )}

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
            const isCompleted = item.status === "completed"
            const isInProgress = item.status === "in-progress"

            return (
              <Card
                key={item.id}
                className={`flex flex-col gap-3 p-4 transition-all sm:p-5 ${
                  isCompleted
                    ? "bg-muted/30 border-muted opacity-80"
                    : isInProgress
                    ? "border-amber-500/30 bg-amber-500/5 shadow-xs"
                    : "bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus: ChecklistStatus =
                        item.status === "to-do"
                          ? "in-progress"
                          : item.status === "in-progress"
                          ? "completed"
                          : "to-do"
                      updateChecklistItemStatus(item.id, nextStatus)
                    }}
                    title={`Current: ${item.status}. Click to advance status.`}
                    className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : isInProgress
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-input bg-background hover:border-primary"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-3.5" />
                    ) : isInProgress ? (
                      <Clock className="size-3" />
                    ) : null}
                  </button>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={item.priority} />
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.status}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {formatTime(item.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status cycle select */}
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateChecklistItemStatus(item.id, e.target.value as ChecklistStatus)
                          }
                          className="rounded border border-input bg-background px-2 py-0.5 text-[11px] font-medium text-foreground focus:outline-none"
                        >
                          <option value="to-do">To-Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        {item.hotspotId && (
                          <Link
                            href="/analytics"
                            onClick={() => selectHotspot(item.hotspotId)}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            Inspect segment
                          </Link>
                        )}
                      </div>
                    </div>

                    <h4
                      className={`text-sm font-semibold tracking-tight ${
                        isCompleted ? "line-through text-muted-foreground" : "text-foreground"
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
