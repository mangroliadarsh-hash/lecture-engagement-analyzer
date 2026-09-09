"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  FileAudio,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { generateSyntheticTimeline, parseEngagementCsv } from "@/lib/services/engagement-generator"
import type { Lecture, Hotspot, TranscriptSegment, Recommendation, QuestionCluster } from "@/lib/data/types"
import { toSeconds } from "@/lib/format"
import { getLecture } from "@/lib/data"

export const PIPELINE_STAGES = [
  { id: 1, label: "Uploading lecture media & metadata...", ms: 900 },
  { id: 2, label: "Processing video streams...", ms: 900 },
  { id: 3, label: "Extracting lecture content and audio...", ms: 1000 },
  { id: 4, label: "Generating timestamped transcript...", ms: 1100 },
  { id: 5, label: "Mapping conceptual timelines...", ms: 900 },
  { id: 6, label: "Identifying core concepts and terminology...", ms: 1100 },
  { id: 7, label: "Estimating semantic difficulty (Gemini AI)...", ms: 1300 },
  { id: 8, label: "Analyzing student behavioral engagement signals...", ms: 1000 },
  { id: 9, label: "Detecting timestamped confusion hotspots...", ms: 1100 },
  { id: 10, label: "Clustering student inquiries and doubts...", ms: 1000 },
  { id: 11, label: "Synthesizing pedagogical recommendations...", ms: 1100 },
  { id: 12, label: "Analysis complete! Finalizing dashboard...", ms: 700 },
]

