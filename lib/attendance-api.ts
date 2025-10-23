const API_BASE_URL = "https://nsbackend-silk.vercel.app/api/attendance"

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
  // 1. Check-In Endpoint - FIXED
  async checkIn(userId: string, data: { location?: string; date?: string }) {
    return apiCall(`/checkin/${userId}`, {
      method: "POST",
      body: JSON.stringify({
        at: new Date().toISOString(),
        location: data.location || "Web App",
        deviceId: "web-app",
        meta: { ip: "0.0.0.0", appVersion: "1.0.0" },
      }),
    })
  },

  // 2. Check-Out Endpoint - FIXED
  async checkOut(userId: string) {
    return apiCall(`/checkout/${userId}`, {
      method: "POST",
      body: JSON.stringify({
        at: new Date().toISOString(),
        deviceId: "web-app",
        meta: { ip: "0.0.0.0" },
      }),
    })
  },

  // 3. Session Heartbeat - FIXED
  async sessionHeartbeat(sessionId: string) {
    return apiCall(`/session/heartbeat/${sessionId}`, {
      method: "POST",
      body: JSON.stringify({
        at: new Date().toISOString(),
        status: "active",
      }),
    })
  },
  

  // 4. Daily Summary - FIXED
  async getDaySummary(userId: string, date: string) {
    return apiCall(`/day/${userId}/${date}`)
  },

  // 5. Range Summary - FIXED
  async getRangeSummary(userId: string, from: string, to: string) {
    return apiCall(`/range/${userId}?from=${from}&to=${to}`)
  },

  // 6. Attendance by Role - FIXED
  async getByRole(role: string, filters?: { date?: string; from?: string; to?: string; page?: number; limit?: number }) {
    let url = `/role/${role}`
    const params = new URLSearchParams()
    if (filters?.date) params.append("date", filters.date)
    if (filters?.from) params.append("from", filters.from)
    if (filters?.to) params.append("to", filters.to)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (params.toString()) url += `?${params.toString()}`
    return apiCall(url)
  },

  // 7. User Attendance History - FIXED
  async getAllAttendance(userId: string, filters?: { limit?: number; page?: number; from?: string; to?: string }) {
    let url = `/${userId}`
    const params = new URLSearchParams()
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.from) params.append("from", filters.from)
    if (filters?.to) params.append("to", filters.to)
    if (params.toString()) url += `?${params.toString()}`
    return apiCall(url)
  },

  // 8. Create Regularization Request - FIXED
  async requestRegularization(data: {
    userId: string
    date: string
    checkIn: string
    checkOut: string
    reason: string
  }) {
    return apiCall(`/regularization/${data.userId}`, {
      method: "POST",
      body: JSON.stringify({
        date: data.date,
        type: "manual_time_adjust",
        requestedCheckIn: data.checkIn,
        requestedCheckOut: data.checkOut,
        reason: data.reason,
        attachments: [],
      }),
    })
  },

  // 9. List Regularization Requests - FIXED
  async getRegularizationRequests(filters?: { status?: string; page?: number; limit?: number }) {
    let url = `/regularization`
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (params.toString()) url += `?${params.toString()}`
    return apiCall(url)
  },

  // 10. Approve/Reject Regularization - FIXED
  async approveRegularization(requestId: string, data: { action: "approve" | "reject"; approvedBy: string; comments?: string }) {
    return apiCall(`/regularization/${requestId}/decision`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // 11. Force Check-In/Check-Out (Admin) - FIXED
  async forceCheckInOut(userId: string, data: { action: "checkin" | "checkout"; at: string; reason: string; createdBy: string }) {
    return apiCall(`/admin/force/${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // 12. Daily Reports - FIXED
async getDailyReport(filters: { date: string; role?: string }) {
  let url = `/reports/daily?date=${filters.date}`
  if (filters.role) url += `&role=${filters.role}`
  
  const response = await apiCall(url)
  
  // Transform the API response to match our frontend structure
  if (response.success && response.data) {
    // Handle different response structures
    let reportData = response.data.report || response.data
    
    if (Array.isArray(reportData)) {
      // Transform array data to match our interface
      const transformedData = reportData.map((item: any) => ({
        sessionId: item.sessionId || `session_${item.user_id}_${filters.date}`,
        user_id: item.userId || item.user_id,
        name: item.name || item.userName || "Unknown",
        role: item.role || "employee",
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        durationMinutes: item.durationMinutes || item.totalMinutes || 0,
        location: item.location || "Unknown Location",
        needsRegularization: item.needsRegularization || false,
        date: item.date || filters.date,
      }))
      return {
        ...response,
        data: { report: transformedData }
      }
    }
  }
  
  return response
},
async getAnalyticsData(filters: { from: string; to: string; role?: string }) {
  let url = `/reports/analytics?from=${filters.from}&to=${filters.to}`
  if (filters.role) url += `&role=${filters.role}`
  
  // For now, we'll simulate the API response structure
  // In production, this would be a real API call
  try {
    // Get attendance data for the date range
    const attendanceResponse = await this.getRangeSummary('all', filters.from, filters.to)
    
    if (attendanceResponse.success) {
      // Transform data for analytics
      const analyticsData = this.transformToAnalyticsData(attendanceResponse.data)
      return {
        success: true,
        data: analyticsData
      }
    }
    return attendanceResponse
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch analytics data",
      data: null
    }
  }
},

  // 13. Audit Logs - FIXED
async getAuditLog(userId: string, filters?: { from?: string; to?: string; page?: number; limit?: number }) {
  let url = `/audit/${userId}`
  const params = new URLSearchParams()
  if (filters?.from) params.append("from", filters.from)
  if (filters?.to) params.append("to", filters.to)
  if (filters?.page) params.append("page", filters.page.toString())
  if (filters?.limit) params.append("limit", filters.limit.toString())
  if (params.toString()) url += `?${params.toString()}`
  return apiCall(url)
},
  // 14. Get Month Summary (New - for AttendanceSummaryCard)
  async getMonthSummary(userId: string, yearMonth: string) {
    const [year, month] = yearMonth.split('-')
    const from = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const to = `${year}-${month}-${lastDay}`
    
    return this.getRangeSummary(userId, from, to)
  },

  // 15. Get Overtime Summary (New - for OvertimeSummary)
  async getOvertimeSummary(userId: string, from: string, to: string) {
    const response = await this.getRangeSummary(userId, from, to)
    if (response.success && response.data?.days) {
      // Calculate overtime summary from range data
      const overtimeDays = response.data.days.filter((day: any) => 
        day.totalMinutes > 480 // 8 hours in minutes
      )
      
      const totalOvertimeMinutes = overtimeDays.reduce((sum: number, day: any) => 
        sum + (day.totalMinutes - 480), 0
      )
      
      const summary = {
        totalOvertimeMinutes,
        totalOvertimeHours: totalOvertimeMinutes / 60,
        overtimeDays: overtimeDays.length,
        breakdown: response.data.days.map((day: any) => ({
          date: day.date,
          regularMinutes: Math.min(day.totalMinutes, 480),
          overtimeMinutes: Math.max(day.totalMinutes - 480, 0),
          totalMinutes: day.totalMinutes,
        }))
      }
      
      return {
        ...response,
        data: { summary }
      }
    }
    return response
  },

  // 16. Get Team Dashboard (New - for TeamAttendanceView)
  async getTeamDashboard(date: string) {
    // Get all roles and combine results
    const roles = ['technician', 'staff', 'operator', 'vendor']
    const allResults = await Promise.all(
      roles.map(role => this.getByRole(role, { date }))
    )
    
    const employees: any[] = []
    allResults.forEach((result, index) => {
      if (result.success && result.data?.users) {
        result.data.users.forEach((user: any) => {
          const todayAttendance = user.attendance?.find((a: any) => a.date === date)
          employees.push({
            user_id: user.user_id,
            name: user.name,
            role: roles[index],
            status: todayAttendance ? 
              (todayAttendance.checkOut ? 'checked-out' : 'active') : 'absent',
            checkIn: todayAttendance?.checkIn,
            checkOut: todayAttendance?.checkOut,
            location: todayAttendance?.location,
            currentDuration: todayAttendance?.durationMinutes,
          })
        })
      }
    })
    
    return {
      success: true,
      data: { employees }
    }
  },
  async getReportsData(filters: { type: string; from: string; to: string; role?: string }) {
  let url = `/reports/${filters.type}?from=${filters.from}&to=${filters.to}`
  if (filters.role) url += `&role=${filters.role}`
  
  // Simulate API response
  try {
    const response = await this.getRangeSummary('all', filters.from, filters.to)
    
    if (response.success) {
      const reportData = this.transformToReportData(response.data, filters.type)
      return {
        success: true,
        data: reportData
      }
    }
    return response
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate report",
      data: null
    }
  }
  
},


  // 17. Get Regularization History (New - for RegularizationHistory)
  async getRegularizationHistory(userId: string) {
    return this.getRegularizationRequests({ status: 'all' })
  },

  // 18. Update Regularization Status (New - for RegularizationApprovalTable)
  async updateRegularizationStatus(regularizationId: string, data: {
    status: "approved" | "rejected"
    approvedBy: string
    comments: string
  }) {
    return this.approveRegularization(regularizationId, {
      action: data.status === 'approved' ? 'approve' : 'reject',
      approvedBy: data.approvedBy,
      comments: data.comments,
    })
  }
  
}
