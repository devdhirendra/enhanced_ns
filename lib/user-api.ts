// lib/user-api.ts
const API_BASE_URL = "https://nsbackend-silk.vercel.app/api"

export interface User1 {
  user_id: string
  role: "customer" | "technician" | "operator" | "admin" | "staff" | "vendor"
  email: string
  profileDetail: {
    name: string
    phone: string
    area?: string
    specialization?: string
    rating?: number
    salary?: string | number
    technicianId?: string
    customerId?: string
    operatorId?: string
    vendorId?: string
    assignedOperatorId?: string
  }
  createdAt: string
  updatedAt: string
}

export interface User {
  user_id: string
  role: "customer" | "technician" | "operator" | "admin" | "staff" | "vendor"
  email: string
  profileDetail: {
    name: string
    phone: string
    area?: string
    specialization?: string
    rating?: number
    salary?: string | number
    technicianId?: string
    customerId?: string
    operatorId?: string
    vendorId?: string
    assignedOperatorId?: string
  }
  createdAt: string
  updatedAt: string
}

class UserApiClient {
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        throw new Error(errorData.error || errorData.message || "API request failed")
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] User API Error:", error)
      throw error
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    return this.request(`/admin/${role}/all`)
  }

  // Get all technicians
  async getAllTechnicians(): Promise<User[]> {
    return this.getUsersByRole("technician")
  }

  // Get all customers
  async getAllCustomers(): Promise<User[]> {
    return this.getUsersByRole("customer")
  }

  // Get all operators
  async getAllOperators(): Promise<User[]> {
    return this.getUsersByRole("operator")
  }

  // Get all vendors
  async getAllVendors(): Promise<User[]> {
    return this.getUsersByRole("vendor")
  }

  // Get all staff
  async getAllStaff(): Promise<User[]> {
    return this.getUsersByRole("staff")
  }
}

export const userApi = new UserApiClient(API_BASE_URL)