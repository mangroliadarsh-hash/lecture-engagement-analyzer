export interface AuthUser {
  id: string
  email: string
  name: string
  title: string
  avatar: string
}

export const DEMO_USER: AuthUser = {
  id: "instructor-01",
  email: "professor@demo.com",
  name: "Dr. Priya Raman",
  title: "Instructor · Machine Learning & AI",
  avatar: "PR",
}

const STORAGE_KEY = "lecture_lens_auth_user"

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) return JSON.parse(local)
    const session = sessionStorage.getItem(STORAGE_KEY)
    if (session) return JSON.parse(session)
  } catch {
    // fallback
  }
  return null
}

export function saveUser(user: AuthUser, rememberMe: boolean = true): void {
  if (typeof window === "undefined") return
  try {
    const data = JSON.stringify(user)
    localStorage.setItem(STORAGE_KEY, data)
    sessionStorage.setItem(STORAGE_KEY, data)
  } catch {
    // fallback
  }
}

export function clearUser(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // fallback
  }
}
