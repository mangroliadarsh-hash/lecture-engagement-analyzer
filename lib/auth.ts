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

// In-memory fallback for iframe restrictions or disabled storage
let inMemoryUser: AuthUser | null = null

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    if (typeof window.localStorage !== "undefined" && window.localStorage) {
      const local = window.localStorage.getItem(STORAGE_KEY)
      if (local) return JSON.parse(local)
    }
  } catch {
    // Storage access may be blocked in sandboxed iframes
  }

  try {
    if (typeof window.sessionStorage !== "undefined" && window.sessionStorage) {
      const session = window.sessionStorage.getItem(STORAGE_KEY)
      if (session) return JSON.parse(session)
    }
  } catch {
    // Storage access may be blocked in sandboxed iframes
  }

  return inMemoryUser
}

export function saveUser(user: AuthUser, rememberMe: boolean = true): void {
  inMemoryUser = user
  if (typeof window === "undefined") return
  try {
    const data = JSON.stringify(user)
    if (typeof window.localStorage !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, data)
    }
    if (typeof window.sessionStorage !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_KEY, data)
    }
  } catch {
    // Storage access may be blocked in sandboxed iframes
  }
}

export function clearUser(): void {
  inMemoryUser = null
  if (typeof window === "undefined") return
  try {
    if (typeof window.localStorage !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage access may be blocked in sandboxed iframes
  }
  try {
    if (typeof window.sessionStorage !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage access may be blocked in sandboxed iframes
  }
}
