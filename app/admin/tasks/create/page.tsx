"use client"

import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import TaskCreateForm from "@/components/tasks/task-create-form"
import { useRouter } from "next/navigation"

export default function CreateTaskPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return null
  }

  return (
    <DashboardLayout title="Create Task" description="Create and assign a new task">
      <div className="max-w-2xl">
        <TaskCreateForm
          userId={user.user_id}
          userRole={user.role}
          onTaskCreated={() => {
            router.push("/admin/tasks")
          }}
        />
      </div>
    </DashboardLayout>
  )
}