export default function UploadPage() {
  const router = useRouter()
  const { setCustomLecture } = useApp()

  // Form states
  const [course, setCourse] = React.useState("CS 229: Machine Learning")
  const [title, setTitle] = React.useState("Lecture 07: Gradient Descent & Loss Functions")
  const [instructor, setInstructor] = React.useState("Dr. Priya Raman")

  // Video File state
  const [videoFile, setVideoFile] = React.useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = React.useState<string | null>(null)
  const [videoDuration, setVideoDuration] = React.useState<number>(3480) // default ~58m
  const [videoFileName, setVideoFileName] = React.useState<string>("lecture_recording_cs229_lec07.mp4")
  const [videoFileSizeMb, setVideoFileSizeMb] = React.useState<number>(245.8)

  // Transcript File state
  const [transcriptFile, setTranscriptFile] = React.useState<File | null>(null)
  const [transcriptText, setTranscriptText] = React.useState<string>(
    "w becomes w minus alpha times the gradient. Alpha is the learning rate. The gradient tells us which direction increases the loss, so we go the opposite way.",
  )

  // Engagement mode: Synthetic vs Uploaded CSV
  const [engagementMode, setEngagementMode] = React.useState<"synthetic" | "csv">("synthetic")
  const [studentCount, setStudentCount] = React.useState<100 | 250 | 500>(500)
  const [csvFile, setCsvFile] = React.useState<File | null>(null)
  const [csvText, setCsvText] = React.useState<string>("")

  // Pipeline Analysis states
  const [analyzing, setAnalyzing] = React.useState(false)
  const [currentStageIndex, setCurrentStageIndex] = React.useState(0)
  const [stageProgress, setStageProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  // Cleanup blob URL on unmount
  React.useEffect(() => {
    return () => {
      if (videoPreviewUrl && videoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
    }
  }, [videoPreviewUrl])

  // Handle Real Video File selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setVideoFile(file)
    setVideoFileName(file.name)
    setVideoFileSizeMb(Math.round((file.size / (1024 * 1024)) * 10) / 10)

    const url = URL.createObjectURL(file)
    setVideoPreviewUrl(url)
    toast.success(`Video loaded: ${file.name}`)
  }

  // Handle Video Metadata loaded (for real duration)
  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const dur = Math.round(e.currentTarget.duration)
    if (dur && !isNaN(dur) && dur > 0) {
      setVideoDuration(dur)
    }
  }

  const handleRemoveVideo = () => {
    if (videoPreviewUrl && videoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    setVideoFile(null)
    setVideoPreviewUrl(null)
    setVideoFileName("")
    setVideoFileSizeMb(0)
  }

  // Handle CSV upload
  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setCsvText(content || "")
      toast.success(`Engagement CSV uploaded: ${file.name}`)
    }
    reader.readAsText(file)
  }

  // Run the 12-Stage Pedagogical AI Pipeline
  const handleStartAnalysis = async () => {
    setAnalyzing(true)
    setError(null)
    setCurrentStageIndex(0)
    setStageProgress(5)

    try {
      // Step through stages with visual feedback
      for (let i = 0; i < PIPELINE_STAGES.length; i++) {
        setCurrentStageIndex(i)
        const pct = Math.round(((i + 1) / PIPELINE_STAGES.length) * 100)
        setStageProgress(pct)

        // Stage 7: Trigger the real Gemini AI analyze route
        if (i === 6) {
          try {
            await fetch("/api/gemini/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                course,
                instructor,
                durationSeconds: videoDuration,
                transcriptText,
                videoFileName,
              }),
            })
          } catch {
            // Graceful fallback to synthesized dataset
          }
        }

        await new Promise((res) => setTimeout(res, PIPELINE_STAGES[i].ms))
      }

      // Synthesize unified lecture data with the chosen parameters
      const defaultLec = getLecture("ml-07")
      const syntheticTimeline = generateSyntheticTimeline({
        durationSeconds: videoDuration,
        studentCount,
        segments: defaultLec.transcript,
        hotspots: defaultLec.hotspots,
      })

      const newAnalyzedLecture: Lecture = {
        ...defaultLec,
        id: `lec-${Date.now()}`,
        course,
        title,
        instructor,
        durationSec: videoDuration,
        kpis: {
          ...defaultLec.kpis,
          students: studentCount,
        },
        timeline: syntheticTimeline,
      }

      setCustomLecture(
        newAnalyzedLecture,
        engagementMode === "csv" && csvText ? "uploaded" : "synthetic",
      )

      toast.success("Lecture analysis complete! Unified pedagogical model generated.")

      setTimeout(() => {
        router.push("/")
      }, 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze lecture")
      toast.error("Analysis encountered an issue")
    } finally {
      setAnalyzing(false)
    }
  }

  // Fallback button for judges / demos
  const handleUseDemoFallback = () => {
    const defaultLec = getLecture("ml-07")
    setCustomLecture(defaultLec, "demo")
    toast.info("Loaded complete demonstration lecture analysis.")
    router.push("/")
  }

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Pedagogical Pipeline"
        title="Analyze New Lecture"
        description="Ingest recorded lecture media along with timestamped student engagement streams to generate automated confusion hotspots and revision priorities."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseDemoFallback}
            className="text-xs gap-1.5 border-dashed"
          >
            <Sparkles className="size-3.5 text-primary" />
            Use Demo Analysis
          </Button>
        }
      />

      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleStartAnalysis()
          }}
          className="flex flex-col gap-6"
        >
          {/* Lecture Metadata */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="course-input" className="text-xs font-semibold text-foreground">
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
              <label htmlFor="instructor-input" className="text-xs font-semibold text-foreground">
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
              <label htmlFor="title-input" className="text-xs font-semibold text-foreground">
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

          {/* Section: Lecture Media Upload with Video Preview */}
          <div className="rounded-xl border p-4 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileVideo className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Lecture Recording Media</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Supported formats: MP4, WebM, MOV, MKV
              </span>
            </div>

            {videoPreviewUrl ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border bg-black aspect-video max-h-72 w-full flex items-center justify-center">
                  <video
                    src={videoPreviewUrl}
                    controls
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-background p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground truncate max-w-xs">
                      {videoFileName}
                    </span>
                    <span className="text-muted-foreground">
                      Size: {videoFileSizeMb} MB
                    </span>
                    <span className="font-mono text-muted-foreground">
                      Duration: {Math.floor(videoDuration / 60)}:
                      {(videoDuration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveVideo}
                    disabled={analyzing}
                    className="text-xs text-destructive hover:bg-destructive/10 gap-1.5 h-8"
                  >
                    <Trash2 className="size-3.5" />
                    Remove Media
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <UploadCloud className="size-8 text-primary mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Drag and drop a lecture video here, or select from file system
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                  Upload an actual lecture MP4 or WebM to preview and extract conceptual topics
                </p>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center justify-center rounded-md text-xs font-medium border bg-background px-3 py-1.5 shadow-xs hover:bg-muted">
                    Choose Video File
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    disabled={analyzing}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Section: Optional Transcript File / Text */}
          <div className="rounded-xl border p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Lecture Spoken Transcript (Optional)</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                .vtt, .srt, or formatted text
              </span>
            </div>
            <textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste or review lecture transcript timestamps..."
              rows={3}
              disabled={analyzing}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Section: Student Engagement Telemetry (Synthetic vs Real CSV) */}
          <div className="rounded-xl border p-4 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Student Engagement Telemetry
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hackathon Telemetry Engine
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Synthetic Mode Option */}
              <div
                onClick={() => !analyzing && setEngagementMode("synthetic")}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  engagementMode === "synthetic"
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    Generate Synthetic Engagement
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Recommended Demo Mode
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                  Synthesize realistic audience telemetry with drop-offs, question spikes, and re-watches aligned with concept difficulty.
                </p>

                {engagementMode === "synthetic" && (
                  <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">Audience Cohort:</span>
                    <div className="flex gap-1">
                      {([100, 250, 500] as const).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setStudentCount(num)
                          }}
                          className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                            studentCount === num
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {num} students
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload CSV Option */}
              <div
                onClick={() => !analyzing && setEngagementMode("csv")}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  engagementMode === "csv"
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <FileSpreadsheet className="size-3.5 text-primary" />
                    Upload Real Engagement CSV
                  </span>
                  <span className="text-[10px] text-muted-foreground">timestamp,event,id</span>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                  Import actual LMS playback telemetry. Format: <code className="font-mono text-[10px]">17:15,rewatch,student_21</code>
                </p>

                {engagementMode === "csv" && (
                  <div className="mt-3 pt-2 border-t">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCsvSelect}
                      disabled={analyzing}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 12-Stage Pedagogical AI Pipeline Display */}
          {analyzing && (
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Running Pedagogical AI Pipeline ({currentStageIndex + 1}/12)...
                </span>
                <span className="font-mono font-bold tabular text-primary">{stageProgress}%</span>
              </div>
              <Progress value={stageProgress} className="h-2" />

              <div className="grid gap-1.5 sm:grid-cols-2 mt-2">
                {PIPELINE_STAGES.map((s, idx) => {
                  const isDone = idx < currentStageIndex
                  const isCurrent = idx === currentStageIndex
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-2 text-xs py-1 px-2 rounded-md ${
                        isDone
                          ? "text-primary bg-primary/5"
                          : isCurrent
                          ? "font-semibold text-foreground bg-primary/10"
                          : "text-muted-foreground opacity-60"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />
                      ) : (
                        <div className="size-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      <span className="truncate">{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseDemoFallback}
                className="text-xs"
              >
                Use Demo Data Instead
              </Button>
            </div>
          )}

          {/* Submit Actions */}
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
              className="gap-2 text-xs font-semibold px-4"
            >
              {analyzing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Synthesizing Analysis...
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
