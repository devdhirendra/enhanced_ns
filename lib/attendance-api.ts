// Attendance API - Centralized API for all attendance operations
const API_BASE_URL = "https://nsbackend-silk.vercel.app/api"

// Common headers for API requests
const getHeaders = () => ({
  "Content-Type": "application/json",
})

// Generic API call function with better error handling
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Handle different response structures
    if (data.success === false) {
      throw new Error(data.error || data.message || "Request failed")
    }
    
    return { 
      success: true, 
      data: data.data || data, // Support both {data: [...]} and direct array responses
      message: data.message 
    }
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: null,
      message: null
    }
  }
}

export const attendanceApi = {
  // Check-in user
  async checkIn(userId: string, data: { at: string; location: string; date: string }) {
    return apiCall(`/attendance/checkin/${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Check-out user
  async checkOut(userId: string) {
    return apiCall(`/attendance/checkout/${userId}`, {
      method: "POST",
    })
  },

  // Get daily summary for a user
  async getDaySummary(userId: string, date: string) {
    return apiCall(`/attendance/day/${userId}/${date}`)
  },

  // Get range summary for a user
  async getRangeSummary(userId: string, from: string, to: string) {
    return apiCall(`/attendance/range/${userId}?from=${from}&to=${to}`)
  },

  // Get attendance by role
  async getByRole(role: string) {
    return apiCall(`/attendance/role/${role}`)
  },

  // Get all attendance for one user
  async getAllAttendance(userId: string) {
    return apiCall(`/attendance/${userId}`)
  },

  // Get attendance for multiple users (admin)
  async getAllAttendanceRecords(filters?: { role?: string; from?: string; to?: string }) {
    let url = "/attendance"
    const params = new URLSearchParams()
    if (filters?.role) params.append("role", filters.role)
    if (filters?.from) params.append("from", filters.from)
    if (filters?.to) params.append("to", filters.to)
    if (params.toString()) url += `?${params.toString()}`

    return apiCall(url)
  },
}