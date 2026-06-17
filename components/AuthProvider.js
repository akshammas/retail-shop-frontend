// components/AuthProvider.js

"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isLoggedIn: false
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // on first load — check if user data exists in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const token = localStorage.getItem("access_token")

    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  function login(data) {
    // data comes from your FastAPI /auth/login response
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("refresh_token", data.refresh_token)
    localStorage.setItem("user", JSON.stringify(data.user))
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isLoggedIn: !!user
      // ↑ !! converts user (object or null) into true/false
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// any component can call useAuth() to get user state
export function useAuth() {
  return useContext(AuthContext)
}