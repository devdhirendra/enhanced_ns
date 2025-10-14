"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  loading?: boolean
}

export default function DashboardLayout({ children, title, description, loading = false }: DashboardLayoutProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <DashboardHeader user={user} title={title} description={description} />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <DashboardHeader user={user} title={title} description={description} />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
