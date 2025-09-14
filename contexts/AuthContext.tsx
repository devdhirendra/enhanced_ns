"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authApi, apiClient } from "@/lib/api"

export interface User {
  user_id: string
  email: string
  role: "admin" | "operator" | "technician" | "vendor" | "customer" | "staff"
  profileDetail: {
    name: string
    phone: string
    companyName?: string
    operatorId?: string
    technicianId?: string
    customerId?: string
    address?: any
    planAssigned?: string
    customerCount?: number
    revenue?: number
    gstNumber?: string
    businessType?: string
    serviceCapacity?: any
    apiAccess?: any
    area?: string
    specialization?: string
    salary?: string
    assignedOperatorId?: string
    assignedTo?: string
    planId?: string
    connectionType?: string
    monthlyRate?: number
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
  Permissions: Record<string, any>
  status?: "active" | "inactive" | "suspended"
  lastLogin?: string
}

export interface Operator extends User {
  id: string
  companyName: string
  ownerName: string
  phone: string
  email: string
  address: {
    state: string
    district: string
    area: string
  }
  planAssigned: string
  revenue: number
  customerCount: number
  gstNumber: string
  businessType: string
  serviceCapacity: any
  apiAccess: any
  status: "active" | "inactive" | "suspended"
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  fetchUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false) // Add client-side check
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchUserProfile = async (): Promise<User | null> => {
    if (!isClient) return null // Don't access localStorage on server

    const token = localStorage.getItem("auth_token")
    const userId = localStorage.getItem("user_id")
    const userRole = localStorage.getItem("user_role")

    if (!token || !userId || !userRole) {
      return null
    }

    // Check if token is still valid
    if (!apiClient.isTokenValid()) {
      console.log("[v0] Token expired, clearing auth data")
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
      localStorage.removeItem("user_id")
      localStorage.removeItem("user_role")
      apiClient.clearToken()
      setUser(null)
      return null
    }

    try {
      // Set token in API client
      apiClient.setToken(token)

      // Try to fetch user profile based on stored user data
      let freshUserData: User
      switch (userRole) {
        case "admin":
          freshUserData = await apiClient.getAdmin(userId)
          break
        case "operator":
          freshUserData = await apiClient.getOperatorProfile(userId)
          break
        case "technician":
          freshUserData = await apiClient.getTechnicianProfile(userId)
          break
        case "staff":
          freshUserData = await apiClient.getStaffProfile(userId)
          break
        case "vendor":
          freshUserData = await apiClient.getVendorProfile(userId)
          break
        case "customer":
          freshUserData = await apiClient.getCustomerProfile(userId)
          break
        default:
          throw new Error("Invalid user role")
      }

      const updatedUser = {
        ...freshUserData,
        role: userRole, // Ensure role consistency
        status: "active" as const,
        lastLogin: new Date().toISOString(),
      }

      setUser(updatedUser)
      localStorage.setItem("user_data", JSON.stringify(updatedUser))
      return updatedUser
    } catch (error) {
      console.error("[v0] Error fetching user profile:", error)
      if (error instanceof Error && error.message === "AUTHENTICATION_FAILED") {
        console.log("[v0] Authentication failed, clearing auth data")
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        localStorage.removeItem("user_id")
        localStorage.removeItem("user_role")
        apiClient.clearToken()
        setUser(null)
        // Redirect to login
        router.push("/")
      }
    }
    return null
  }

  useEffect(() => {
    if (!isClient) return // Wait for client-side hydration

    const initAuth = async () => {
      console.log("[v0] Initializing auth on client side")

      // Check for stored auth token
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user_data")
      const userRole = localStorage.getItem("user_role")

      if (token && userData && userRole) {
        try {
          if (!apiClient.isTokenValid()) {
            console.log("[v0] Stored token is expired, clearing auth data")
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_data")
            localStorage.removeItem("user_id")
            localStorage.removeItem("user_role")
            apiClient.clearToken()
            setLoading(false)
            return
          }

          const parsedUser = JSON.parse(userData)

          // Set token in API client
          apiClient.setToken(token)

          console.log("[v0] Setting user from stored data:", parsedUser.role)
          setUser(parsedUser)

          // Fetch fresh user data in background
          fetchUserProfile()
        } catch (error) {
          console.error("[v0] Error parsing user data:", error)
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
          localStorage.removeItem("user_id")
          localStorage.removeItem("user_role")
          apiClient.clearToken()
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [isClient]) // Only depend on isClient, not pathname/router

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log("[v0] Starting login process for:", email)

      // Step 1: Login and get token
      const loginResponse = await authApi.login(email, password)
      console.log("[v0] Login response received:", {
        token: !!loginResponse.token,
        user_id: loginResponse.user_id,
        role: loginResponse.role,
      })

      localStorage.setItem("auth_token", loginResponse.token)
      localStorage.setItem("user_id", loginResponse.user_id)
      localStorage.setItem("user_role", loginResponse.role)

      // Set cookie for middleware
      document.cookie = `auth_token=${loginResponse.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`

      apiClient.setToken(loginResponse.token)

      // Step 3: Fetch user profile data
      console.log("[v0] Fetching user profile for role:", loginResponse.role)

      let userData: User | null = null

      try {
        // Fetch profile based on role from login response
        switch (loginResponse.role) {
          case "admin":
            userData = await apiClient.getAdmin(loginResponse.user_id)
            break
          case "operator":
            userData = await apiClient.getOperatorProfile(loginResponse.user_id)
            break
          case "technician":
            userData = await apiClient.getTechnicianProfile(loginResponse.user_id)
            break
          case "staff":
            userData = await apiClient.getStaffProfile(loginResponse.user_id)
            break
          case "vendor":
            userData = await apiClient.getVendorProfile(loginResponse.user_id)
            break
          case "customer":
            userData = await apiClient.getCustomerProfile(loginResponse.user_id)
            break
          default:
            throw new Error(`Invalid user role: ${loginResponse.role}`)
        }

        if (!userData || !userData.user_id) {
          throw new Error("User profile not found")
        }

        userData = {
          ...userData,
          role: loginResponse.role, // Use role from login response
          status: "active" as const,
          lastLogin: new Date().toISOString(),
        }

        console.log("[v0] User data successfully fetched:", {
          user_id: userData.user_id,
          role: userData.role,
          email: userData.email,
          name: userData.profileDetail?.name,
        })

        // Step 4: Update state and storage
        setUser(userData)
        localStorage.setItem("user_data", JSON.stringify(userData))

        console.log("[v0] Login successful, user state updated")
      } catch (profileError) {
        console.error("[v0] Error fetching user profile:", profileError)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        localStorage.removeItem("user_id")
        localStorage.removeItem("user_role")
        apiClient.clearToken()

        if (profileError instanceof Error && profileError.message.includes("AUTHENTICATION_FAILED")) {
          throw new Error("Session expired. Please login again.")
        }
        throw new Error("Failed to load user profile. Please try logging in again.")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      // Clear any partial auth data on error
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
      localStorage.removeItem("user_id")
      localStorage.removeItem("user_role")
      apiClient.clearToken()
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    try {
      // Clear user state and storage
      setUser(null)
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
      localStorage.removeItem("user_id")
      localStorage.removeItem("user_role")

      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // Clear API client token
      apiClient.clearToken()

      // Clear any other cached data
      sessionStorage.clear()

      // Force reload to clear all state and redirect to home
      window.location.replace("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback: still redirect to home
      window.location.replace("/")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user && isClient, // Only authenticated on client side
        fetchUserProfile: () => fetchUserProfile().then(() => {}),
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
