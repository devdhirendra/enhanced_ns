"use client"

import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import OperatorTaskList from "@/components/tasks/operator-task-list"

export default function OperatorTasksPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <DashboardLayout title="My Tasks" description="View and manage your assigned tasks">
      <OperatorTaskList userId={user.user_id} userRole={user.role} />
    </DashboardLayout>
  )
}
