"use client"

import * as React from "react"
import {
  DEFAULT_LECTURE_ID,
  getLecture,
  initialStudentQuestions,
  lectures as defaultLectures,
  type Hotspot,
  type Lecture,
  type Priority,
  type QuestionStatus,
  type Recommendation,
  type SignalFilter,
  type StudentQuestion,
  type TimelinePoint,
} from "@/lib/data"
import { getStoredUser, clearUser, saveUser, type AuthUser, DEMO_USER } from "@/lib/auth"
import { generateSyntheticTimeline } from "@/lib/services/engagement-generator"

export type ChecklistStatus = "to-do" | "in-progress" | "completed"

export interface InteractiveChecklistItem extends Recommendation {
  status: ChecklistStatus
}

export interface DoubtContextData {
  lectureTitle: string
  topic: string
  timestamp: string
  difficulty: number
  complexity: string
  transcriptExcerpt: string
  concepts: string[]
  prerequisites: string[]
}

interface AppState {
  // Authentication
  user: AuthUser | null
  isLoggedIn: boolean
  authChecked: boolean
  login: (user: AuthUser) => void
  logout: () => void

  // Lectures & Unified Store
  lectures: Lecture[]
  lecture: Lecture
  selectLecture: (id: string) => void
  setCustomLecture: (newLecture: Lecture, source?: "synthetic" | "uploaded") => void

  // Data Source & Telemetry
  dataSource: "synthetic" | "uploaded" | "demo"
  studentCount: number
  setStudentCount: (count: 100 | 250 | 500) => void
  regenerateSyntheticEngagement: (count?: 100 | 250 | 500) => void

  // Timeline & Selection
  selectedHotspotId: string | null
  selectedHotspot: Hotspot | null
  selectHotspot: (id: string | null) => void
  selectedTimestamp: number | null
  selectTimestamp: (t: number | null) => void

  // Filter
  signalFilter: SignalFilter
  setSignalFilter: (f: SignalFilter) => void

  // Revision Checklist
  completedRecommendations: Set<string>
  toggleRecommendation: (id: string) => void
  checklistItems: InteractiveChecklistItem[]
  updateChecklistItemStatus: (id: string, status: ChecklistStatus) => void
  addRecommendationToChecklist: (rec: {
    action: string
    problem: string
    evidence: string
    priority: Priority
    timestamp: number
    hotspotId?: string
  }) => void

  // Student Questions
  studentQuestions: StudentQuestion[]
  addStudentQuestion: (q: Omit<StudentQuestion, "id" | "submittedAt" | "status">) => StudentQuestion
  setQuestionStatus: (id: string, status: QuestionStatus) => void

  // Context-Aware Doubt Assistant
  doubtContext: DoubtContextData | null
  setDoubtContext: (ctx: DoubtContextData | null) => void

  reportGenerated: boolean
  setReportGenerated: (v: boolean) => void
}

