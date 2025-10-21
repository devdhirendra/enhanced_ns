import type { ApiResponse } from "./api"

const API_BASE_URL = "https://nsbackend-silk.vercel.app/api"

export interface ComplaintUser {
  user_id: string
  role: "customer" | "technician" | "operator" | "admin" | "staff"
  name: string
  email: string
  phone: string
  customerId?: string
  technicianId?: string
  operatorId?: string
  address?: string
  specialization?: string
  rating?: number
  companyName?: string
}

export interface ComplaintDetails {
  assignedTo?: ComplaintUser
  previousTechnician?: ComplaintUser
  oldStatus?: string
  newStatus?: string
  oldRating?: string
  newRating?: string
}

export interface AuditLog {
  log_id: string
  complaint_id: string
  action: "created" | "assigned" | "status_updated" | "resolved" | "rating_updated" | "deleted"
  performedBy: ComplaintUser
  details: ComplaintDetails
  timestamp: string
  expiryDate: number
}
export interface LegacyComplaint {
  complaint_id: string
  customerId: string
  CustomerNotes: string
  technicianNotes: string
  technicianId: string
  status: string
  priority: string
  customerUserId: string
  description: string
  type: string
  createdAt: string
  updatedAt: string
  customerName?: string
  customerPhone?: string
  Area?: string
}

export interface Complaint {
  customerName: string
  complaint_id: string
  customerEmail: string
  createdBy: ComplaintUser
  assignedTechnician?: ComplaintUser
  assignedBy?: ComplaintUser
  type: string
  Area: string
  priority: "low" | "medium" | "high"
  description: string
  category: string
  rating?: "Good" | "Bad"
  status: "open" | "assigned" | "in-progress" | "resolved" | "closed"
  response?: string
  technicianNotes?: string
  createdAt: string
  updatedAt: string
}
const convertToComplaint = (data: any): Complaint => {
  if (data.createdBy) {
    // Already in Complaint format
    return data as Complaint
  } else {
    // Convert from LegacyComplaint to Complaint format
    return {
      customerName: data.customerName,
      complaint_id: data.complaint_id,
      customerEmail: data.customerEmail,
      createdBy: {
        user_id: data.customerUserId,
        role: "customer",
        name: data.customerName || "Unknown Customer",
        email: "",
        phone: data.customerPhone || "",
        customerId: data.customerId
      },
      assignedTechnician: data.technicianId ? {
        user_id: "",
        role: "technician",
        name: "Technician",
        email: "",
        phone: "",
        technicianId: data.technicianId
      } : undefined,
      type: data.type,
      Area: data.Area || "",
      priority: data.priority as "low" | "medium" | "high",
      description: data.description,
      category: data.type || "general",
      status: data.status as "open" | "assigned" | "in-progress" | "resolved" | "closed",
      response: data.response,
      technicianNotes: data.technicianNotes,
      rating: data.rating as "Good" | "Bad",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  }
}


class ComplaintApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

//   private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
//     const url = `${this.baseURL}${endpoint}`
//     const headers: Record<string, string> = {
//       "Content-Type": "application/json",
//       ...(options.headers as Record<string, string>),
//     }

//     if (this.token) {
//       headers["Authorization"] = `Bearer ${this.token}`
//     }

//     try {
//       const response = await fetch(url, {
//         ...options,
//         headers,
//       })

//       if (!response.ok) {
//         let errorData
//         try {
//           errorData = await response.json()
//         } catch {
//           errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
//         }

//         if (response.status === 401) {
//           this.token = null
//           throw new Error("AUTHENTICATION_FAILED")
//         } else if (response.status === 403) {
//           throw new Error("ACCESS_DENIED")
//         } else if (response.status === 404) {
//           throw new Error("NOT_FOUND")
//         }

//         throw new Error(errorData.error || errorData.message || "API request failed")
//       }

//       const data = await response.json()
//       return data
//     } catch (error) {
//       console.error("[v0] Complaint API Error:", error)
//       throw error
//     }
//   }

  // Create Complaint
  async createComplaint(userId: string, data: any): Promise<ApiResponse<Complaint>> {
    return this.request(`/complaints/create/${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Assign Technician
  async assignTechnician(complaintId: string, data: any): Promise<ApiResponse<Complaint>> {
    return this.request(`/complaints/assign/${complaintId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Update Status
  async updateStatus(complaintId: string, data: any): Promise<ApiResponse<Complaint>> {
    return this.request(`/complaints/status/${complaintId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Update Rating
  async updateRating(complaintId: string, data: any): Promise<ApiResponse<Complaint>> {
    return this.request(`/complaints/rating/${complaintId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

// In lib/complaint-api.ts - Update the request method
// In lib/complaint-api.ts - Replace the entire request method
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${this.baseURL}${endpoint}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (this.token) {
    headers["Authorization"] = `Bearer ${this.token}`
  }

  try {
    // Deep clean the request body to remove ALL undefined values
    let body = options.body
    if (body && typeof body === 'string') {
      try {
        const parsedBody = JSON.parse(body)
        const cleanedBody = this.deepCleanObject(parsedBody)
        body = JSON.stringify(cleanedBody)
        console.log('[v0] Cleaned request body:', cleanedBody)
      } catch (e) {
        console.warn('[v0] Request body is not valid JSON:', e)
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      body,
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
      }

      if (response.status === 401) {
        this.token = null
        throw new Error("AUTHENTICATION_FAILED")
      } else if (response.status === 403) {
        throw new Error("ACCESS_DENIED")
      } else if (response.status === 404) {
        throw new Error("NOT_FOUND")
      }

      throw new Error(errorData.error || errorData.message || "API request failed")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Complaint API Error:", error)
    throw error
  }
}

// New deep clean method that removes ALL undefined/null values
private deepCleanObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined // Return undefined to be filtered out
  }

  if (Array.isArray(obj)) {
    const cleanedArray = obj.map(item => this.deepCleanObject(item)).filter(item => item !== undefined)
    return cleanedArray.length > 0 ? cleanedArray : undefined
  }

  if (typeof obj === 'object') {
    const cleaned: any = {}
    let hasValidProperties = false
    
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = this.deepCleanObject(value)
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue
        hasValidProperties = true
      }
    }
    
    return hasValidProperties ? cleaned : undefined
  }

  return obj
}

// Helper method to remove undefined values from objects
private removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => this.removeUndefinedValues(item))
  }

  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = this.removeUndefinedValues(value)
      }
    }
    return cleaned
  }

  return obj
}

