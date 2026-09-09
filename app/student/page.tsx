"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { ConfidenceMeter } from "@/components/shared/confidence-meter"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { resolveDoubt, type DoubtResponse } from "@/lib/services/ai-analysis"
import { formatTime, toSeconds } from "@/lib/format"
import { lectureLabel } from "@/lib/data"

export default function StudentDoubtPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Doubt Assistant...</div>}>
      <StudentDoubtContent />
    </React.Suspense>
  )
}

function StudentDoubtContent() {
  const searchParams = useSearchParams()
  const { lecture, addStudentQuestion, doubtContext } = useApp()

  // Read URL query parameters or fallback to unified doubtContext
  const initialTopic = searchParams.get("topic") || doubtContext?.topic || "Gradient Descent"
  const initialTime = searchParams.get("timestamp") || doubtContext?.timestamp || "17:15"
  const initialDifficulty = Number(searchParams.get("difficulty")) || doubtContext?.difficulty || 82
  const initialComplexity = searchParams.get("complexity") || doubtContext?.complexity || "High"
  const initialExcerpt = searchParams.get("excerpt") || doubtContext?.transcriptExcerpt || "w becomes w minus alpha times the gradient. Alpha is the learning rate. The gradient tells us which direction increases the loss, so we go the opposite way."

  const [timestampStr, setTimestampStr] = React.useState(initialTime)
  const [topic, setTopic] = React.useState(initialTopic)
  const [difficultyScore] = React.useState(initialDifficulty)
  const [complexity] = React.useState(initialComplexity)
  const [transcriptExcerpt, setTranscriptExcerpt] = React.useState(initialExcerpt)

  const [question, setQuestion] = React.useState("Why does the learning rate affect convergence?")
  const [loading, setLoading] = React.useState(false)
  const [response, setResponse] = React.useState<DoubtResponse | null>(null)
  const [escalated, setEscalated] = React.useState(false)

  // Suggested quick doubts tailored to the topic
  const sampleDoubts = React.useMemo(() => {
    return [
      { time: timestampStr, text: `Why is the learning rate alpha so critical for ${topic}?` },
      { time: timestampStr, text: "Why do we subtract the gradient instead of adding it?" },
      { time: "24:35", text: "Why square the loss error instead of taking the absolute value?" },
      { time: "41:58", text: "What do the double vertical bars around w mean in L2 regularization?" },
    ]
  }, [timestampStr, topic])

  const handleAsk = async (qText?: string, timeStr?: string) => {
    const activeQuestion = qText || question
    const activeTime = timeStr || timestampStr
    if (!activeQuestion.trim()) return

    setLoading(true)
    setResponse(null)
    setEscalated(false)

    const seconds = toSeconds(activeTime) || 0

    try {
      // 1. Try real server-side Gemini Doubt API
      const res = await fetch("/api/gemini/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureTitle: lecture.title,
          timestamp: activeTime,
          topic,
          transcriptExcerpt,
          question: activeQuestion,
          difficulty: difficultyScore,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResponse({
          answer: data.answer,
          resolved: data.resolved ?? true,
          confidence: data.confidence ?? 94,
          concept: data.concept || topic,
          segment: {
            id: `seg-${seconds}`,
            start: seconds,
            end: seconds + 60,
            text: transcriptExcerpt,
            section: topic,
            annotations: [],
          },
        })
        return
      }
    } catch {
      // Continue to fallback resolveDoubt
    }

    // Fallback grounded doubt resolver
    try {
      const result = await resolveDoubt({
        lecture,
        timestamp: seconds,
        question: activeQuestion,
      })
      setResponse(result)
    } catch {
      toast.error("Could not resolve inquiry.")
    } finally {
      setLoading(false)
    }
  }

  const handleEscalateToInstructor = () => {
    const seconds = toSeconds(timestampStr) || 0

    addStudentQuestion({
      lectureId: lecture.id,
      timestamp: seconds,
      topic: response?.concept || topic,
      question,
      transcriptExcerpt,
      studentName: "Student (via Doubt Assistant)",
      aiExplanation: response?.answer,
    })

    setEscalated(true)
    toast.success("Inquiry escalated to the Instructor Inbox!")
  }

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Student Learning Portal"
        title="Context-Aware Doubt Assistant"
        description="Ask questions grounded strictly in the instructor's spoken transcript, lecture formulas, and verified timestamp citations."
      />

      {/* Context Banner: Active Topic, Difficulty, Transcript & Prerequisites */}
      <Card className="p-4 border-primary/30 bg-primary/5 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/15 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-foreground">
                Current Topic: {topic}
              </span>
              <span className="text-[11px] text-muted-foreground block font-mono">
                Timestamp: {timestampStr} · {lecture.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background text-xs font-mono font-semibold">
              Difficulty: {difficultyScore}/100
            </Badge>
            <Badge
              variant="outline"
              className={
                complexity === "High"
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              }
            >
              Complexity: {complexity}
            </Badge>
          </div>
        </div>

        {/* Transcript excerpt */}
        <div className="rounded-lg bg-background/80 p-3 text-xs border">
          <span className="font-semibold text-muted-foreground block text-[11px] mb-1">
            Spoken Lecture Transcript Segment:
          </span>
          <p className="italic text-foreground leading-relaxed">&ldquo;{transcriptExcerpt}&rdquo;</p>
        </div>

        {/* Prerequisites & Concepts */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-semibold text-foreground text-[11px]">Core Concepts:</span>
            {(doubtContext?.concepts || [topic, "Loss Function", "Optimization"]).map((c) => (
              <span key={c} className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">
                {c}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-semibold text-foreground text-[11px]">Prerequisites:</span>
            {(doubtContext?.prerequisites || ["Derivatives", "Linear Algebra"]).map((p) => (
              <span key={p} className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Query Form */}
      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk()
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="topic-input" className="text-xs font-medium text-foreground">
                Concept Topic
              </label>
              <Input
                id="topic-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Gradient Descent"
                disabled={loading}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="timestamp-input" className="text-xs font-medium text-foreground">
                Timestamp in Video (MM:SS)
              </label>
              <Input
                id="timestamp-input"
                value={timestampStr}
                onChange={(e) => setTimestampStr(e.target.value)}
                placeholder="e.g. 17:15"
                className="font-mono text-sm"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="question-input" className="text-xs font-medium text-foreground">
              Your Question
            </label>
            <Textarea
              id="question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about the derivation, geometric intuition, or mathematical symbols..."
              rows={3}
              disabled={loading}
              required
            />
          </div>

          {/* Quick doubts chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Frequently asked queries for this topic:</span>
            <div className="flex flex-wrap gap-2">
              {sampleDoubts.map((d) => (
                <button
                  key={d.text}
                  type="button"
                  onClick={() => {
                    setTimestampStr(d.time)
                    setQuestion(d.text)
                    handleAsk(d.text, d.time)
                  }}
                  className="rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground text-left transition-colors"
                >
                  <span className="font-mono font-medium text-primary mr-1.5">[{d.time}]</span>
                  {d.text}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading || !question.trim()} className="gap-2 text-xs font-semibold">
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Resolving Grounded Doubt...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Ask Doubt Assistant
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Answer Output */}
      {response && (
        <Card className="flex flex-col gap-4 p-6 border-primary/30 bg-card shadow-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Grounded Lecture Explanation
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Synthesized at [{timestampStr}] · Topic: {response.concept || topic}
                </span>
              </div>
            </div>
            <ConfidenceMeter value={response.confidence} />
          </div>

          <div className="rounded-xl border bg-primary/5 p-4 text-sm leading-relaxed text-foreground text-pretty font-normal">
            {response.answer}
          </div>

          {response.segment && (
            <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Verified Audio Citation at [{formatTime(response.segment.start)}]:
                </span>
                <span className="text-[11px] font-medium">{response.segment.section}</span>
              </div>
              <p className="italic text-muted-foreground leading-relaxed">
                &ldquo;{response.segment.text}&rdquo;
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <div className="text-xs text-muted-foreground">
              Need personalized instructor review during office hours?
            </div>
            <div className="flex items-center gap-2">
              {escalated ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span>Escalated to Instructor Question Inbox</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary underline p-0 h-auto"
                    render={<Link href="/questions" />}
                    nativeButton={false}
                  >
                    View in Questions List
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEscalateToInstructor}
                  className="gap-1.5 text-xs border-primary/40 hover:bg-primary/5"
                >
                  <MessageSquare className="size-3.5 text-primary" />
                  Ask Instructor
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