const AppContext = React.createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth state initialized from storage
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false)
  const [authChecked, setAuthChecked] = React.useState<boolean>(false)

  React.useEffect(() => {
    try {
      const saved = getStoredUser()
      if (saved && saved.email) {
        setUser(saved)
        setIsLoggedIn(true)
      } else {
        setUser(null)
        setIsLoggedIn(false)
      }
    } catch {
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setAuthChecked(true)
    }
  }, [])

  const login = React.useCallback((u: AuthUser) => {
    saveUser(u, true)
    setUser(u)
    setIsLoggedIn(true)
  }, [])

  const logout = React.useCallback(() => {
    clearUser()
    setUser(null)
    setIsLoggedIn(false)
  }, [])

  // Lectures state
  const [lectures, setLectures] = React.useState<Lecture[]>(defaultLectures)
  const [lectureId, setLectureId] = React.useState(DEFAULT_LECTURE_ID)
  const [activeLectureOverride, setActiveLectureOverride] = React.useState<Lecture | null>(null)

  // Data Source & Telemetry
  const [dataSource, setDataSource] = React.useState<"synthetic" | "uploaded" | "demo">("demo")
  const [studentCount, setStudentCountState] = React.useState<number>(500)

  // Timeline & Selection
  const [selectedHotspotId, setSelectedHotspotId] = React.useState<string | null>("h-1715")
  const [selectedTimestamp, setSelectedTimestamp] = React.useState<number | null>(1035) // 17:15
  const [signalFilter, setSignalFilter] = React.useState<SignalFilter>("all")

  // Recommendations & Checklist
  const [completedRecommendations, setCompleted] = React.useState<Set<string>>(
    () => new Set(),
  )

  const currentLectureBase = React.useMemo(() => {
    if (activeLectureOverride && activeLectureOverride.id === lectureId) {
      return activeLectureOverride
    }
    return getLecture(lectureId)
  }, [lectureId, activeLectureOverride])

  // Interactive Checklist initialized from lecture recommendations
  const [checklistItems, setChecklistItems] = React.useState<InteractiveChecklistItem[]>(() =>
    currentLectureBase.recommendations.map((r) => ({
      ...r,
      status: "to-do",
    })),
  )

  // Synchronize checklist items when lecture changes
  React.useEffect(() => {
    setChecklistItems((prev) => {
      const existingMap = new Map(prev.map((i) => [i.id, i.status]))
      return currentLectureBase.recommendations.map((r) => ({
        ...r,
        status: existingMap.get(r.id) || "to-do",
      }))
    })
  }, [currentLectureBase])

  const [studentQuestions, setStudentQuestions] = React.useState<StudentQuestion[]>(
    initialStudentQuestions,
  )
  const [reportGenerated, setReportGenerated] = React.useState(false)

  // Context for Doubt Assistant
  const [doubtContext, setDoubtContext] = React.useState<DoubtContextData | null>({
    lectureTitle: "Lecture 07: Gradient Descent & Loss Functions",
    topic: "Gradient Descent",
    timestamp: "17:15",
    difficulty: 82,
    complexity: "High",
    transcriptExcerpt:
      "w becomes w minus alpha times the gradient. Alpha is the learning rate. The gradient tells us which direction increases the loss, so we go the opposite way.",
    concepts: ["Gradient Descent", "Learning Rate", "Optimization"],
    prerequisites: ["Derivatives", "Functions", "Basic Algebra"],
  })

  const selectLecture = React.useCallback((id: string) => {
    setLectureId(id)
    setSelectedHotspotId(null)
    setSelectedTimestamp(null)
    setReportGenerated(false)
  }, [])

  const setCustomLecture = React.useCallback(
    (newLecture: Lecture, source: "synthetic" | "uploaded" = "synthetic") => {
      setActiveLectureOverride(newLecture)
      setLectures((prev) => [newLecture, ...prev.filter((l) => l.id !== newLecture.id)])
      setLectureId(newLecture.id)
      setDataSource(source)
      // Pick first hotspot or default
      if (newLecture.hotspots.length > 0) {
        setSelectedHotspotId(newLecture.hotspots[0].id)
        setSelectedTimestamp(newLecture.hotspots[0].peak)
      } else {
        setSelectedHotspotId(null)
        setSelectedTimestamp(null)
      }
    },
    [],
  )

  const regenerateSyntheticEngagement = React.useCallback(
    (count: 100 | 250 | 500 = 500) => {
      setStudentCountState(count)
      setDataSource("synthetic")
      const newTimeline = generateSyntheticTimeline({
        durationSeconds: currentLectureBase.durationSec,
        studentCount: count,
        segments: currentLectureBase.transcript,
        hotspots: currentLectureBase.hotspots,
      })

      const updatedLecture: Lecture = {
        ...currentLectureBase,
        kpis: {
          ...currentLectureBase.kpis,
          students: count,
        },
        timeline: newTimeline,
      }
      setActiveLectureOverride(updatedLecture)
    },
    [currentLectureBase],
  )

  const setStudentCount = React.useCallback(
    (count: 100 | 250 | 500) => {
      regenerateSyntheticEngagement(count)
    },
    [regenerateSyntheticEngagement],
  )

  const selectHotspot = React.useCallback(
    (id: string | null) => {
      setSelectedHotspotId(id)
      if (id) {
        const h = currentLectureBase.hotspots.find((x) => x.id === id)
        if (h) {
          setSelectedTimestamp(h.peak)
          // Also prime the doubt assistant context
          setDoubtContext({
            lectureTitle: currentLectureBase.title,
            topic: h.topic,
            timestamp: `${Math.floor(h.peak / 60)}:${(h.peak % 60).toString().padStart(2, "0")}`,
            difficulty: h.difficulty.score,
            complexity: h.difficulty.complexity,
            transcriptExcerpt: h.interpretation,
            concepts: h.difficulty.concepts,
            prerequisites: h.difficulty.prerequisites,
          })
        }
      }
    },
    [currentLectureBase],
  )

  const selectTimestamp = React.useCallback(
    (t: number | null) => {
      setSelectedTimestamp(t)
      if (t === null) {
        setSelectedHotspotId(null)
        return
      }
      const h = currentLectureBase.hotspots.find((x) => t >= x.start && t <= x.end)
      setSelectedHotspotId(h?.id ?? null)
      if (h) {
        setDoubtContext({
          lectureTitle: currentLectureBase.title,
          topic: h.topic,
          timestamp: `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`,
          difficulty: h.difficulty.score,
          complexity: h.difficulty.complexity,
          transcriptExcerpt: h.interpretation,
          concepts: h.difficulty.concepts,
          prerequisites: h.difficulty.prerequisites,
        })
      }
    },
    [currentLectureBase],
  )

  const toggleRecommendation = React.useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "completed" ? "to-do" : "completed",
            }
          : item,
      ),
    )
  }, [])

  const updateChecklistItemStatus = React.useCallback(
    (id: string, status: ChecklistStatus) => {
      setChecklistItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item)),
      )
      setCompleted((prev) => {
        const next = new Set(prev)
        if (status === "completed") next.add(id)
        else next.delete(id)
        return next
      })
    },
    [],
  )

  const addRecommendationToChecklist = React.useCallback(
    (rec: {
      action: string
      problem: string
      evidence: string
      priority: Priority
      timestamp: number
      hotspotId?: string
    }) => {
      const newItem: InteractiveChecklistItem = {
        id: `rec-custom-${Date.now()}`,
        hotspotId: rec.hotspotId || "custom",
        action: rec.action,
        problem: rec.problem,
        evidence: rec.evidence,
        priority: rec.priority,
        timestamp: rec.timestamp,
        status: "to-do",
      }
      setChecklistItems((prev) => [newItem, ...prev])
    },
    [],
  )

  const addStudentQuestion = React.useCallback(
    (q: Omit<StudentQuestion, "id" | "submittedAt" | "status">) => {
      const created: StudentQuestion = {
        ...q,
        id: `sq-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: "new",
      }
      setStudentQuestions((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const setQuestionStatus = React.useCallback((id: string, status: QuestionStatus) => {
    setStudentQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q)),
    )
  }, [])

  const selectedHotspot = React.useMemo(
    () => currentLectureBase.hotspots.find((h) => h.id === selectedHotspotId) ?? null,
    [currentLectureBase, selectedHotspotId],
  )

  const value = React.useMemo<AppState>(
    () => ({
      user,
      isLoggedIn,
      authChecked,
      login,
      logout,
      lectures,
      lecture: currentLectureBase,
      selectLecture,
      setCustomLecture,
      dataSource,
      studentCount,
      setStudentCount,
      regenerateSyntheticEngagement,
      selectedHotspotId,
      selectedHotspot,
      selectHotspot,
      selectedTimestamp,
      selectTimestamp,
      signalFilter,
      setSignalFilter,
      completedRecommendations,
      toggleRecommendation,
      checklistItems,
      updateChecklistItemStatus,
      addRecommendationToChecklist,
      studentQuestions,
      addStudentQuestion,
      setQuestionStatus,
      doubtContext,
      setDoubtContext,
      reportGenerated,
      setReportGenerated,
    }),
    [
      user,
      isLoggedIn,
      authChecked,
      login,
      logout,
      lectures,
      currentLectureBase,
      selectLecture,
      setCustomLecture,
      dataSource,
      studentCount,
      setStudentCount,
      regenerateSyntheticEngagement,
      selectedHotspotId,
      selectedHotspot,
      selectHotspot,
      selectedTimestamp,
      selectTimestamp,
      signalFilter,
      setSignalFilter,
      completedRecommendations,
      toggleRecommendation,
      checklistItems,
      updateChecklistItemStatus,
      addRecommendationToChecklist,
      studentQuestions,
      addStudentQuestion,
      setQuestionStatus,
      doubtContext,
      setDoubtContext,
      reportGenerated,
      setReportGenerated,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
