"use client"

import * as React from "react"
import { toast } from "sonner"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
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
import { resolveDoubt, type DoubtResponse } from "@/lib/services/ai-analysis"
import { formatTime, toSeconds } from "@/lib/format"
import { lectureLabel } from "@/lib/data"

const SAMPLE_DOUBTS = [
  { time: "17:15", text: "Why does the learning rate affect convergence?" },
  { time: "17:15", text: "Why do we subtract the gradient instead of adding it?" },
  { time: "24:35", text: "Why square the loss error instead of taking absolute value?" },
  { time: "41:58", text: "What do the double vertical bars around w mean?" },
]

export default function StudentDoubtPage() {
  const { lecture, addStudentQuestion } = useApp()
  const [timestampStr, setTimestampStr] = React.useState("17:15")
  const [question, setQuestion] = React.useState("Why does the learning rate affect convergence?")
  const [loading, setLoading] = React.useState(false)
  const [response, setResponse] = React.useState<DoubtResponse | null>(null)
  const [escalated, setEscalated] = React.useState(false)

  const handleAsk = async (qText?: string, timeStr?: string) => {
    const activeQuestion = qText || question
    const activeTime = timeStr || timestampStr
    if (!activeQuestion.trim()) return

    setLoading(true)
    setResponse(null)
    setEscalated(false)

    const seconds = toSeconds(activeTime) || 0
    try {
      const result = await resolveDoubt({
        lecture,
        timestamp: seconds,
        question: activeQuestion,
      })
      setResponse(result)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  const handleEscalateToInstructor = () => {
    const seconds = toSeconds(timestampStr) || 0
    const excerpt =
      response?.segment?.text ||
      "w becomes w minus alpha times the gradient. Alpha is the learning rate. The gradient tells us which direction increases the loss, so we go the opposite way."

    addStudentQuestion({
      lectureId: lecture.id,
      timestamp: seconds,
      topic: response?.concept || "Gradient Descent",
      question,
      transcriptExcerpt: excerpt,
      studentName: "Student (via Assistant)",
      aiExplanation: response?.answer,
    })

    setEscalated(true)
    toast.success("Question successfully escalated to the Instructor Question List!")
  }

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Student Portal"
        title="Lecture Doubt Assistant"
        description="Ask questions grounded strictly in the instructor's spoken transcript. Avoid hallucinations with verified timestamp citations."
      />

      {/* Query Form */}
      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk()
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5 sm:max-w-xs">
            <label htmlFor="timestamp-input" className="text-xs font-medium text-foreground">
              Lecture Timestamp (MM:SS)
            </label>
            <Input
              id="timestamp-input"
              value={timestampStr}
              onChange={(e) => setTimestampStr(e.target.value)}
              placeholder="e.g. 17:22"
              className="font-mono text-sm"
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="question-input" className="text-xs font-medium text-foreground">
              Your Question
            </label>
            <Textarea
              id="question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why do we compute the partial derivative with respect to w?"
              rows={3}
              disabled={loading}
              required
            />
          </div>

          {/* Quick doubts chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Or test common student queries:</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DOUBTS.map((d) => (
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
            <Button type="submit" disabled={loading || !question.trim()} className="gap-2 text-xs">
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Resolving with Transcript...
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  Ask Assistant
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Answer Output */}
      {response && (
        <Card className="flex flex-col gap-4 p-6 border-primary/25 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Answer based on this lecture
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Grounded at [{timestampStr}] · {response.concept || "Lecture topic"}
                </span>
              </div>
            </div>
            <ConfidenceMeter value={response.confidence} />
          </div>

          <div className="rounded-md border bg-primary/5 p-4 text-sm leading-relaxed text-foreground text-pretty">
            {response.answer}
          </div>

          {response.segment && (
            <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Transcript context at [{formatTime(response.segment.start)}]:
                </span>
                <span className="text-[11px]">{response.segment.section}</span>
              </div>
              <p className="italic text-muted-foreground leading-relaxed">
                &ldquo;{response.segment.text}&rdquo;
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <div className="text-xs text-muted-foreground">
              Still unclear or need pedagogical clarification?
            </div>
            <div className="flex items-center gap-2">
              {escalated ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span>Escalated to Instructor</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary underline p-0 h-auto"
                    render={<Link href="/questions" />}
                    nativeButton={false}
                  >
                    View in Instructor Inbox
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

          {!response.resolved && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                This query fell outside the verified lecture window. Consider submitting it directly to the instructor inbox using <strong>Ask Instructor</strong> above.
              </span>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
