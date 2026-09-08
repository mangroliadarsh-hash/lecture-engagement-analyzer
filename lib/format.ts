export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function formatRange(start: number, end: number): string {
  return `${formatTime(start)}–${formatTime(end)}`
}

export function toSeconds(mmss: string): number {
  const [m, s] = mmss.split(":").map(Number)
  return m * 60 + (s ?? 0)
}

export function formatPercent(value: number, signed = false): string {
  const rounded = Math.round(value)
  if (signed && rounded > 0) return `+${rounded}%`
  return `${rounded}%`
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
