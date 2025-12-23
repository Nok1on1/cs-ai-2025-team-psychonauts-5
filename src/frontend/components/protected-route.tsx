"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "student" | "admin"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log("[v0] ProtectedRoute check - isAuthenticated:", isAuthenticated(), "user:", user)

    if (!isAuthenticated()) {
      console.log("[v0] Not authenticated, redirecting to login")
      router.push("/login")
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      console.log("[v0] Role mismatch, redirecting to dashboard")
      router.push("/dashboard")
      return
    }

    console.log("[v0] Auth check passed, rendering children")
    setIsChecking(false)
  }, [isAuthenticated, user, requiredRole, router])

  if (isChecking) {
    return null
  }

  if (!isAuthenticated() || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
