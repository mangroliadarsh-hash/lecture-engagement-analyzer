export type Severity = "low" | "medium" | "high"
export type Priority = "High" | "Medium" | "Low"
export type ComplexityLevel = "Low" | "Medium" | "High"

export type SignalType =
  | "confusion"
  | "rewatch"
  | "dropoff"
  | "questions"
  | "difficulty"

export type SignalFilter = "all" | "engagement" | SignalType

export type LectureStatus = "analyzed" | "pending"

export interface TimelinePoint {
  /** seconds from lecture start */
  t: number
  engagement: number
  students: number
  rewatch: number
  pauses: number
  questions: number
  difficulty: number
  confusion: number
  dropoff: number
}

export interface TranscriptSegment {
  id: string
  start: number
  end: number
  section: string
  text: string
  annotations: SignalType[]
  hotspotId?: string
}

export interface DifficultyAnalysis {
  score: number
  complexity: ComplexityLevel
  concepts: string[]
  prerequisites: string[]
  rationale: string
  confidence: number
}

export interface EvidenceItem {
  signal: SignalType | "engagement"
  label: string
}

export interface Hotspot {
  id: string
  start: number
  end: number
  peak: number
  topic: string
  label: string
  primarySignal: SignalType
  severity: Severity
  questionCount: number
  rewatchIncrease: number
  engagementDelta: number
  dropoffStudents?: number
  difficulty: DifficultyAnalysis
  evidence: EvidenceItem[]
  interpretation: string
  recommendation: string
  confidence: number
}

export interface QuestionCluster {
  id: string
  hotspotId: string
  start: number
  end: number
  topic: string
  concept: string
  count: number
  severity: Severity
  representative: string[]
}

export interface Recommendation {
  id: string
  hotspotId: string
  timestamp: number
  action: string
  problem: string
  evidence: string
  priority: Priority
}

export interface ConceptDifficulty {
  name: string
  score: number
  hotspotId: string
}

export type QuestionStatus = "new" | "answered" | "needs-clarification" | "faq"

export interface StudentQuestion {
  id: string
  lectureId: string
  timestamp: number
  topic: string
  question: string
  transcriptExcerpt: string
  aiExplanation?: string
  status: QuestionStatus
  submittedAt: string
  studentName: string
}

export interface LectureKpis {
  students: number
  avgEngagement: number
  dropoffRate: number
  rewatchRate: number
  hotspots: number
  engagementTrend: number
}

export interface Lecture {
  id: string
  course: string
  number: number
  title: string
  instructor: string
  recordedAt: string
  durationSec: number
  status: LectureStatus
  kpis: LectureKpis
  timeline: TimelinePoint[]
  transcript: TranscriptSegment[]
  hotspots: Hotspot[]
  clusters: QuestionCluster[]
  recommendations: Recommendation[]
  concepts: ConceptDifficulty[]
  summary: string
}

export interface HotspotShape {
  peak: number
  width: number
  engagementDip: number
  rewatch: number
  pauses: number
  questions: number
  difficulty: number
  confusion: number
  dropoff: number
}
