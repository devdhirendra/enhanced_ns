"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { SidebarInset } from "@/components/ui/sidebar"
import { redirect } from "next/navigation"

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    redirect("/")
  }

  if (user.role !== "technician") {
    redirect(`/${user.role}/dashboard`)
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <DashboardHeader user={user} />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
