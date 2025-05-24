"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import type { User } from "@/lib/types"
import { login as loginApi, register as registerApi, refreshToken, logout as logoutApi } from "@/lib/api"
import type { LoginFormData, SignupFormData } from "@/lib/types"

// Utility to decode JWT and check expiry
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiry = payload.exp * 1000 // Convert to milliseconds
    return Date.now() < expiry
  } catch (error) {
    console.error('Error decoding token:', error)
    return false
  }
}

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
        // Check localStorage for auth data
        const authData = localStorage.getItem('authData')
        if (authData) {
          const { user, accessToken, refreshToken: storedRefreshToken } = JSON.parse(authData)
          
          // Validate accessToken
          if (accessToken && isTokenValid(accessToken)) {
            setUser(user)
            return
          }

          // If accessToken is expired, try to refresh
          if (storedRefreshToken) {
            const response = await refreshToken()
            setUser(response.user)
            // Store new auth data
            localStorage.setItem('authData', JSON.stringify({
              user: response.user,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken
            }))
            return
          }
        }

        // No valid auth data, clear user
        setUser(null)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
        localStorage.removeItem('authData')
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
      // Store in localStorage
      localStorage.setItem('authData', JSON.stringify({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      }))
      toast.success("Login successful")
      router.push("/")
    } catch (error) {
      const err = error as Error
      toast.error(err.message || "Login failed")
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
      // Store in localStorage
      localStorage.setItem('authData', JSON.stringify({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      }))
      toast.success("Registration successful")
      router.push("/")
    } catch (error) {
      const err = error as Error; 
      toast.error(err.message || "Registration failed")
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
      // Clear localStorage
      localStorage.removeItem('authData')
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      const err = error as Error; 
      toast.error(err.message || "Logout failed")
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