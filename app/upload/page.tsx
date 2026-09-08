"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileAudio,
  FileSpreadsheet,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react"
import { toast } from "sonner"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  ANALYSIS_STAGES,
  analyzeLecture,
  type AnalysisStage,
} from "@/lib/services/ai-analysis"

export default function UploadPage() {
  const router = useRouter()
  const { selectLecture } = useApp()
  const [course, setCourse] = React.useState("CS 229: Machine Learning")
  const [title, setTitle] = React.useState("Lecture 07: Gradient Descent & Loss Functions")
  const [instructor, setInstructor] = React.useState("Dr. Priya Raman")
  const [selectedFile, setSelectedFile] = React.useState<string | null>("lecture_recording_cs229_lec07.mp4")
  const [transcriptFile, setTranscriptFile] = React.useState<string | null>("cs229_lec07_transcript.vtt")
  const [interactionFile, setInteractionFile] = React.useState<string | null>(null)

  const [analyzing, setAnalyzing] = React.useState(false)
  const [currentStage, setCurrentStage] = React.useState<AnalysisStage>("idle")
  const [stageProgress, setStageProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  const handleStartAnalysis = async () => {
    setAnalyzing(true)
    setError(null)
    setStageProgress(5)

    try {
      const result = await analyzeLecture({
        lectureId: "ml-07",
        onStage: (stage) => {
          setCurrentStage(stage)
          if (stage === "transcript") setStageProgress(25)
          else if (stage === "hotspots") setStageProgress(55)
          else if (stage === "clustering") setStageProgress(80)
          else if (stage === "recommendations") setStageProgress(95)
          else if (stage === "complete") setStageProgress(100)
        },
      })

      toast.success("Lecture analysis complete! Hotspots and recommendations synthesized.")
      selectLecture(result.id)
      setTimeout(() => {
        router.push("/analytics")
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze lecture")
      toast.error("Analysis interrupted")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-4xl mx-auto">
      <PageHeader
        title="Analyze New Lecture"
        description="Ingest recorded lecture media along with timestamped student engagement streams to generate automated confusion hotspots and revision checklists."
      />

      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleStartAnalysis()
          }}
          className="flex flex-col gap-6"
        >
          {/* Metadata */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="course-input" className="text-xs font-medium text-foreground">
                Course Identifier
              </label>
              <Input
                id="course-input"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CS 229: Machine Learning"
                required
                disabled={analyzing}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="instructor-input" className="text-xs font-medium text-foreground">
                Instructor Name
              </label>
              <Input
                id="instructor-input"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Dr. Priya Raman"
                required
                disabled={analyzing}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="title-input" className="text-xs font-medium text-foreground">
                Lecture Title & Topic
              </label>
              <Input
                id="title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lecture 07: Gradient Descent & Loss Functions"
                required
                disabled={analyzing}
              />
            </div>
          </div>

          {/* Media Upload Area */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                selectedFile ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/40"
              }`}
            >
              <FileAudio className="size-7 text-primary mb-2" />
              <p className="text-xs font-semibold text-foreground">Lecture Media</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Audio / Video (.mp4, .webm)</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                disabled={analyzing}
                onClick={() => setSelectedFile("lecture_recording_cs229_lec07.mp4")}
              >
                {selectedFile ? "Loaded: cs229.mp4" : "Select Recording"}
              </Button>
            </div>

            <div
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                transcriptFile ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/40"
              }`}
            >
              <FileText className="size-7 text-primary mb-2" />
              <p className="text-xs font-semibold text-foreground">Transcript File</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">.vtt, .srt, or .txt timestamps</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                disabled={analyzing}
                onClick={() => setTranscriptFile("cs229_lec07_transcript.vtt")}
              >
                {transcriptFile ? "Loaded: lec07.vtt" : "Select Transcript"}
              </Button>
            </div>

            <div
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                interactionFile ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/40"
              }`}
            >
              <FileSpreadsheet className="size-7 text-muted-foreground mb-2" />
              <p className="text-xs font-semibold text-foreground">Student Data (Optional)</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">LMS clicks, seeks, re-watches</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                disabled={analyzing}
                onClick={() => setInteractionFile(interactionFile ? null : "telemetry_stream.csv")}
              >
                {interactionFile ? "Loaded: telemetry.csv" : "Attach Stream"}
              </Button>
            </div>
          </div>

          {/* Progress / State Display */}
          {analyzing && (
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  Running Pedagogical AI Pipeline...
                </span>
                <span className="font-mono tabular">{stageProgress}%</span>
              </div>
              <Progress value={stageProgress} className="h-2" />
              <div className="flex flex-col gap-1.5 mt-1">
                {ANALYSIS_STAGES.map((s) => {
                  const isCurrent = currentStage === s.key
                  const stageIndex = ANALYSIS_STAGES.findIndex((x) => x.key === s.key)
                  const currentIndex = ANALYSIS_STAGES.findIndex((x) => x.key === currentStage)
                  const isDone = stageIndex < currentIndex || currentStage === "complete"
                  return (
                    <div
                      key={s.key}
                      className={`flex items-center gap-2 text-xs ${
                        isDone
                          ? "text-primary"
                          : isCurrent
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : isCurrent ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <div className="size-3.5 rounded-full border border-muted-foreground/30" />
                      )}
                      <span>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={analyzing}
              onClick={() => router.push("/")}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={analyzing}
              className="gap-1.5 text-xs"
            >
              {analyzing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Start AI Ingestion
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
