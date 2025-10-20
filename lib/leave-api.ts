// lib/leave-api.ts
"use client"

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

// Leave Policy API
export const leavePolicyApi = {
  async create(policyData: any) {
    return apiCall("/leave-policy/create", {
      method: "POST",
      body: JSON.stringify(policyData),
    })
  },

  async getAll() {
    return apiCall("/leave-policy/all")
  },

  async getById(policyId: string) {
    return apiCall(`/leave-policy/${policyId}`)
  },

  async update(policyId: string, updateData: any) {
    return apiCall(`/leave-policy/update/${policyId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  },

  async delete(policyId: string) {
    return apiCall(`/leave-policy/delete/${policyId}`, {
      method: "DELETE",
    })
  },
}

// Leave Request API
export const leaveRequestApi = {
  async create(userId: string, requestData: any) {
    return apiCall(`/leave/requests/${userId}`, {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  },

  async getAll() {
    return apiCall("/leave/requests")
  },

  async getMyRequests(userId: string) {
    return apiCall(`/leave/requests/my/${userId}`)
  },

  async approve(leaveId: string, approvedBy: string) {
    return apiCall(`/leave/requests/${leaveId}/approve`, {
      method: "PUT",
      body: JSON.stringify({ approvedBy }),
    })
  },

  async reject(leaveId: string, rejectedBy: string, rejectionReason: string) {
    return apiCall(`/leave/requests/${leaveId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectedBy, rejectionReason }),
    })
  },
}

// Leave Balance API
export const leaveBalanceApi = {
  async getMyBalance(userId: string) {
    return apiCall(`/leave/balance/${userId}`)
  },

  async getMyPolicies(userId: string) {
    return apiCall(`/leave/policies/my/${userId}`)
  },
}

// Leave User Policies API (for admin)
export const leaveUserPoliciesApi = {
  async getAllUsers() {
    return apiCall("/leave/policies/all-users")
  },

  async getUsersByPolicy(policyId: string) {
    return apiCall(`/leave/policies/${policyId}/users`)
  },
}

// Leave History API
export const leaveHistoryApi = {
  async getMyHistory(userId: string) {
    return apiCall(`/leave/history/${userId}`)
  },

  async getAllHistory() {
    return apiCall("/leave/history")
  },
}