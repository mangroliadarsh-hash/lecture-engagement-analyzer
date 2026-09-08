import type {
  Hotspot,
  HotspotShape,
  Lecture,
  LectureKpis,
  SignalType,
  TimelinePoint,
  TranscriptSegment,
} from "./types"

const STEP_SEC = 30

/** Deterministic pseudo-noise so every render produces the same dataset. */
function noise(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x) - 0.5
}

function gaussian(t: number, peak: number, width: number): number {
  const d = t - peak
  return Math.exp(-(d * d) / (2 * width * width))
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

interface TimelineOptions {
  durationSec: number
  students: number
  startEngagement: number
  endEngagement: number
  shapes: HotspotShape[]
}

export function buildTimeline({
  durationSec,
  students,
  startEngagement,
  endEngagement,
  shapes,
}: TimelineOptions): TimelinePoint[] {
  const points: TimelinePoint[] = []
  const steps = Math.floor(durationSec / STEP_SEC)
  let activeStudents = students

  for (let i = 0; i <= steps; i++) {
    const t = i * STEP_SEC
    const progress = t / durationSec

    let engagement =
      startEngagement + (endEngagement - startEngagement) * progress
    let rewatch = 4 + noise(i, 1) * 3
    let pauses = 3 + noise(i, 2) * 2
    let questions = Math.max(0, Math.round(0.6 + noise(i, 3) * 1.2))
    let difficulty = 22 + 22 * progress + noise(i, 4) * 6
    let confusion = 8 + 4 * progress + noise(i, 5) * 3
    let dropoff = 0.3 + noise(i, 6) * 0.3

    for (const s of shapes) {
      const g = gaussian(t, s.peak, s.width)
      engagement -= s.engagementDip * g
      rewatch += s.rewatch * g
      pauses += s.pauses * g
      questions += Math.round(s.questions * g)
      difficulty += s.difficulty * g
      confusion += s.confusion * g
      dropoff += s.dropoff * g
    }

    engagement += noise(i, 7) * 2.5

    const leaving = Math.round((dropoff / 100) * students)
    activeStudents = Math.max(0, activeStudents - leaving)

    points.push({
      t,
      engagement: Math.round(clamp(engagement, 0, 100)),
      students: activeStudents,
      rewatch: Math.round(clamp(rewatch, 0, 100)),
      pauses: Math.round(clamp(pauses, 0, 100)),
      questions: clamp(questions, 0, 60),
      difficulty: Math.round(clamp(difficulty, 0, 100)),
      confusion: Math.round(clamp(confusion, 0, 100)),
      dropoff: Math.round(clamp(dropoff, 0, 100) * 10) / 10,
    })
  }

  return points
}

function annotationsFor(hotspot: Hotspot): SignalType[] {
  const set = new Set<SignalType>([hotspot.primarySignal])
  if (hotspot.severity === "high") set.add("confusion")
  if (hotspot.difficulty.score >= 75) set.add("difficulty")
  if (hotspot.questionCount >= 12) set.add("questions")
  if (hotspot.rewatchIncrease >= 25) set.add("rewatch")
  if (hotspot.dropoffStudents && hotspot.dropoffStudents > 20) set.add("dropoff")
  return Array.from(set)
}

export function attachAnnotations(
  transcript: Omit<TranscriptSegment, "annotations" | "hotspotId">[],
  hotspots: Hotspot[],
): TranscriptSegment[] {
  return transcript.map((segment) => {
    const hotspot = hotspots.find(
      (h) => h.peak >= segment.start && h.peak < segment.end,
    )
    return {
      ...segment,
      annotations: hotspot ? annotationsFor(hotspot) : [],
      hotspotId: hotspot?.id,
    }
  })
}

export function computeKpis(
  timeline: TimelinePoint[],
  students: number,
  hotspotCount: number,
): LectureKpis {
  const avgEngagement = Math.round(
    timeline.reduce((sum, p) => sum + p.engagement, 0) / timeline.length,
  )
  const finalStudents = timeline[timeline.length - 1]?.students ?? students
  const dropoffRate = Math.round(((students - finalStudents) / students) * 100)
  const rewatchRate = Math.round(
    timeline.reduce((sum, p) => sum + p.rewatch, 0) / timeline.length * 2.6,
  )
  const firstHalf = timeline.slice(0, Math.floor(timeline.length / 2))
  const secondHalf = timeline.slice(Math.floor(timeline.length / 2))
  const avg = (arr: TimelinePoint[]) =>
    arr.reduce((s, p) => s + p.engagement, 0) / arr.length
  const engagementTrend = Math.round(avg(secondHalf) - avg(firstHalf))

  return {
    students,
    avgEngagement,
    dropoffRate,
    rewatchRate,
    hotspots: hotspotCount,
    engagementTrend,
  }
}

type LectureInput = Omit<Lecture, "timeline" | "transcript" | "kpis"> & {
  students: number
  startEngagement: number
  endEngagement: number
  shapes: HotspotShape[]
  rawTranscript: Omit<TranscriptSegment, "annotations" | "hotspotId">[]
}

export function defineLecture(input: LectureInput): Lecture {
  const {
    students,
    startEngagement,
    endEngagement,
    shapes,
    rawTranscript,
    ...rest
  } = input
  const timeline = buildTimeline({
    durationSec: rest.durationSec,
    students,
    startEngagement,
    endEngagement,
    shapes,
  })
  const transcript = attachAnnotations(rawTranscript, rest.hotspots)
  const kpis = computeKpis(timeline, students, rest.hotspots.length)
  return { ...rest, timeline, transcript, kpis }
}
