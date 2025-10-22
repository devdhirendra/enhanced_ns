// Task API - Centralized task management endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nsbackend-silk.vercel.app/api"

interface TaskCreatePayload {
  title: string
  description: string
  category: string
  priority: "Low" | "Medium" | "High" | "Critical"
  assignTo: string
  assignFor?: string
  dueDate?: string
  estimatedHours?: number
}

interface TaskUpdatePayload {
  title?: string
  description?: string
  category?: string
  priority?: string
  assignTo?: string
  assignFor?: string
  dueDate?: string
}

interface TaskStatusUpdate {
  status: string
  comment?: string
}

interface TaskNotePayload {
  note: string
}

interface TaskFeedbackPayload {
  feedback: string
  rating: number
}

interface TaskReassignPayload {
  assignTo: string
}

const validStatuses = ["Pending", "In Progress", "Completed", "Cancelled"]
const validateStatus = (status: string): string => {
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  return validStatuses.includes(normalized) ? normalized : "Pending"
}

export const taskApi = {
  // Create a new task
  create: async (userId: string, payload: TaskCreatePayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/task/add/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return await response.json()
    } catch (error) {
      console.error("Error creating task:", error)
      throw error
    }
  },

  // Get all tasks (Admin only)
  getAll: async (filters?: any) => {
    try {
      const queryParams = new URLSearchParams(filters || {}).toString()
      const response = await fetch(`${API_BASE_URL}/tasks/all${queryParams ? `?${queryParams}` : ""}`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching all tasks:", error)
      throw error
    }
  },

  // Get tasks assigned to user
  getAssigned: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/user/${userId}?role=assignTo`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching assigned tasks:", error)
      throw error
    }
  },

  // Get tasks created by user
  getCreated: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/user/${userId}?role=creator`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching created tasks:", error)
      throw error
    }
  },

  getCombined: async (userId: string) => {
    try {
      const [assigned, created] = await Promise.all([taskApi.getAssigned(userId), taskApi.getCreated(userId)])

      const allTasks = [...(assigned?.data || []), ...(created?.data || [])]
      const uniqueTasks = Array.from(new Map(allTasks.map((t) => [t.taskId, t])).values())

      return { data: uniqueTasks, success: true }
    } catch (error) {
      console.error("Error fetching combined tasks:", error)
      throw error
    }
  },

  // Get single task details
  getById: async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching task:", error)
      throw error
    }
  },

  // Update task details (Creator only)
  update: async (taskId: string, userId: string, payload: TaskUpdatePayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return await response.json()
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  },

  updateStatus: async (taskId: string, userId: string, payload: TaskStatusUpdate) => {
    try {
      const validatedStatus = validateStatus(payload.status)
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: validatedStatus,
          comment: payload.comment,
        }),
      })
      return await response.json()
    } catch (error) {
      console.error("Error updating task status:", error)
      throw error
    }
  },

  reassign: async (taskId: string, userId: string, payload: TaskReassignPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return await response.json()
    } catch (error) {
      console.error("Error reassigning task:", error)
      throw error
    }
  },

  // Add notes to task
  addNote: async (taskId: string, userId: string, payload: TaskNotePayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/notes/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return await response.json()
    } catch (error) {
      console.error("Error adding note:", error)
      throw error
    }
  },

  // Add feedback and rating (AssignFor user only)
  addFeedback: async (taskId: string, userId: string, payload: TaskFeedbackPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/feedback/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return await response.json()
    } catch (error) {
      console.error("Error adding feedback:", error)
      throw error
    }
  },

  // Delete task (Creator only)
  delete: async (taskId: string, userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/${userId}`, {
        method: "DELETE",
      })
      return await response.json()
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  },

  // Get task activity log
  getActivityLog: async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/activity`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching activity log:", error)
      throw error
    }
  },

  // Get task statistics
  getStats: async (userId?: string) => {
    try {
      const endpoint = userId ? `/tasks/stats/user/${userId}` : `/tasks/stats/summary`
      const response = await fetch(`${API_BASE_URL}${endpoint}`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching task stats:", error)
      throw error
    }
  },

  // Fetch user details by email
  getUserByEmail: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/userDetail/email/${email}`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching user by email:", error)
      throw error
    }
  },

  // Get all users for assignment
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/userDetail/all`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },
}
