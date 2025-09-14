"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/auth/LoginForm"

// Replace your HomePage component with this:
export default function HomePage() {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      const roleRoutes: Record<string, string> = {
        admin: "/admin/dashboard",
        operator: "/operator/dashboard",
        technician: "/technician/dashboard",
        vendor: "/vendor/dashboard",
        customer: "/customer/dashboard",
        staff: "/staff/dashboard",
      }

      const targetRoute = roleRoutes[user.role]
      
      // Only redirect if we're not already on the target route
      if (targetRoute && pathname !== targetRoute) {
        console.log(`Redirecting ${user.role} from ${pathname} to ${targetRoute}`)
        router.push(targetRoute)
      }
    }
  }, [isAuthenticated, user, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    // Check if we're already on the correct route
    const roleRoutes: Record<string, string> = {
      admin: "/admin/dashboard",
      operator: "/operator/dashboard",
      technician: "/technician/dashboard",
      vendor: "/vendor/dashboard",
      customer: "/customer/dashboard",
      staff: "/staff/dashboard",
    }
    
    const targetRoute = roleRoutes[user.role]
    
    if (targetRoute && pathname === targetRoute) {
      // We're already on the correct route, no need to redirect
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div>You are already on your dashboard</div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return <LoginForm />
}
