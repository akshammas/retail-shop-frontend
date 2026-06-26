// components/admin/AdminGuard.js

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function AdminGuard({ children }) {
  const router = useRouter()
  const { user, isLoggedIn, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    if (user?.role !== "admin") {
      router.push("/")
    }
  }, [loading, isLoggedIn, user])

  if (loading || !isLoggedIn || user?.role !== "admin") {
    return <LoadingSpinner message="Checking access..." />
  }

  return children
}