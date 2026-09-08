"use client"

import * as React from "react"
import {
  DEFAULT_LECTURE_ID,
  getLecture,
  initialStudentQuestions,
  lectures,
  type Hotspot,
  type Lecture,
  type QuestionStatus,
  type SignalFilter,
  type StudentQuestion,
} from "@/lib/data"

interface AppState {
  lectures: Lecture[]
  lecture: Lecture
  selectLecture: (id: string) => void

  selectedHotspotId: string | null
  selectedHotspot: Hotspot | null
  selectHotspot: (id: string | null) => void
  selectedTimestamp: number | null
  selectTimestamp: (t: number | null) => void

  signalFilter: SignalFilter
  setSignalFilter: (f: SignalFilter) => void

  completedRecommendations: Set<string>
  toggleRecommendation: (id: string) => void

  studentQuestions: StudentQuestion[]
  addStudentQuestion: (q: Omit<StudentQuestion, "id" | "submittedAt" | "status">) => StudentQuestion
  setQuestionStatus: (id: string, status: QuestionStatus) => void

  reportGenerated: boolean
  setReportGenerated: (v: boolean) => void
}

const AppContext = React.createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lectureId, setLectureId] = React.useState(DEFAULT_LECTURE_ID)
  const [selectedHotspotId, setSelectedHotspotId] = React.useState<string | null>(null)
  const [selectedTimestamp, setSelectedTimestamp] = React.useState<number | null>(null)
  const [signalFilter, setSignalFilter] = React.useState<SignalFilter>("all")
  const [completedRecommendations, setCompleted] = React.useState<Set<string>>(
    () => new Set(),
  )
  const [studentQuestions, setStudentQuestions] = React.useState<StudentQuestion[]>(
    initialStudentQuestions,
  )
  const [reportGenerated, setReportGenerated] = React.useState(false)

  const lecture = React.useMemo(() => getLecture(lectureId), [lectureId])

  const selectLecture = React.useCallback((id: string) => {
    setLectureId(id)
    setSelectedHotspotId(null)
    setSelectedTimestamp(null)
    setReportGenerated(false)
  }, [])

  const selectHotspot = React.useCallback(
    (id: string | null) => {
      setSelectedHotspotId(id)
      if (id) {
        const h = lecture.hotspots.find((x) => x.id === id)
        if (h) setSelectedTimestamp(h.peak)
      }
    },
    [lecture],
  )

  const selectTimestamp = React.useCallback(
    (t: number | null) => {
      setSelectedTimestamp(t)
      if (t === null) {
        setSelectedHotspotId(null)
        return
      }
      const h = lecture.hotspots.find((x) => t >= x.start && t <= x.end)
      setSelectedHotspotId(h?.id ?? null)
    },
    [lecture],
  )

  const toggleRecommendation = React.useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

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
    () => lecture.hotspots.find((h) => h.id === selectedHotspotId) ?? null,
    [lecture, selectedHotspotId],
  )

  const value = React.useMemo<AppState>(
    () => ({
      lectures,
      lecture,
      selectLecture,
      selectedHotspotId,
      selectedHotspot,
      selectHotspot,
      selectedTimestamp,
      selectTimestamp,
      signalFilter,
      setSignalFilter,
      completedRecommendations,
      toggleRecommendation,
      studentQuestions,
      addStudentQuestion,
      setQuestionStatus,
      reportGenerated,
      setReportGenerated,
    }),
    [
      lecture,
      selectLecture,
      selectedHotspotId,
      selectedHotspot,
      selectHotspot,
      selectedTimestamp,
      selectTimestamp,
      signalFilter,
      completedRecommendations,
      toggleRecommendation,
      studentQuestions,
      addStudentQuestion,
      setQuestionStatus,
      reportGenerated,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
