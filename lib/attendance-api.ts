const API_BASE_URL = "https://nsbackend-l5wc.vercel.app/attendance"

const getHeaders = () => ({
  "Content-Type": "application/json",
})

async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data.data || data,
      message: data.message,
    }
  } catch (error) {
    console.error(`[v0] API Error at ${endpoint}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: null,
      message: null,
    }
  }
}

export const attendanceApi = {
  // 1. Check-In - POST /checkin/:userId
  async checkIn(userId: string, data: { location?: string }) {
    return apiCall(`/checkin/${userId}`, {
      method: "POST",
      body: JSON.stringify({
        location: data.location || "Web App",
        createdBy: userId,
      }),
    })
  },

  // 2. Check-Out - PUT /checkout/:attendanceId (need user ID)
  async checkOut(attendanceId: string, data?: { checkOutBy?: string }) {
    return apiCall(`/checkout/${attendanceId}`, {
      method: "PUT",
      body: JSON.stringify({
        checkOutBy: data?.checkOutBy || attendanceId,
      }),
    })
  },

  // 3. Get All Attendance - GET /all
  async getAllAttendance(filters?: { page?: number; limit?: number }) {
    let url = `/all`
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (params.toString()) url += `?${params.toString()}`
    return apiCall(url)
  },

  // 4. Get User Attendance - GET /user/:userId
  async getUserAttendance(userId: string, filters?: { page?: number; limit?: number }) {
    let url = `/user/${userId}`
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (params.toString()) url += `?${params.toString()}`
    return apiCall(url)
  },

  // 5. Get Active Check-Ins - GET /active
  async getActiveCheckIns() {
    return apiCall(`/active`)
  },

  // 6. Get Audit Logs - GET /audit/log
  async getAuditLogs(filters?: { page?: number; limit?: number }) {
    let url = `/audit/log`
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (params.toString()) url += `?${params.toString()}`
    return apiCall(url)
  },

  // 7. Delete Attendance - DELETE /:attendanceId
  async deleteAttendance(attendanceId: string) {
    return apiCall(`/${attendanceId}`, {
      method: "DELETE",
    })
  },

  // REGULARIZATION ENDPOINTS

  // 8. Upload Single File - POST /regularization/upload
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    return fetch(`${API_BASE_URL}/regularization/upload`, {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Upload failed")
        return { success: true, data: await response.json() }
      })
      .catch((error) => ({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }))
  },

  // 9. Upload Multiple Files - POST /regularization/upload/multiple
  async uploadMultipleFiles(files: File[]) {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })
    return fetch(`${API_BASE_URL}/regularization/upload/multiple`, {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Upload failed")
        return { success: true, data: await response.json() }
      })
      .catch((error) => ({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }))
  },

  // 10. Get All Regularizations - GET /regularization/all
  async getAllRegularizations(filters?: { page?: number; limit?: number }) {
    let url = `/regularization/all`
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (params.toString()) url += `?${params.toString()}`
    return apiCall(url)
  },

  // 11. Update Regularization - PUT /regularization/:regularizationId
  async updateRegularization(regularizationId: string, data: { validReason?: string; file?: string }) {
    return apiCall(`/regularization/${regularizationId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // 12. Update Regularization Status - PUT /regularization/status/:regularizationId
  async updateRegularizationStatus(
    regularizationId: string,
    data: {
      status: "Approved" | "Rejected" | "Pending"
      reviewedBy: string
      reviewerNote?: string
    },
  ) {
    return apiCall(`/regularization/status/${regularizationId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // 13. Get Single Regularization - GET /regularization/:regularizationId
  async getRegularization(regularizationId: string) {
    return apiCall(`/regularization/${regularizationId}`)
  },

  // 14. Get Regularizations by Date Range - GET /regularization/date/range
  async getRegularizationsByDateRange(startDate: string, endDate: string) {
    return apiCall(`/regularization/date/range?startDate=${startDate}&endDate=${endDate}`)
  },

  // 15. Get Regularization Statistics - GET /regularization/stats/data
  async getRegularizationStats() {
    return apiCall(`/regularization/stats/data`)
  },

  // 16. Request Regularization - POST /regularization/request
  async requestRegularization(data: {
    userId: string
    date: string
    checkIn: string
    checkOut: string
    reason: string
  }) {
    return apiCall(`/regularization/request`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // 17. Get Regularization History - GET /regularization/requests/user/:userId
  async getRegularizationHistory(userId: string, filters?: { page?: number; limit?: number }) {
    let url = `/regularization/${userId}`
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (params.toString()) url += `?${params.toString()}`
    return apiCall(url)
  },

  // 18. Get Day Summary - GET /user/:userId/date/:date
  async getDaySummary(userId: string, date: string) {
    return apiCall(`/user/${userId}/date/${date}`)
  },

  // 19. Get Today's Attendance - GET /user/:userId/date/:today
  async getTodaysAttendance(userId: string) {
    const today = new Date().toISOString().split("T")[0]
    return apiCall(`/user/${userId}/date/${today}`)
  },

  // Helper methods for pagination and data transformation
  parseAttendanceResponse(response: any) {
    if (Array.isArray(response.data)) {
      return response.data
    }
    if (response.data?.attendance) {
      return Array.isArray(response.data.attendance) ? response.data.attendance : [response.data.attendance]
    }
    if (response.data?.regularizations) {
      return Array.isArray(response.data.regularizations)
        ? response.data.regularizations
        : [response.data.regularizations]
    }
    return []
  },
}
