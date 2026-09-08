import { lecture06 } from "./lecture-06"
import { lecture07 } from "./lecture-07"
import type { Lecture } from "./types"

export const lectures: Lecture[] = [lecture07, lecture06]

export const DEFAULT_LECTURE_ID = lecture07.id

export function getLecture(id: string): Lecture {
  return lectures.find((l) => l.id === id) ?? lecture07
}

export function lectureLabel(lecture: Lecture): string {
  return `${lecture.course} — Lecture ${String(lecture.number).padStart(2, "0")}`
}

export { initialStudentQuestions } from "./student-questions"
export * from "./types"
