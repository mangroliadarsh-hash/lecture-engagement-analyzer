import type { TimelinePoint, Hotspot, TranscriptSegment } from "@/lib/data/types"
import { formatTime, toSeconds } from "@/lib/format"

export interface EngagementGeneratorOptions {
  durationSeconds: number
  studentCount?: 100 | 250 | 500 | number
  segments?: TranscriptSegment[]
  hotspots?: Hotspot[]
}

export interface UploadedCsvEvent {
  timestamp: number
  event: "watch" | "pause" | "rewatch" | "dropoff" | "question" | "resume"
  studentId: string
}

/**
 * Parses CSV text in the format: timestamp,event,student_id
 * Example:
 * 17:15,rewatch,student_21
 * 17:16,question,student_44
 */
export function parseEngagementCsv(csvText: string): UploadedCsvEvent[] {
  const lines = csvText.split(/\r?\n/)
  const events: UploadedCsvEvent[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("timestamp,")) {
      continue
    }
    const parts = trimmed.split(",")
    if (parts.length < 2) continue

    const rawTime = parts[0].trim()
    const eventType = parts[1].trim().toLowerCase() as UploadedCsvEvent["event"]
    const studentId = (parts[2] || "student_anon").trim()

    let seconds = 0
    if (rawTime.includes(":")) {
      seconds = toSeconds(rawTime)
    } else {
      seconds = Number(rawTime) || 0
    }

    events.push({
      timestamp: seconds,
      event: eventType,
      studentId,
    })
  }

  return events
}

/**
 * Generates continuous synthetic engagement timeline data across the entire lecture duration.
 * Aligned with topics, hotspots, and difficulty scores.
 * Guarantees the primary 17:15 hotspot (Gradient Descent) with +34% re-watch, -12% engagement, 19 questions.
 */
export function generateSyntheticTimeline(
  options: EngagementGeneratorOptions,
): TimelinePoint[] {
  const {
    durationSeconds = 3480, // ~58 mins
    studentCount = 500,
    segments = [],
    hotspots = [],
  } = options

  const points: TimelinePoint[] = []
  // Generate points every 25 seconds across the whole duration
  const step = 25
  const totalSteps = Math.ceil(durationSeconds / step)

  // Primary demo hotspot: 17:15 (1035s)
  const PRIMARY_HOTSPOT_SEC = 1035

  let currentActiveStudents = studentCount

  for (let i = 0; i <= totalSteps; i++) {
    const t = Math.min(i * step, durationSeconds)

    // Base baseline engagement starts around 88% and naturally drifts slowly to ~74%
    const progressRatio = t / durationSeconds
    let baseEngagement = 88 - progressRatio * 14 + Math.sin(t / 180) * 2.5
    let rewatchRate = 6 + Math.cos(t / 220) * 2
    let confusionScore = 12 + Math.sin(t / 300) * 4
    let questionSpike = 0
    let dropoffCount = 0
    let difficultyScore = 45 + Math.sin(t / 240) * 12

    // Find current topic segment
    const currentSegment = segments.find(
      (s) => t >= s.start && t <= s.end,
    )
    const currentTopic = currentSegment?.section || "Lecture Overview"

    // Primary 17:15 hotspot effect (Gaussian bell curve over [16:00 - 18:30])
    const distToPrimary = Math.abs(t - PRIMARY_HOTSPOT_SEC)
    if (distToPrimary <= 150) {
      const intensity = Math.exp(-Math.pow(distToPrimary / 50, 2))
      baseEngagement -= 12 * intensity // -12% engagement
      rewatchRate += 34 * intensity // +34% re-watches
      confusionScore += 66 * intensity // up to ~80%
      difficultyScore = Math.max(difficultyScore, 50 + 32 * intensity) // up to 82
      questionSpike += Math.round(19 * intensity)
    }

    // Secondary hotspots (e.g. 24:31 Loss Functions / Drop-off, 08:42, 41:58)
    for (const h of hotspots) {
      if (Math.abs(h.peak - PRIMARY_HOTSPOT_SEC) < 30) continue // already handled
      const dist = Math.abs(t - h.peak)
      if (dist <= 120) {
        const factor = Math.exp(-Math.pow(dist / 45, 2))
        if (h.primarySignal === "dropoff") {
          baseEngagement -= 15 * factor
          dropoffCount += Math.round((h.dropoffStudents || 25) * factor)
          currentActiveStudents = Math.max(
            Math.round(studentCount * 0.7),
            currentActiveStudents - Math.round(1.5 * factor),
          )
        } else if (h.primarySignal === "confusion") {
          confusionScore += 45 * factor
          baseEngagement -= 8 * factor
        } else if (h.primarySignal === "rewatch") {
          rewatchRate += (h.rewatchIncrease || 20) * factor
        } else if (h.primarySignal === "questions") {
          questionSpike += Math.round((h.questionCount || 10) * factor)
        }
        if (h.difficulty) {
          difficultyScore = Math.max(difficultyScore, h.difficulty.score * factor)
        }
      }
    }

    // Normal slight dropoff drift
    if (i % 8 === 0 && currentActiveStudents > Math.round(studentCount * 0.75)) {
      currentActiveStudents -= 1
    }

    const clampedEngagement = Math.max(30, Math.min(98, Math.round(baseEngagement)))
    const clampedRewatch = Math.max(2, Math.min(85, Math.round(rewatchRate)))
    const clampedConfusion = Math.max(5, Math.min(95, Math.round(confusionScore)))
    const clampedDifficulty = Math.max(20, Math.min(99, Math.round(difficultyScore)))

    points.push({
      t,
      time: t,
      timestamp: formatTime(t),
      engagement: clampedEngagement,
      students: currentActiveStudents,
      rewatch: clampedRewatch,
      pauses: Math.max(1, Math.min(30, Math.round(clampedRewatch * 0.4))),
      confusion: clampedConfusion,
      questions: questionSpike,
      dropoff: dropoffCount,
      difficulty: clampedDifficulty,
      topic: currentTopic,
    })
  }

  return points
}
