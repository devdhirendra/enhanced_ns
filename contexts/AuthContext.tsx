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
  serviceCapacity: {
    connections: number
    olts: number
    bandwidth?: string
  }
  apiAccess: any
  status: "active" | "inactive" | "suspended"
  createdAt: string
  updatedAt: string
  technicianCount: number
  expiryDate: string
  lastRenewed: string
  nextBillDate: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  fetchUserProfile: () => Promise<void>
}

// Cookie utility functions
const cookieUtils = {
  // Set cookie with proper encoding for complex data
  setCookie: (name: string, value: any, days: number = 7) => {
    try {
      const encodedValue = encodeURIComponent(JSON.stringify(value))
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `${name}=${encodedValue}; expires=${expires}; path=/; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`
    } catch (error) {
      console.error(`Error setting cookie ${name}:`, error)
    }
  },

  // Get cookie with proper decoding
  getCookie: (name: string): any => {
    try {
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        ?.split('=')[1]
      
      if (!value) return null
      return JSON.parse(decodeURIComponent(value))
    } catch (error) {
      console.error(`Error getting cookie ${name}:`, error)
      return null
    }
  },

  // Delete cookie
  deleteCookie: (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
  },

  // Check if we're on client side
  isClient: () => typeof window !== 'undefined'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const storeUserData = (userData: User, token: string) => {
    try {
      // Store in localStorage as backup
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(userData))
      localStorage.setItem("user_id", userData.user_id)
      localStorage.setItem("user_role", userData.role)

      // Store everything in cookies for 100% persistence
      if (cookieUtils.isClient()) {
        cookieUtils.setCookie("auth_token", token, 7)
        cookieUtils.setCookie("user_data", userData, 7)
        cookieUtils.setCookie("user_id", userData.user_id, 7)
        cookieUtils.setCookie("user_role", userData.role, 7)
        cookieUtils.setCookie("user_email", userData.email, 7)
        cookieUtils.setCookie("user_name", userData.profileDetail?.name || '', 7)
        
        // Store additional profile data
        cookieUtils.setCookie("user_profile", {
          phone: userData.profileDetail?.phone,
          companyName: userData.profileDetail?.companyName,
          address: userData.profileDetail?.address,
          status: userData.status,
          permissions: userData.Permissions,
          lastLogin: userData.lastLogin
        }, 7)
      }

      console.log("[v0] User data stored in both localStorage and cookies")
    } catch (error) {
      console.error("Error storing user data:", error)
    }
  }

  const clearUserData = () => {
    try {
      // Clear localStorage
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
      localStorage.removeItem("user_id")
      localStorage.removeItem("user_role")

      // Clear all cookies
      if (cookieUtils.isClient()) {
        cookieUtils.deleteCookie("auth_token")
        cookieUtils.deleteCookie("user_data")
        cookieUtils.deleteCookie("user_id")
        cookieUtils.deleteCookie("user_role")
        cookieUtils.deleteCookie("user_email")
        cookieUtils.deleteCookie("user_name")
        cookieUtils.deleteCookie("user_profile")
      }

      // Clear API client token
      apiClient.clearToken()
      
      console.log("[v0] All user data cleared from localStorage and cookies")
    } catch (error) {
      console.error("Error clearing user data:", error)
    }
  }

  const getUserDataFromStorage = (): { user: User | null, token: string | null } => {
    if (!isClient) return { user: null, token: null }

    try {
      // Try to get from localStorage first
      let token = localStorage.getItem("auth_token")
      let userData = localStorage.getItem("user_data")

      // If not in localStorage, try cookies
      if (!token || !userData) {
        token = cookieUtils.getCookie("auth_token")
        const cookieUserData = cookieUtils.getCookie("user_data")
        
        if (cookieUserData) {
          userData = JSON.stringify(cookieUserData)
          
          // Restore to localStorage if found in cookies
          if (token && userData) {
            localStorage.setItem("auth_token", token)
            localStorage.setItem("user_data", userData)
            localStorage.setItem("user_id", cookieUserData.user_id)
            localStorage.setItem("user_role", cookieUserData.role)
          }
        }
      }

      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        return { user: parsedUser, token }
      }
    } catch (error) {
      console.error("Error getting user data from storage:", error)
    }

    return { user: null, token: null }
  }

  const fetchUserProfile = async (): Promise<User | null> => {
    if (!isClient) return null

    const { token, user: storedUser } = getUserDataFromStorage()

    if (!token || !storedUser) {
      return null
    }

    // Check if token is still valid
    if (!apiClient.isTokenValid()) {
      console.log("[v0] Token expired, clearing auth data")
      clearUserData()
      setUser(null)
      return null
    }

    try {
      // Set token in API client
      apiClient.setToken(token)

      // Fetch fresh user data
      let freshUserData: User
      switch (storedUser.role) {
        case "admin":
          freshUserData = await apiClient.getAdmin(storedUser.user_id)
          break
        case "operator":
          freshUserData = await apiClient.getOperatorProfile(storedUser.user_id)
          break
        case "technician":
          freshUserData = await apiClient.getTechnicianProfile(storedUser.user_id)
          break
        case "staff":
          freshUserData = await apiClient.getStaffProfile(storedUser.user_id)
          break
        case "vendor":
          freshUserData = await apiClient.getVendorProfile(storedUser.user_id)
          break
        case "customer":
          freshUserData = await apiClient.getCustomerProfile(storedUser.user_id)
          break
        default:
          throw new Error("Invalid user role")
      }

      const updatedUser = {
        ...freshUserData,
        role: storedUser.role,
        status: "active" as const,
        lastLogin: new Date().toISOString(),
      }

      setUser(updatedUser)
      storeUserData(updatedUser, token)
      return updatedUser
    } catch (error) {
      console.error("[v0] Error fetching user profile:", error)
      if (error instanceof Error && error.message === "AUTHENTICATION_FAILED") {
        console.log("[v0] Authentication failed, clearing auth data")
        clearUserData()
        setUser(null)
        router.push("/")
      }
    }
    return null
  }

  useEffect(() => {
    if (!isClient) return

    const initAuth = async () => {
      console.log("[v0] Initializing auth on client side")

      const { user: storedUser, token } = getUserDataFromStorage()

      if (token && storedUser) {
        try {
          if (!apiClient.isTokenValid()) {
            console.log("[v0] Stored token is expired, clearing auth data")
            clearUserData()
            setLoading(false)
            return
          }

          // Set token in API client
          apiClient.setToken(token)

          console.log("[v0] Setting user from stored data:", storedUser.role)
          setUser(storedUser)

          // Fetch fresh user data in background
          fetchUserProfile()
        } catch (error) {
          console.error("[v0] Error parsing user data:", error)
          clearUserData()
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [isClient])

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

      apiClient.setToken(loginResponse.token)

      // Step 2: Fetch user profile data
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
          role: loginResponse.role,
          status: "active" as const,
          lastLogin: new Date().toISOString(),
        }

        console.log("[v0] User data successfully fetched:", {
          user_id: userData.user_id,
          role: userData.role,
          email: userData.email,
          name: userData.profileDetail?.name,
        })

        // Step 3: Store user data in both localStorage and cookies
        setUser(userData)
        storeUserData(userData, loginResponse.token)

        console.log("[v0] Login successful, user state updated and stored in cookies")
      } catch (profileError) {
        console.error("[v0] Error fetching user profile:", profileError)
        clearUserData()

        if (profileError instanceof Error && profileError.message.includes("AUTHENTICATION_FAILED")) {
          throw new Error("Session expired. Please login again.")
        }
        throw new Error("Failed to load user profile. Please try logging in again.")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      clearUserData()
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    try {
      // Clear user state
      setUser(null)
      
      // Clear all stored data
      clearUserData()

      // Clear any other cached data
      sessionStorage.clear()

      console.log("[v0] Logout completed, all data cleared")

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
        isAuthenticated: !!user && isClient,
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