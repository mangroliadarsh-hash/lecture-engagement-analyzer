import {
  Activity,
  AlertTriangle,
  Brain,
  LogOut,
  MessageSquare,
  RotateCcw,
  type LucideIcon,
} from "lucide-react"
import type { Priority, Severity, SignalFilter, SignalType } from "./data/types"

export interface SignalMeta {
  key: SignalType | "engagement"
  label: string
  shortLabel: string
  icon: LucideIcon
  /** CSS variable name defined in globals.css */
  cssVar: string
  /** Tailwind classes for badges / chips */
  badge: string
  dot: string
}

export const SIGNALS: Record<SignalType | "engagement", SignalMeta> = {
  engagement: {
    key: "engagement",
    label: "Engagement",
    shortLabel: "Engagement",
    icon: Activity,
    cssVar: "--signal-engagement",
    badge: "bg-signal-engagement/10 text-signal-engagement border-signal-engagement/20",
    dot: "bg-signal-engagement",
  },
  confusion: {
    key: "confusion",
    label: "High confusion",
    shortLabel: "Confusion",
    icon: AlertTriangle,
    cssVar: "--signal-confusion",
    badge: "bg-signal-confusion/10 text-signal-confusion border-signal-confusion/20",
    dot: "bg-signal-confusion",
  },
  rewatch: {
    key: "rewatch",
    label: "Re-watch spike",
    shortLabel: "Re-watches",
    icon: RotateCcw,
    cssVar: "--signal-rewatch",
    badge: "bg-signal-rewatch/10 text-signal-rewatch border-signal-rewatch/20",
    dot: "bg-signal-rewatch",
  },
  dropoff: {
    key: "dropoff",
    label: "Drop-off",
    shortLabel: "Drop-offs",
    icon: LogOut,
    cssVar: "--signal-dropoff",
    badge: "bg-signal-dropoff/10 text-signal-dropoff border-signal-dropoff/20",
    dot: "bg-signal-dropoff",
  },
  questions: {
    key: "questions",
    label: "Question hotspot",
    shortLabel: "Questions",
    icon: MessageSquare,
    cssVar: "--signal-questions",
    badge: "bg-signal-questions/10 text-signal-questions border-signal-questions/20",
    dot: "bg-signal-questions",
  },
  difficulty: {
    key: "difficulty",
    label: "High difficulty",
    shortLabel: "Difficulty",
    icon: Brain,
    cssVar: "--signal-difficulty",
    badge: "bg-signal-difficulty/10 text-signal-difficulty border-signal-difficulty/20",
    dot: "bg-signal-difficulty",
  },
}

export const SIGNAL_FILTERS: { value: SignalFilter; label: string }[] = [
  { value: "all", label: "All signals" },
  { value: "engagement", label: "Engagement" },
  { value: "confusion", label: "Confusion" },
  { value: "questions", label: "Questions" },
  { value: "dropoff", label: "Drop-offs" },
  { value: "rewatch", label: "Re-watches" },
  { value: "difficulty", label: "Difficulty" },
]

export const SEVERITY_STYLES: Record<Severity, { label: string; className: string }> = {
  high: {
    label: "High",
    className: "bg-signal-confusion/10 text-signal-confusion border-signal-confusion/25",
  },
  medium: {
    label: "Medium",
    className: "bg-signal-rewatch/10 text-signal-rewatch border-signal-rewatch/25",
  },
  low: {
    label: "Low",
    className: "bg-signal-engagement/10 text-signal-engagement border-signal-engagement/25",
  },
}

export const PRIORITY_STYLES: Record<Priority, string> = {
  High: SEVERITY_STYLES.high.className,
  Medium: SEVERITY_STYLES.medium.className,
  Low: SEVERITY_STYLES.low.className,
}

export function difficultyTone(score: number): Severity {
  if (score >= 75) return "high"
  if (score >= 55) return "medium"
  return "low"
}
