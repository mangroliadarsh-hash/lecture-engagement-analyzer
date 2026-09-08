import {
  ClipboardCheck,
  FileText,
  Flame,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LineChart,
  Upload,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  group: "analyze" | "act" | "students"
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, group: "analyze" },
  { href: "/analytics", label: "Lecture Analytics", icon: LineChart, group: "analyze" },
  { href: "/hotspots", label: "Confusion Hotspots", icon: Flame, group: "analyze" },
  { href: "/checklist", label: "Revision Checklist", icon: ClipboardCheck, group: "act" },
  { href: "/report", label: "Summary Report", icon: FileText, group: "act" },
  { href: "/upload", label: "Analyze New Lecture", icon: Upload, group: "act" },
  { href: "/questions", label: "Student Questions", icon: Inbox, group: "students" },
  { href: "/student", label: "Doubt Assistant", icon: GraduationCap, group: "students" },
]

export const NAV_GROUPS: { key: NavItem["group"]; label: string }[] = [
  { key: "analyze", label: "Analyze" },
  { key: "act", label: "Act" },
  { key: "students", label: "Students" },
]
