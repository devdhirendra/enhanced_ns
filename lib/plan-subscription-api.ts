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

const getAllCustomers = async () => {
  try {
    const response = await fetch("https://nsbackend-silk.vercel.app/api/customer/all", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

// Plan API Functions
const planSubscriptionApi = {
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

  // The API docs show POST /plan/subscribe/:userId/:planId is the correct endpoint

  // Subscribe user to a plan
  subscribeToPlan: async (userId: string, planId: string) => {
    return apiCall(`/subscribe/${userId}/${planId}`, "POST")
  },

  // Get active subscription for user
  getActiveSubscription: async (userId: string) => {
    try {
      const response = await apiCall(`/subscription/active/${userId}`)
      // API returns { subscription: {...}, plan_details: {...} }
      if (response.subscription && response.plan_details) {
        return {
          subscription_id: response.subscription.subscription_id,
          plan_id: response.subscription.plan_id,
          status: response.subscription.status,
          name: response.plan_details.name,
          price: response.plan_details.price,
          speed: response.plan_details.speed,
          start_date: response.subscription.start_date,
          end_date: response.subscription.end_date,
          validity_days: response.plan_details.validity_days,
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching active subscription:", error)
      return null
    }
  },

  // Get subscription history for user
  getSubscriptionHistory: async (userId: string) => {
    return apiCall(`/subscription/history/${userId}`)
  },

  // Change subscription status (Pause, Resume, Cancel)
  updateSubscriptionStatus: async (
    subscriptionId: string,
    statusData: {
      status: "Active" | "Paused" | "Cancelled" | "Expired"
      reason?: string
      admin_id: string
    },
  ) => {
    return apiCall(`/subscription/status/${subscriptionId}`, "PATCH", statusData)
  },

  // Auto-expire subscriptions (admin/cron job)
  autoExpireSubscriptions: async () => {
    return apiCall("/subscription/auto-expire", "POST")
  },

  // Get subscribers by status with count
  getSubscribersByStatus: async (status: "Active" | "Paused" | "Cancelled" | "Expired") => {
    try {
      const token = getAuthToken()
      const response = await fetch(`https://nsbackend-silk.vercel.app/api/plan/subscribers/status/${status}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching subscribers by status:", error)
      return { status, total: 0, subscribers: [] }
    }
  },

  // Get all subscriptions (for admin dashboard)
  getAllSubscriptions: async () => {
    try {
      const activeData = await planSubscriptionApi.getSubscribersByStatus("Active")
      const pausedData = await planSubscriptionApi.getSubscribersByStatus("Paused")
      const cancelledData = await planSubscriptionApi.getSubscribersByStatus("Cancelled")
      const expiredData = await planSubscriptionApi.getSubscribersByStatus("Expired")

      const allSubscriptions = [
        ...(activeData.subscribers || []),
        ...(pausedData.subscribers || []),
        ...(cancelledData.subscribers || []),
        ...(expiredData.subscribers || []),
      ]

      return allSubscriptions
    } catch (error) {
      console.error("Error fetching all subscriptions:", error)
      return []
    }
  },

  getPlanHistory: async (userId: string) => {
    return planSubscriptionApi.getSubscriptionHistory(userId)
  },

  getAllCustomers,
}

// Helper function to calculate days left
const getDaysLeftToExpire = (endDate: string): number => {
  const today = new Date()
  const end = new Date(endDate)
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Export the planSubscriptionApi object with the new function
export { planSubscriptionApi, getDaysLeftToExpire }
