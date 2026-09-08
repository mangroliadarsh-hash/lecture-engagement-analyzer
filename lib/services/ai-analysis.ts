import { getLecture, type Lecture, type TranscriptSegment } from "@/lib/data"

/**
 * AI analysis service abstraction.
 *
 * The prototype simulates the Gemini analysis layer with structured mock data
 * and realistic timing. Swap the implementations below for real server-side
 * calls (Route Handler / Server Action) when wiring up a model. Keys must
 * never be read on the client.
 */

export type AnalysisStage =
  | "idle"
  | "transcript"
  | "hotspots"
  | "clustering"
  | "recommendations"
  | "complete"
  | "error"

export const ANALYSIS_STAGES: { key: AnalysisStage; label: string; ms: number }[] = [
  { key: "transcript", label: "Analyzing transcript and engagement patterns...", ms: 1600 },
  { key: "hotspots", label: "Detecting confusion hotspots...", ms: 1400 },
  { key: "clustering", label: "Clustering student questions...", ms: 1300 },
  { key: "recommendations", label: "Generating educator recommendations...", ms: 1500 },
]

export interface AnalyzeOptions {
  lectureId?: string
  onStage?: (stage: AnalysisStage) => void
  signal?: AbortSignal
  /** Force the error path for demoing error states. */
  simulateError?: boolean
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(id)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })

export async function analyzeLecture({
  lectureId = "ml-07",
  onStage,
  signal,
  simulateError,
}: AnalyzeOptions = {}): Promise<Lecture> {
  for (const stage of ANALYSIS_STAGES) {
    onStage?.(stage.key)
    await wait(stage.ms, signal)
    if (simulateError && stage.key === "hotspots") {
      onStage?.("error")
      throw new Error(
        "Interaction data could not be aligned with the transcript timestamps.",
      )
    }
  }
  onStage?.("complete")
  return getLecture(lectureId)
}

export interface DoubtRequest {
  lecture: Lecture
  timestamp: number
  question: string
}

export interface DoubtResponse {
  resolved: boolean
  answer: string
  segment: TranscriptSegment | null
  concept: string | null
  confidence: number
}

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "of", "to", "in", "we", "do", "does", "why",
  "how", "what", "when", "can", "it", "this", "that", "for", "and", "or", "on",
  "with", "be", "i", "you", "my", "me", "need", "mean", "means", "instead",
])

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

function segmentNear(lecture: Lecture, timestamp: number): TranscriptSegment | null {
  return (
    lecture.transcript.find((s) => timestamp >= s.start && timestamp < s.end) ??
    null
  )
}

/**
 * Grounded doubt resolution. The answer is built only from transcript segments
 * near the student's timestamp; if lexical overlap is weak the assistant
 * declines and offers escalation instead of guessing.
 */
export async function resolveDoubt({
  lecture,
  timestamp,
  question,
}: DoubtRequest): Promise<DoubtResponse> {
  await wait(1400)

  const current = segmentNear(lecture, timestamp)
  const qTokens = new Set(tokens(question))

  const window = lecture.transcript.filter(
    (s) => Math.abs(s.start - timestamp) <= 6 * 60,
  )
  let best: { segment: TranscriptSegment; overlap: number } | null = null
  for (const seg of window) {
    const segTokens = new Set(tokens(seg.text))
    let overlap = 0
    for (const w of qTokens) if (segTokens.has(w)) overlap++
    if (!best || overlap > best.overlap) best = { segment: seg, overlap }
  }

  const hotspot = lecture.hotspots.find(
    (h) => timestamp >= h.start - 90 && timestamp <= h.end + 90,
  )
  const concept =
    hotspot?.difficulty.concepts[0] ?? current?.section ?? null

  const overlap = best?.overlap ?? 0
  const confidence = Math.min(0.95, 0.35 + overlap * 0.18)

  if (!best || overlap < 2) {
    return {
      resolved: false,
      answer:
        "I couldn't confidently resolve this from the lecture content. The transcript near this timestamp doesn't cover what you're asking about.",
      segment: current,
      concept,
      confidence,
    }
  }

  const supporting = lecture.transcript.find(
    (s) => s.id !== best!.segment.id && s.section === best!.segment.section,
  )

  const answer = [
    `Based on this lecture: ${best.segment.text}`,
    supporting ? `The instructor also notes: "${supporting.text.split(". ")[0]}."` : null,
    hotspot
      ? `This part of the lecture is a known confusion hotspot (${hotspot.topic}), so you're not alone in asking.`
      : null,
  ]
    .filter(Boolean)
    .join(" ")

  return { resolved: true, answer, segment: best.segment, concept, confidence }
}
