const API_BASE_URL = "https://nsbackend-silk.vercel.app/api/plan"

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || ""
  }
  return ""
}

// Helper function for API calls
const apiCall = async (endpoint: string, method = "GET", body?: any) => {
  const token = getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

// Plan API Functions
export const planSubscriptionApi = {
  // Get all plans
  getAllPlans: async () => {
    return apiCall("/all")
  },

  // Get plans by approval status
  getPlansByStatus: async (approvalStatus: "Approved" | "Pending" | "Rejected") => {
    return apiCall(`/status/${approvalStatus}`)
  },

  // Get plan by ID
  getPlanById: async (planId: string) => {
    return apiCall(`/${planId}`)
  },

  // Create new plan
  createPlan: async (
    userId: string,
    planData: {
      name: string
      speed: string
      validity_days: number
      price: number
      data_limit_gb: number
      max_customers: number
      comments?: string[]
    },
  ) => {
    return apiCall(`/create/${userId}`, "POST", planData)
  },

  // Update plan
  updatePlan: async (planId: string, updatedBy: string, updateData: any) => {
    return apiCall(`/${planId}`, "PUT", {
      updatedBy,
      ...updateData,
    })
  },

  // Approve/Reject plan
  approvePlan: async (
    planId: string,
    approvalData: {
      approved_by: string
      approval_status: "Approved" | "Rejected"
      comment?: string
    },
  ) => {
    return apiCall(`/approve/${planId}`, "PATCH", approvalData)
  },

  // Delete plan
  deletePlan: async (planId: string, deletedBy: string) => {
    return apiCall(`/${planId}`, "DELETE", { deletedBy })
  },

  // Get audit logs for a plan
  getPlanAuditLogs: async (planId: string) => {
    return apiCall(`/audit/${planId}`)
  },

  // Get plans created by user
  getPlansByCreator: async (userId: string) => {
    return apiCall(`/created_by/${userId}`)
  },

  // Get plans updated by user
  getPlansByUpdater: async (userId: string) => {
    return apiCall(`/updated_by/${userId}`)
  },

  // Get all audit logs
  getAllAuditLogs: async () => {
    return apiCall("/audit/all")
  },

  // Allocate plan to customer (custom endpoint)
  allocatePlanToCustomer: async (planId: string, customerId: string, allocationData: any) => {
    return apiCall(`/allocate/${planId}`, "POST", {
      customer_id: customerId,
      ...allocationData,
    })
  },
}
