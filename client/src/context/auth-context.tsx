"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import type { User } from "@/lib/types"
import { login as loginApi, register as registerApi, refreshToken, logout as logoutApi } from "@/lib/api"
import type { LoginFormData, SignupFormData } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginFormData) => Promise<void>
  register: (data: SignupFormData) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!user

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await refreshToken()
        setUser(response.user)
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Redirect unauthenticated users from protected routes
      if (!isAuthenticated && (pathname.startsWith("/add-restaurant") || pathname.startsWith("/edit-restaurant"))) {
        toast.error("Please login to continue")
        router.push("/login")
      }

      // Redirect authenticated users from auth pages
      if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
        router.push("/")
      }
    }
  }, [isAuthenticated, pathname, isLoading, router])

  const login = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await loginApi(data)
      setUser(response.user)
      toast.success("Login successful")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Login failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const response = await registerApi(data)
      setUser(response.user)
      toast.success("Registration successful")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Registration failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await logoutApi()
      setUser(null)
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message || "Logout failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
