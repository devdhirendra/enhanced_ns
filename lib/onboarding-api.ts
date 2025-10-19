/**
 * Onboarding API Client
 * Handles all onboarding-related API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://nsbackend-silk.vercel.app/api"

export type OnboardingDoc = {
  type: string
  file?: string
  url?: string
  status?: "pending" | "approved" | "rejected" | "deleted"
  submittedAt?: string
  comment?: string
}

export type OnboardingRecord = {
  onboard_id: string
  userId: string
  profileName?: string
  doc: OnboardingDoc[] | string[]
  processStatus: "pending" | "in-progress" | "approved" | "rejected" | "deleted"
  verify?: "pending" | "success" | "rejected"
  comment?: string
  rejectionReason?: string
  whoApproveUserId?: string
  whoApproveProfileName?: string
  createdAt: string
  updatedAt: string
}

export type OnboardingHistoryRecord = OnboardingRecord & {
  deletedAt?: string
  deletedBy?: string
}

class OnboardingAPIClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error(`API Error ${response.status}:`, errorData)
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Upload a single file to S3
   */
  async uploadFile(file: File): Promise<{ fileUrl: string }> {
    const form = new FormData()
    form.append("file", file)

    const url = `${API_BASE_URL}/onboarding/upload`
    const headers: Record<string, string> = {}

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: form,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Upload failed" }))
      throw new Error(errorData.error || `Upload failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Create a new onboarding record
   */
  async createOnboarding(data: {
    userId: string
    doc: Array<{ type: string; file: string }>
  }): Promise<{ message: string; data: OnboardingRecord }> {
    return this.request<{ message: string; data: OnboardingRecord }>("/onboarding/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * Get all onboarding records (admin only)
   */
  async getAllOnboardings(): Promise<OnboardingRecord[]> {
    return this.request<OnboardingRecord[]>("/onboarding/all", {
      method: "GET",
    })
  }

  /**
   * Get onboarding record by ID
   */
  async getOnboardingById(id: string): Promise<OnboardingRecord> {
    return this.request<OnboardingRecord>(`/onboarding/${id}`, {
      method: "GET",
    })
  }

  /**
   * Get onboarding records by user ID
   */
  async getOnboardingsByUserId(userId: string): Promise<{
    message: string
    count: number
    data: OnboardingRecord[]
  }> {
    return this.request<{
      message: string
      count: number
      data: OnboardingRecord[]
    }>(`/onboarding/list/${userId}`, {
      method: "GET",
    })
  }

  /**
   * Update onboarding status (admin action)
   */
  async updateOnboardingStatus(
    id: string,
    data: {
      status: "pending" | "in-progress" | "approved" | "rejected"
      whoApproveUserId?: string
      comment?: string
      rejectionReason?: string
    },
  ): Promise<{ message: string; updatedRecord: OnboardingRecord }> {
    return this.request<{ message: string; updatedRecord: OnboardingRecord }>(`/onboarding/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  /**
   * Update individual document status
   */
  async updateDocumentStatus(
    onboardingId: string,
    documentIndex: number,
    status: "approved" | "rejected" | "pending",
    comment?: string,
  ): Promise<{ message: string; updatedRecord: OnboardingRecord }> {
    return this.request<{ message: string; updatedRecord: OnboardingRecord }>(
      `/onboarding/${onboardingId}/document/${documentIndex}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, comment }),
      },
    )
  }

  /**
   * Delete a specific document from onboarding - FIXED ENDPOINT
   */
  async deleteDocument(
    onboardingId: string,
    documentIndex: number,
  ): Promise<{ message: string; updatedRecord: OnboardingRecord }> {
    return this.request<{ message: string; updatedRecord: OnboardingRecord }>(
      `/onboarding/${onboardingId}/delete`, // REMOVED /delete from endpoint
      {
        method: "PATCH",
      },
    )
  }

  /**
   * Get onboarding history (deleted or rejected records)
   */
  async getOnboardingHistory(userId: string): Promise<{
    message: string
    count: number
    data: OnboardingHistoryRecord[]
  }> {
    return this.request<{
      message: string
      count: number
      data: OnboardingHistoryRecord[]
    }>(`/onboarding/history/${userId}`, {
      method: "GET",
    })
  }
}

export const onboardingApi = new OnboardingAPIClient()