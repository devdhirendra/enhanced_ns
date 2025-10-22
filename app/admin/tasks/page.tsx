"use client"

import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import AdminTaskDashboard from "@/components/tasks/admin-task-dashboard"

export default function AdminTasksPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <DashboardLayout title="Task Management" description="Manage all tasks and assignments">
      <AdminTaskDashboard userId={user.user_id} />
    </DashboardLayout>
  )
}