// Update the delete method to ensure proper data structure
async deleteComplaint(complaintId: string, data: any): Promise<ApiResponse<void>> {
  // Ensure we have the required fields with proper values
  const deleteData = {
    deletedBy: data.deletedBy || 'admin',
    reason: data.reason || 'Admin deletion',
    ...data
  }
  
  return this.request(`/complaints/${complaintId}`, {
    method: "DELETE",
    body: JSON.stringify(deleteData),
  })
}

  // Get All Complaints
  async getAllComplaints(): Promise<ApiResponse<Complaint[]>> {
    const response = await this.request<Complaint[] | LegacyComplaint[]>(`/complaints/all`, {
      method: "GET",
    })
    
    // Convert the data to Complaint format
    if (Array.isArray(response.data)) {
      response.data = response.data.map(convertToComplaint)
    }
    
    return response as ApiResponse<Complaint[]>
  }
  // Get Complaints by Technician
  async getComplaintsByTechnician(technicianId: string): Promise<ApiResponse<Complaint[]>> {
    const response = await this.request<Complaint[] | LegacyComplaint[]>(`/complaints/assign/${technicianId}`, {
      method: "GET",
    })
    
    // Convert the data to Complaint format
    if (Array.isArray(response.data)) {
      response.data = response.data.map(convertToComplaint)
    }
    
    return response as ApiResponse<Complaint[]>
  }


  // Get Complaints by Customer
  async getComplaintsByCustomer(customerId: string): Promise<ApiResponse<Complaint[]>> {
    const response = await this.request<Complaint[] | LegacyComplaint[]>(`/complaints/profile/${customerId}`, {
      method: "GET",
    })
    
    // Convert the data to Complaint format
    if (Array.isArray(response.data)) {
      response.data = response.data.map(convertToComplaint)
    }
    
    return response as ApiResponse<Complaint[]>
  }

  // Get Single Complaint
  async getComplaint(complaintId: string): Promise<ApiResponse<Complaint>> {
    return this.request(`/complaints/${complaintId}`, {
      method: "GET",
    })
  }

  // Get Complaint Audit Trail
  async getAuditTrail(complaintId: string): Promise<ApiResponse<AuditLog[]>> {
    return this.request(`/complaints/audit/${complaintId}`, {
      method: "GET",
    })
  }

  // Get User Complaint History
  async getUserHistory(userId: string, action?: string): Promise<ApiResponse<AuditLog[]>> {
    const query = action ? `?action=${action}` : ""
    return this.request(`/complaints/audit/user/${userId}${query}`, {
      method: "GET",
    })
  }

  // Get User Activity Summary
  async getUserActivitySummary(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/complaints/audit/user/${userId}/summary`, {
      method: "GET",
    })
  }
}

const complaintApiClient = new ComplaintApiClient(API_BASE_URL)

export const complaintApi = {
  // Create & Manage
  create: (userId: string, data: any) => complaintApiClient.createComplaint(userId, data),
  createComplaint: (userId: string, data: any) => complaintApiClient.createComplaint(userId, data),
  assignTechnician: (complaintId: string, data: any) => complaintApiClient.assignTechnician(complaintId, data),
  updateStatus: (complaintId: string, data: any) => complaintApiClient.updateStatus(complaintId, data),
  updateRating: (complaintId: string, data: any) => complaintApiClient.updateRating(complaintId, data),
  delete: (complaintId: string, data: any) => complaintApiClient.deleteComplaint(complaintId, data),

  // Query
  getAll: () => complaintApiClient.getAllComplaints(),
  getAllComplaints: () => complaintApiClient.getAllComplaints(),
  getByTechnician: (technicianId: string) => complaintApiClient.getComplaintsByTechnician(technicianId),
  getTechnicianComplaints: (technicianId: string) => complaintApiClient.getComplaintsByTechnician(technicianId),
  getByCustomer: (customerId: string) => complaintApiClient.getComplaintsByCustomer(customerId),
  getUserComplaints: (userId: string) => complaintApiClient.getComplaintsByCustomer(userId),
  getById: (complaintId: string) => complaintApiClient.getComplaint(complaintId),

  // Audit & History
  getAuditTrail: (complaintId: string) => complaintApiClient.getAuditTrail(complaintId),
  getUserHistory: (userId: string, action?: string) => complaintApiClient.getUserHistory(userId, action),
  getUserActivitySummary: (userId: string) => complaintApiClient.getUserActivitySummary(userId),
}

export default complaintApiClient
