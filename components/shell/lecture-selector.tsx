"use client"

import { BookOpen } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/components/app-provider"
import { lectureLabel } from "@/lib/data"

export function LectureSelector({ className }: { className?: string }) {
  const { lectures, lecture, selectLecture } = useApp()

  return (
    <Select
      value={lecture.id}
      onValueChange={(v) => v && selectLecture(String(v))}
    >
      <SelectTrigger
        size="sm"
        aria-label="Select lecture"
        className={className}
      >
        <BookOpen className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <SelectValue>
          {() => <span className="truncate">{lectureLabel(lecture)}</span>}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {lectures.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              <span className="flex flex-col">
                <span>{lectureLabel(l)}</span>
                <span className="text-xs text-muted-foreground">{l.title}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
