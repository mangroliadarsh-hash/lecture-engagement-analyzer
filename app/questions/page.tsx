"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  HelpCircle,
  Inbox,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { formatTime, relativeTime } from "@/lib/format"
import { lectureLabel, type QuestionStatus } from "@/lib/data"

const STATUS_CONFIG: Record<QuestionStatus, { label: string; badge: string }> = {
  new: { label: "New", badge: "bg-signal-confusion/10 text-signal-confusion border-signal-confusion/25" },
  answered: { label: "Answered", badge: "bg-signal-engagement/10 text-signal-engagement border-signal-engagement/25" },
  "needs-clarification": { label: "Needs Clarification", badge: "bg-signal-rewatch/10 text-signal-rewatch border-signal-rewatch/25" },
  faq: { label: "Add to FAQ", badge: "bg-primary/10 text-primary border-primary/25" },
}

export default function QuestionsPage() {
  const { lecture, studentQuestions, setQuestionStatus, addStudentQuestion, selectTimestamp } = useApp()
  const [selectedStatus, setSelectedStatus] = React.useState<"all" | QuestionStatus>("all")
  const [isAdding, setIsAdding] = React.useState(false)

  // New question form state
  const [studentName, setStudentName] = React.useState("")
  const [topic, setTopic] = React.useState("")
  const [timestampStr, setTimestampStr] = React.useState("15:00")
  const [questionText, setQuestionText] = React.useState("")

  const filtered = studentQuestions.filter((q) => {
    if (q.lectureId !== lecture.id) return false
    if (selectedStatus === "all") return true
    return q.status === selectedStatus
  })

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) return

    const [min, sec] = timestampStr.split(":").map(Number)
    const timestamp = (min || 0) * 60 + (sec || 0)

    addStudentQuestion({
      lectureId: lecture.id,
      timestamp,
      topic: topic || "Lecture Inquiry",
      question: questionText,
      transcriptExcerpt: "Student query submitted during lecture playback.",
      studentName: studentName || "Anonymous Student",
    })

    toast.success("Question submitted to instructor inbox.")
    setIsAdding(false)
    setQuestionText("")
    setTopic("")
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow={lectureLabel(lecture)}
        title="Student Questions"
        description="Inquiries submitted by students during lecture recording, synchronized to specific lecture timestamps."
        actions={
          <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="gap-1.5 text-xs">
            <Plus className="size-3.5" />
            Submit Question
          </Button>
        }
      />

      {/* Add Question Dialog Card */}
      {isAdding && (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <form onSubmit={handleCreateQuestion} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Log New Student Inquiry</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Student Name</label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Topic / Concept</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Gradient Descent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Timestamp (MM:SS)</label>
                <Input
                  value={timestampStr}
                  onChange={(e) => setTimestampStr(e.target.value)}
                  placeholder="e.g. 18:30"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Question Text</label>
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="What exactly was unclear during this section?"
                rows={2}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="text-xs">
                Save Inquiry
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("all")}
          className="text-xs"
        >
          All Questions ({studentQuestions.filter((q) => q.lectureId === lecture.id).length})
        </Button>
        {(["new", "answered", "needs-clarification", "faq"] as const).map((st) => {
          const count = studentQuestions.filter(
            (q) => q.lectureId === lecture.id && q.status === st,
          ).length
          return (
            <Button
              key={st}
              variant={selectedStatus === st ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(st)}
              className="text-xs"
            >
              {STATUS_CONFIG[st].label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Question Cards List */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No inquiries match the selected filter.
          </Card>
        ) : (
          filtered.map((q) => {
            const statusMeta = STATUS_CONFIG[q.status]
            return (
              <Card key={q.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs border ${statusMeta.badge}`}>
                      {statusMeta.label}
                    </Badge>
                    <span className="font-semibold text-sm text-foreground">{q.studentName}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{q.topic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs tabular text-muted-foreground">
                      {formatTime(q.timestamp)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({relativeTime(q.submittedAt)})
                    </span>
                  </div>
                </div>

                <p className="text-sm font-medium text-foreground text-pretty">&ldquo;{q.question}&rdquo;</p>

                {q.transcriptExcerpt && (
                  <div className="rounded-md border bg-muted/20 p-2.5 text-xs text-muted-foreground">
                    <strong className="text-foreground block text-[11px] mb-0.5">
                      Lecture context at {formatTime(q.timestamp)}:
                    </strong>
                    &ldquo;{q.transcriptExcerpt}&rdquo;
                  </div>
                )}

                {q.aiExplanation && (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs text-foreground">
                    <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
                      <Sparkles className="size-3.5" />
                      Grounded AI Explanation
                    </div>
                    <p className="leading-relaxed text-muted-foreground">{q.aiExplanation}</p>
                  </div>
                )}

                {/* Status Triage Controls */}
                <div className="flex flex-wrap items-center justify-between border-t pt-3 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground mr-1">Mark status:</span>
                    {(["new", "answered", "needs-clarification", "faq"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setQuestionStatus(q.id, st)
                          toast.success(`Question marked as ${STATUS_CONFIG[st].label}`)
                        }}
                        className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                          q.status === st
                            ? "bg-foreground text-background font-semibold"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {STATUS_CONFIG[st].label}
                      </button>
                    ))}
                  </div>

                  <Link
                    href="/analytics"
                    onClick={() => selectTimestamp(q.timestamp)}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Inspect in Analytics
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
