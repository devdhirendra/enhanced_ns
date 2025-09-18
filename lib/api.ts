  const API_BASE_URL = "https://nsbackend-silk.vercel.app/api"

  export interface ApiResponse<T = any> {
    success: any
    data?: T
    message?: string
    error?: string
    token?: string
    user_id?: string
    id?: string
  }

  export interface User {
    user_id: string
    email: string
    role: "admin" | "operator" | "technician" | "vendor" | "customer" | "staff"
    profileDetail: {
      name: string
      phone: string
      [key: string]: any
    }
    createdAt: string
    updatedAt: string
    Permissions: Record<string, any>
  }

  export interface LoginResponse {
    token: string
    user_id: string
    role: "admin" | "operator" | "technician" | "vendor" | "customer" | "staff"
  }

  export interface Complaint {
    customerUserId: string
    complaint_id: string
    customerId: string
    customerName: string
    customerEmail: string
    type: string
    Area: string
    priority: "low" | "medium" | "high"
    description: string
    technicianId: string
    technicianNotes: string
    CustomerNotes: string
    status: "open" | "assigned" | "in-progress" | "resolved" | "closed"
    createdAt: string
    updatedAt: string
  }

  export interface LeaveRequest {
    leaveId: string
    technicianId: string
    leaveType: "sick" | "personal" | "vacation" | "emergency"
    startDate: string
    endDate: string
    reason: string
    documents?: string[]
    status: "pending" | "approved" | "rejected"
    createdAt: string
    updatedAt: string
  }
  export interface Task {
    taskId?: string;
    title: string;
    assignTo: string;
    category: string;
    description?: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
    dueDate: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface TaskFilters {
    assignTo?: string;
    category?: string;
    priority?: string;
    status?: string;
    createdBy?: string;
  }

  export interface LogFilters {
    limit?: number;
    operation?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }




  export interface AttendanceSession {
    technicianId: string
    checkInTime: string
    date: string
    checkIn: string
    checkOut: string | null
    location: string
    durationMinutes: number
    createdAt: string
    updatedAt: string
  }

  export interface StockItem {
    itemId: string
    itemName: string
    quantity: number
    supplier: string
    unitPrice: number
    category: string
    brand: string
    phoneNumber?: string
    description?: string
    specification?: string
    ModelNumber?: string
    costPrice?: number
    sellingPrice?: number
    ProductImage?: string
    warantyInfo?: string
    discount?: string
    rating?: number
    unitType?: string
    sold?: number
    status: "Available" | "Out of Stock" | "Discontinued"
  }

  export interface StockIssuance {
    issueId: string
    operatorId: string
    items: Array<{
      itemId: string
      quantity: number
    }>
    status: "Pending" | "Delivered" | "Cancelled"
    createdAt: string
    updatedAt: string
  }

  class ApiClient {
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

    clearToken() {
      this.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
      }
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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

          // Handle specific authentication errors
          if (response.status === 401) {
            // Token expired or invalid
            this.clearToken()
            throw new Error("AUTHENTICATION_FAILED")
          } else if (response.status === 403) {
            throw new Error("ACCESS_DENIED")
          } else if (response.status === 404) {
            throw new Error("USER_NOT_FOUND")
          } else if (response.status >= 500) {
            throw new Error("SERVER_ERROR")
          }

          throw new Error(errorData.error || errorData.message || "API request failed")
        }

        const data = await response.json()
        // console.log("API Response:", data)
        return data
      } catch (error) {
        // console.error("API request error:", error)
        throw error
      }
    }

    async login(email: string, password: string): Promise<LoginResponse> {
      try {
        const response = await this.request<LoginResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        })

        if (response.token) {
          this.setToken(response.token)
        }

        return {
          token: response.token!,
          user_id: response.user_id!,
          role: response.role!,
        }
      } catch (error) {
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message === "USER_NOT_FOUND") {
            throw new Error("No account found with this email address")
          } else if (error.message === "AUTHENTICATION_FAILED") {
            throw new Error("Invalid email or password")
          } else if (error.message === "SERVER_ERROR") {
            throw new Error("Server is temporarily unavailable. Please try again later.")
          }
        }
        throw error
      }
    }

    async registerAdmin(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
      }
    }): Promise<ApiResponse> {
      return this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          role: "admin",
        }),
      })
    }

    async getAllAdmins(): Promise<User[]> {
      const response = await this.request<User[]>("/admin/all")
      return response.data || (response as User[])
    }

    async addAdmin(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
      }
    }): Promise<ApiResponse> {
      return this.request("/admin/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getAdmin(userId: string): Promise<User> {
      const response = await this.request<User>(`/admin/profile/${userId}`)
      return response.data || (response as User)
    }

    async updateAdmin(
      userId: string,
      data: {
        email?: string
        password?: string
        profileDetail?: {
          name?: string
          phone?: string
        }
      },
    ): Promise<ApiResponse> {
      return this.request(`/admin/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteAdmin(userId: string): Promise<ApiResponse> {
      return this.request(`/admin/profile/${userId}`, {
        method: "DELETE",
      })
    }

    async getAllOperators(): Promise<User[]> {
      const response = await this.request<User[]>("/admin/operator/all")
      return response.data || (response as User[])
    }

  async addOperator(data: {
    email: string
    password: string
    profileDetail: {
      name: string
      phone: string
      companyName: string
      address: {
        state: string
        district: string
        area: string
      }
      planAssigned: string
      customerCount: number
      revenue: number
      gstNumber: string
      businessType: string
      serviceCapacity: {
        connections: number
        olts: number
      }
      apiAccess: {
        whatsapp: boolean
        paymentGateway: boolean
      }
      KycDocuments: {
        profID: string
        ProfAddress: string
        verify: boolean
      }
      GST: {
        number: string
        verify: boolean
      }
    }
  }): Promise<ApiResponse> {
    return this.request("/admin/operator/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }


    async getOperator(userId: string): Promise<User> {
      const response = await this.request<User>(`/admin/operator/profile/${userId}`)
      return response.data || (response as User)
    }

    async getOperatorProfile(userId: string): Promise<User> {
      const response = await this.request<User>(`/operator/profile/${userId}`)
      return response.data || (response as User)
    }

    async updateOperator(userId: string, data: any): Promise<ApiResponse> {
      return this.request(`/admin/operator/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteOperator(userId: string): Promise<ApiResponse> {
      return this.request(`/admin/operator/profile/${userId}`, {
        method: "DELETE",
      })
    }

    async getAllTechnicians(): Promise<User[]> {
      const response = await this.request<User[]>("/admin/technician/all")
      return response.data || (response as User[])
    }

    async addTechnician(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
        area: string
        specialization: string
        salary: string
        assignedOperatorId: string
      }
    }): Promise<ApiResponse> {
      return this.request("/admin/technician/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getTechnician(userId: string): Promise<User> {
      const response = await this.request<User>(`/admin/technician/profile/${userId}`)
      return response.data || (response as User)
    }

    async getTechnicianProfile(userId: string): Promise<User> {
      const response = await this.request<User>(`/technician/profile/${userId}`)
      return response.data || (response as User)
    }

    async updateTechnician(userId: string, data: any): Promise<ApiResponse> {
      return this.request(`/admin/technician/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteTechnician(userId: string): Promise<ApiResponse> {
      return this.request(`/admin/technician/profile/${userId}`, {
        method: "DELETE",
      })
    }

    async getAllStaff(): Promise<User[]> {
      const response = await this.request<User[]>("/admin/staff/all")
      return response.data || (response as User[])
    }

    async addStaff(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
        assignedTo: string
      }
    }): Promise<ApiResponse> {
      return this.request("/admin/staff/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getStaff(userId: string): Promise<User> {
      const response = await this.request<User>(`/admin/staff/profile/${userId}`)
      return response.data || (response as User)
    }

    async updateStaff(userId: string, data: any): Promise<ApiResponse> {
      return this.request(`/admin/staff/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteStaff(userId: string): Promise<ApiResponse> {
      return this.request(`/admin/staff/profile/${userId}`, {
        method: "DELETE",
      })
    }

    async getStaffProfile(userId: string): Promise<User> {
      const response = await this.request<User>(`/staff/profile/${userId}`)
      return response.data || (response as User)
    }

    async getAllVendors(): Promise<User[]> {
      const response = await this.request<User[]>("/admin/vendor/all")
      return response.data || (response as User[])
    }

    async addVendor(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
        companyName: string
        address: {
          state: string
          district: string
          area: string
        }
      }
    }): Promise<ApiResponse> {
      return this.request("/admin/vendor/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getVendor(userId: string): Promise<User> {
      const response = await this.request<User>(`/admin/vendor/${userId}`)
      return response.data || (response as User)
    }

    async updateVendor(userId: string, data: any): Promise<ApiResponse> {
      return this.request(`/admin/vendor/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteVendor(userId: string): Promise<ApiResponse> {
      return this.request(`/admin/vendor/${userId}`, {
        method: "DELETE",
      })
    }

    async getVendorProfile(userId: string): Promise<User> {
      const response = await this.request<User>(`/vendor/profile/${userId}`)
      return response.data || (response as User)
    }

    async getAllCustomers(): Promise<User[]> {
      const response = await this.request<User[]>("/admin/customer/all")
      return response.data || (response as User[])
    }

    async addCustomer(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
        address: string
        planId: string
        connectionType: string
        monthlyRate: number
      }
    }): Promise<ApiResponse> {
      return this.request("/admin/customer/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getCustomer(userId: string): Promise<User> {
      const response = await this.request<User>(`/admin/customer/profile/${userId}`)
      return response.data || (response as User)
    }

    async updateCustomer(userId: string, data: any): Promise<ApiResponse> {
      return this.request(`/admin/customer/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

      async updateCustomerPlan(userId: string, data: any): Promise<ApiResponse> {
      return this.request(`/admin/customer/profile/${userId}/plan`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    

    async deleteCustomer(userId: string): Promise<ApiResponse> {
      return this.request(`/admin/customer/profile/${userId}`, {
        method: "DELETE",
      })
    }

    async getCustomerProfile(userId: string): Promise<User> {
      const response = await this.request<User>(`/customer/profile/${userId}`)
      return response.data || (response as User)
    }

    async getAllComplaints(): Promise<any[]> {
      const response = await this.request<any[]>("/admin/complain/all")
      return response.data || (response as any[])
    }

    async addComplaint(data: {
      title: string
      description: string
      priority: "low" | "medium" | "high"
      category: string
      customerId?: string
    }): Promise<ApiResponse> {
      return this.request("/admin/complain/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getComplaintsById(id: string): Promise<any[]> {
      const response = await this.request<any[]>(`/Customer/complain/profile/${id}`)
      return response.data || (response as any[])
    }


    async riseComplaint(
      customerId: string,
      data: {
        type: string
        priority: "low" | "medium" | "high"
        description: string
        technicianId?: string | null
        category: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/Customer/complain/create/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    }

    async changecomplaintstatus(
      complaintId: string,
      data: {
        status: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/Customer/complain/status/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    }

    async updateComplaint(
      complaintId: string,
      data: {
        status?: string
        priority?: string
        assignedTo?: string
        resolution?: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/admin/complain/${complaintId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteComplaint(complaintId: string): Promise<ApiResponse> {
      return this.request(`/admin/complain/${complaintId}`, {
        method: "DELETE",
      })
    }

    async getVendorProducts(vendorId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/vendor/products/${vendorId}`)
      return response.data || (response as any[])
    }

    async addVendorProduct(data: {
      name: string
      category: string
      price: number
      stock: number
      description: string
      specifications: string
      warranty: string
      discount?: number
    }): Promise<ApiResponse> {
      return this.request("/vendor/products", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async updateVendorProduct(productId: string, data: any): Promise<ApiResponse> {
      return this.request(`/vendor/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteVendorProduct(productId: string): Promise<ApiResponse> {
      return this.request(`/vendor/products/${productId}`, {
        method: "DELETE",
      })
    }

    async getVendorOrders(vendorId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/vendor/orders/${vendorId}`)
      return response.data || (response as any[])
    }

    async updateOrderStatusVendor(orderId: string, status: string, trackingId?: string): Promise<ApiResponse> {
      return this.request(`/vendor/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, trackingId }),
      })
    }

    async getMarketplaceProducts(): Promise<any[]> {
      const response = await this.request<any[]>("/inventory/stock/products")
      return response.data || (response as any[])
    }

    async createMarketplaceOrder(data: {
      productName: string
      quantity: number
      operatorId: string
      vendorId: string
      status?: string
    }): Promise<ApiResponse> {
      return this.request("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getMarketplaceOrders(): Promise<any[]> {
      const response = await this.request<any[]>("/orders")
      return response.data || (response as any[])
    }

    async updateMarketplaceOrder(
      orderId: string,
      data: {
        status?: string
        trackingNumber?: string
        estimatedDelivery?: string
        quantity?: number
      },
    ): Promise<ApiResponse> {
      return this.request(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async addMarketplaceProduct(data: {
      itemName: string
      quantity: number
      supplier: string
      unitPrice: number
      category: string
      brand: string
      description: string
      specification?: string
      ModelNumber?: string
      costPrice?: number
      sellingPrice?: number
      role: string
    }): Promise<ApiResponse> {
      const response = await this.request("/inventory/stock/add", {
        method: "POST",
        body: JSON.stringify(data),
      })

      // if API returns created product with id, treat as success
      if (response && response.id) {
        return { success: true, data: response }
      } else {
        return { success: false, error: response?.message || "Something went wrong" }
      }
    }

    async createOrder(data: {
      vendorId: string
      products: Array<{
        productId: string
        quantity: number
        price: number
      }>
      shippingAddress: string
      paymentMethod: string
    }): Promise<ApiResponse> {
      return this.request("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getAllOrders(): Promise<any[]> {
      const response = await this.request<any[]>("/orders")
      return response.data || (response as any[])
    }

    async getOrder(orderId: string): Promise<any> {
      const response = await this.request(`/orders/${orderId}`)
      return response.data || (response as any)
    }

    async updateOrder(orderId: string, data: any): Promise<ApiResponse> {
      return this.request(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteOrder(orderId: string): Promise<ApiResponse> {
      return this.request(`/orders/${orderId}`, {
        method: "DELETE",
      })
    }

    async getNotifications(userId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/notifications/${userId}`)
      return response.data || (response as any[])
    }

    async markNotificationRead(notificationId: string): Promise<ApiResponse> {
      return this.request(`/notifications/${notificationId}/read`, {
        method: "PUT",
      })
    }

    async sendNotification(data: {
      recipientId: string
      title: string
      message: string
      type: string
    }): Promise<ApiResponse> {
      return this.request("/notifications", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getBillingHistory(customerId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/billing/history/${customerId}`)
      return response.data || (response as any[])
    }

    async generateInvoice(
      customerId: string,
      data: {
        amount: number
        dueDate: string
        description: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/billing/invoice/${customerId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async processPayment(data: {
      customerId: string
      amount: number
      paymentMethod: string
      invoiceId?: string
    }): Promise<ApiResponse> {
      return this.request("/billing/payment", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async addStock(data: {
      itemName: string
      quantity: number
      supplier: string
      unitPrice: number
      category: string
    }): Promise<ApiResponse> {
      return this.request("/inventory/operator/add", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async assignStockToTechnician(
      itemId: string,
      data: {
        technicianId: string
        quantity: number
      },
    ): Promise<ApiResponse> {
      return this.request(`/inventory/operator/assign/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async returnItems(
      itemId: string,
      data: {
        quantity: number
      },
    ): Promise<ApiResponse> {
      return this.request(`/inventory/technician/return/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async confirmInstallation(itemId: string): Promise<ApiResponse> {
      return this.request(`/inventory/customer/confirm/${itemId}`, {
        method: "PUT",
      })
    }

    async createLeaveRequest(
      technicianId: string,
      data: {
        leaveType: string
        startDate: string
        endDate: string
        reason: string
        documents?: string[]
      },
    ): Promise<ApiResponse> {
      return this.request(`/admin/leave/requests/${technicianId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getAllLeaveRequests(): Promise<any[]> {
      const response = await this.request<any[]>("/leave/requests")
      return response.data || (response as any[])
    }

    async getTechnicianLeaveRequests(technicianId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/leave/requests/my/${technicianId}`)
      return response.data || (response as any[])
    }

    async updateLeaveRequest(
      leaveId: string,
      data: {
        reason?: string
        endDate?: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/leave/requests/${leaveId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async approveLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/leave/requests/${leaveId}/approve`, {
        method: "PUT",
      })
    }

    async rejectLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/leave/requests/${leaveId}/reject`, {
        method: "PUT",
      })
    }

    async deleteLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/leave/requests/${leaveId}`, {
        method: "DELETE",
      })
    }

    async addProduct(data: {
      name: string
      category: string
      price: number
      description: string
      specifications: any
      images: string[]
    }): Promise<ApiResponse> {
      return this.request("/products/add", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getProducts(): Promise<any[]> {
      const response = await this.request<any[]>("/products")
      return response.data || (response as any[])
    }

    async getProductCatalog(): Promise<any[]> {
      const response = await this.request<any[]>("/products/catalog")
      return response.data || (response as any[])
    }

    async placeOrder(data: {
      productId: string
      quantity: number
      vendorId: string
    }): Promise<ApiResponse> {
      return this.request("/order/Places", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getOrders(): Promise<any[]> {
      const response = await this.request<any[]>("/orders")
      return response.data || (response as any[])
    }

    async updateOrderStatus(
      orderId: string,
      data: {
        status: string
        trackingNumber?: string
        estimatedDelivery?: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async getStockAlerts(): Promise<any[]> {
      const response = await this.request<any[]>("/stock/alerts")
      return response.data || (response as any[])
    }

    async getStockMovements(): Promise<any[]> {
      const response = await this.request<any[]>("/inventory/stock/movements")
      return response.data || (response as any[])
    }

    async stockAdjustment(data: {
      itemId: string
      adjustment: number
      reason: string
    }): Promise<ApiResponse> {
      return this.request("/stock/adjustment", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getCategories(): Promise<any[]> {
      const response = await this.request<any[]>("/stock/categories")
      return response.data || (response as any[])
    }

    async addCategory(data: {
      name: string
      description: string
    }): Promise<ApiResponse> {
      return this.request("/stock/categories", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getAllStockProducts(): Promise<any[]> {
      const response = await this.request<any[]>("/inventory/stock/products")
      return response.data || (response as any[])
    }

    async addStockItem(data: {
      itemName: string
      quantity: number
      supplier: string
      unitPrice: number
      category: string
      brand: string
      phoneNumber?: string
      description?: string
      specification?: string
      ModelNumber?: string
      costPrice?: number
      sellingPrice?: number
      ProductImage?: string
      warantyInfo?: string
      discount?: string
      rating?: number
      unitType?: string
      sold?: number
      status?: string
      role: string
    }): Promise<ApiResponse> {
      return this.request("/inventory/stock/add", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async updateStockItem(
      id: string,
      data: {
        quantity?: number
        unitPrice?: number
        status?: string
        role: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/inventory/update/stock/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteStockItem(id: string, role: string): Promise<ApiResponse> {
      return this.request(`/inventory/delete/stock/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ role }),
      })
    }

    async issueStockToOperator(data: {
      operatorId: string
      items: Array<{
        itemId: string
        quantity: number
      }>
    }): Promise<ApiResponse> {
      return this.request("/inventory/stock/issue", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getAllIssuances(): Promise<any[]> {
      const response = await this.request<any[]>("/inventory/stock/issuance/all")
      return response.data || (response as any[])
    }

    async getSpecificIssuance(issueId: string): Promise<any> {
      const response = await this.request(`/inventory/stock/issuance/${issueId}`)
      return response.data || (response as any)
    }

    async updateIssuanceStatus(issueId: string, status: string): Promise<ApiResponse> {
      return this.request(`/inventory/stock/issuance/${issueId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
    }

    async getOperatorIssuances(operatorId: string): Promise<any[]> {
      const response = await this.request(`/inventory/stock/issuance/operator/${operatorId}`)
      return response.data || (response as any[])
    }

    async assignStockToTechnicianNew(data: {
      operatorId: string
      technicianId: string
      itemId: string
      quantity: number
      issueId: string
      role: string
    }): Promise<ApiResponse> {
      return this.request("/inventory/stock/assign/technician", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getTechnicianStock(technicianId: string): Promise<any> {
      const response = await this.request(`/inventory/stock/assign/technician/${technicianId}`)
      return response.data || (response as any)
    }

    async returnStockFromTechnician(
      itemId: string,
      data: {
        operatorId: string
        technicianId: string
        quantity: number
        issueId: string
        role: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/inventory/stock/technician/return/${itemId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async installItemToCustomer(data: {
      technicianId: string
      customerId: string
      itemId: string
      quantity: number
      role: string
      installStatus: string
    }): Promise<ApiResponse> {
      return this.request("/inventory/stock/technician/install", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getCustomerInstallations(customerId: string): Promise<any[]> {
      const response = await this.request(`/inventory/stock/customer/${customerId}/installations`)
      return response.data || (response as any[])
    }

    async updateInstallationStatus(installId: string, newStatus: string): Promise<ApiResponse> {
      return this.request(`/inventory/stock/customer/installation/${installId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ newStatus }),
      })
    }

    async getAnalyticsOverview(): Promise<any> {
      return this.request("/analytics/overview")
    }

    async getAnalyticsRevenue(params?: any): Promise<any> {
      return this.request("/analytics/revenue", { method: "GET", params })
    }

    async getAnalyticsOperators(params?: any): Promise<any> {
      return this.request("/analytics/operators", { method: "GET", params })
    }

    async getAnalyticsTechnicians(params?: any): Promise<any> {
      return this.request("/analytics/technicians", { method: "GET", params })
    }

    async getAnalyticsInventory(params?: any): Promise<any> {
      return this.request("/analytics/inventory", { method: "GET", params })
    }

    async getAnalyticsComplaints(params?: any): Promise<any> {
      return this.request("/analytics/complaints", { method: "GET", params })
    }

    async getAnalyticsMarketplace(params?: any): Promise<any> {
      return this.request("/analytics/marketplace", { method: "GET", params })
    }

    async exportAnalyticsReport(data: any): Promise<ApiResponse> {
      return this.request("/analytics/export", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async scheduleAnalyticsReport(data: any): Promise<ApiResponse> {
      return this.request("/analytics/schedule", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getAllProducts(): Promise<any[]> {
      const response = await this.request<any[]>("/inventory/stock/products")
      return response.data || (response as any[])
    }

    async getProduct(id: string): Promise<ApiResponse<any>> {
      try {
        const response = await this.request(`/inventory/stock/products/`, {
          method: "GET",
        })

        return {
          success: true,
          data: response.data || response,
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to fetch product",
        }
      }
    }

    async createProduct(data: any): Promise<ApiResponse> {
      return this.request("/inventory/stock/add", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async updateProduct(id: string, data: any): Promise<ApiResponse<any>> {
      try {
        const response = await this.request(`/inventory/update/stock/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        console.log("Update API raw response:", response)

        return { success: true, data: response }
      } catch (error: any) {
        console.error("Update API error:", error)
        return { success: false, error: error.message || "Update failed" }
      }
    }

    async deleteProduct(id: string): Promise<ApiResponse> {
      return this.request(`/inventory/delete/stock/${id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      })
    }

    async searchProducts(query: string): Promise<any[]> {
      const response = await this.request(`/products/search?q=${encodeURIComponent(query)}`)
      return response.data || (response as any[])
    }

    async getProductsByCategory(category: string): Promise<any[]> {
      const response = await this.request(`/products/category/${category}`)
      return response.data || (response as any[])
    }

    async updateTechnicianProfile(userId: string, data: any): Promise<ApiResponse> {
      return this.request(`/technician/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async getAllTechnicianComplaints(): Promise<any[]> {
      const response = await this.request<any[]>("/technician/complaint/all")
      return response.data || (response as any[])
    }

    async getTechnicianAssignedComplaints(technicianId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/technician/complaint/assign/${technicianId}`)
      return response.data || (response as any[])
    }

    async createTechnicianComplaint(
      customerId: string,
      data: {
        type: string
        priority: string
        description: string
        technicianId: string
        Area: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/technician/complaint/create/${customerId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getTechnicianComplaint(complaintId: string): Promise<any> {
      const response = await this.request(`/technician/complaint/${complaintId}`)
      return response.data || (response as any)
    }

    async updateTechnicianComplaint(
      complaintId: string,
      data: {
        status?: string
        technicianNotes?: string
        priority?: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/technician/complaint/assign/${complaintId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async assignTechnicianToComplaint(
      complaintId: string,
      data: {
        technicianId: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/technician/complaint/assign/${complaintId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteTechnicianComplaint(complaintId: string): Promise<ApiResponse> {
      return this.request(`/technician/complaint/${complaintId}`, {
        method: "DELETE",
      })
    }

    async getCustomerComplaints(customerId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/technician/complaint/profile/${customerId}`)
      return response.data || (response as any[])
    }

    async technicianCheckIn(
      technicianId: string,
      data: {
        at: string
        location: string
        date: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/technician/attendance/checkin/${technicianId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async technicianCheckOut(technicianId: string): Promise<ApiResponse> {
      return this.request(`/technician/attendance/checkout/${technicianId}`, {
        method: "POST",
      })
    }

    async getTechnicianDaySummary(technicianId: string, date: string): Promise<any> {
      const response = await this.request(`/technician/attendance/day/${technicianId}/${date}`)
      return response.data || (response as any)
    }

    async getTechnicianRangeSummary(technicianId: string, from: string, to: string): Promise<any> {
      const response = await this.request(`/technician/attendance/range/${technicianId}?from=${from}&to=${to}`)
      return response.data || (response as any)
    }

    async markTechnicianAttendance(
      technicianId: string,
      data: {
        attendance: Array<{
          date: string
          checkIn: string
          checkOut: string
          location: string
        }>
      },
    ): Promise<ApiResponse> {
      return this.request(`/technician/attendance/mark/${technicianId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getAllTechnicianAttendanceRecords(technicianId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/technician/attendance/${technicianId}`)
      return response.data || (response as any[])
    }

    async createTechnicianLeaveRequest(
      technicianId: string,
      data: {
        leaveType: string
        startDate: string
        endDate: string
        reason: string
        documents?: string[]
      },
    ): Promise<ApiResponse> {
      return this.request(`/technician/leave/requests/${technicianId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getAllTechnicianLeaveRequests(): Promise<any[]> {
      const response = await this.request<any[]>("/technician/leave/requests")
      return response.data || (response as any[])
    }

    async getTechnicianOwnLeaveRequests(technicianId: string): Promise<any[]> {
      const response = await this.request<any[]>(`/technician/leave/requests/my/${technicianId}`)
      return response.data || (response as any[])
    }

    async updateTechnicianLeaveRequest(
      leaveId: string,
      data: {
        leaveType?: string
        startDate?: string
        endDate?: string
        reason?: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/technician/leave/requests/${leaveId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteTechnicianLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/technician/leave/requests/${leaveId}`, {
        method: "DELETE",
      })
    }

    async approveTechnicianLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/technician/leave/requests/${leaveId}/approve`, {
        method: "PUT",
      })
    }

    async rejectTechnicianLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/technician/leave/requests/${leaveId}/reject`, {
        method: "PUT",
      })
    }

    // Operator Profile Management
    async updateOperatorProfile(
      userId: string,
      data: {
        email?: string
        profileDetail?: {
          name?: string
          phone?: string
          companyName?: string
          revenue?: number
          customerCount?: number
          technicianCount?: number
        }
      },
    ): Promise<ApiResponse> {
      return this.request(`/operator/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteOperatorProfile(userId: string): Promise<ApiResponse> {
      return this.request(`/operator/profile/${userId}`, {
        method: "DELETE",
      })
    }

    // Operator Technician Management
    async getOperatorTechnicians(): Promise<User[]> {
      const response = await this.request<User[]>("/operator/technician/all")
      return response.data || (response as User[])
    }

    async registerOperatorTechnician(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
        area: string
        specialization: string
        salary: number
        assignedOperatorId: string
      }
    }): Promise<ApiResponse> {
      return this.request("/operator/technician/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }
    async createCustomer(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
        address: string
        planId: string
        connectionType: string
        monthlyRate: number
      }
    }): Promise<ApiResponse> {
      return this.request("/operator/customer/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getOperatorTechnicianProfile(userId: string): Promise<User> {
      const response = await this.request<User>(`/operator/technician/profile/${userId}`)
      return response.data || (response as User)
    }

    async updateOperatorTechnicianProfile(
      userId: string,
      data: {
        email?: string
        profileDetail?: {
          name?: string
          phone?: string
          area?: string
          specialization?: string
          salary?: number
          assignedOperatorId?: string
        }
      },
    ): Promise<ApiResponse> {
      return this.request(`/operator/technician/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteOperatorTechnician(userId: string): Promise<ApiResponse> {
      return this.request(`/operator/technician/profile/${userId}`, {
        method: "DELETE",
      })
    }

    // Operator Customer Management
    async getOperatorCustomers(): Promise<User[]> {
      const response = await this.request<User[]>("/operator/customer/all")
      return response.data || (response as User[])
    }

    async registerOperatorCustomer(data: {
      email: string
      password: string
      profileDetail: {
        name: string
        phone: string
        address: string
        planId: string
        connectionType: string
        monthlyRate: number
      }
    }): Promise<ApiResponse> {
      return this.request("/operator/customer/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getOperatorCustomerProfile(userId: string): Promise<User> {
      const response = await this.request<User>(`/operator/customer/profile/${userId}`)
      return response.data || (response as User)
    }

    async updateOperatorCustomerProfile(
      userId: string,
      data: {
        email?: string
        profileDetail?: {
          name?: string
          phone?: string
          address?: string
          planId?: string
          monthlyRate?: number
        }
      },
    ): Promise<ApiResponse> {
      return this.request(`/operator/customer/profile/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteOperatorCustomer(userId: string): Promise<ApiResponse> {
      return this.request(`/operator/customer/${userId}`, {
        method: "DELETE",
      })
    }

    // Operator Complaint Management
    async getOperatorComplaints(): Promise<Complaint[]> {
      const response = await this.request<Complaint[]>("/operator/complaint/all")
      return response.data || (response as Complaint[])
    }

    async getOperatorComplaintsByTechnician(technicianId: string): Promise<Complaint[]> {
      const response = await this.request<Complaint[]>(`/operator/complaint/assign/${technicianId}`)
      return response.data || (response as Complaint[])
    }

    async createOperatorComplaint(
      customerId: string,
      data: {
        type: string
        priority: "low" | "medium" | "high"
        description: string
        technicianId: string
        Area: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/operator/complaint/create/${customerId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getOperatorComplaint(complaintId: string): Promise<Complaint> {
      const response = await this.request<Complaint>(`/operator/complaint/${complaintId}`)
      return response.data || (response as Complaint)
    }

    async updateOperatorComplaint(
      complaintId: string,
      data: {
        status?: string
        technicianNotes?: string
        priority?: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/operator/complaint/${complaintId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async assignOperatorComplaintTechnician(
      complaintId: string,
      data: {
        technicianId: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/operator/complaint/assign/${complaintId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteOperatorComplaint(complaintId: string): Promise<ApiResponse> {
      return this.request(`/operator/complaint/${complaintId}`, {
        method: "DELETE",
      })
    }

    async getOperatorCustomerComplaints(customerId: string): Promise<Complaint[]> {
      const response = await this.request<Complaint[]>(`/operator/complaint/profile/${customerId}`)
      return response.data || (response as Complaint[])
    }

    // Operator Leave Management
    async createOperatorLeaveRequest(
      technicianId: string,
      data: {
        leaveType: string
        startDate: string
        endDate: string
        reason: string
        documents?: string[]
      },
    ): Promise<ApiResponse> {
      return this.request(`/operator/Leave/requests/${technicianId}`, {
        method: "POST",
        body: JSON.stringify(data),
      })
    }

    async getOperatorLeaveRequests(): Promise<LeaveRequest[]> {
      const response = await this.request<LeaveRequest[]>("/operator/Leave/requests")
      return response.data || (response as LeaveRequest[])
    }

    async getOperatorTechnicianLeaveRequests(technicianId: string): Promise<LeaveRequest[]> {
      const response = await this.request<LeaveRequest[]>(`/operator/Leave/requests/my/${technicianId}`)
      return response.data || (response as LeaveRequest[])
    }

    async updateOperatorLeaveRequest(
      leaveId: string,
      data: {
        leaveType?: string
        startDate?: string
        endDate?: string
        reason?: string
      },
    ): Promise<ApiResponse> {
      return this.request(`/operator/Leave/requests/${leaveId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }

    async deleteOperatorLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/operator/Leave/requests/${leaveId}`, {
        method: "DELETE",
      })
    }

    async approveOperatorLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/operator/Leave/requests/${leaveId}/approve`, {
        method: "PUT",
      })
    }

    async rejectOperatorLeaveRequest(leaveId: string): Promise<ApiResponse> {
      return this.request(`/operator/Leave/requests/${leaveId}/reject`, {
        method: "PUT",
      })
    }

    async confirmAction(message: string): Promise<boolean> {
      return new Promise((resolve) => {
        const confirmed = window.confirm(message)
        resolve(confirmed)
      })
    }
    isTokenValid(): boolean {
      if (!this.token) return false

      try {
        // Basic JWT token validation (check if it's not expired)
        const payload = JSON.parse(atob(this.token.split(".")[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        return payload.exp > currentTime
      } catch {
        return false
      }
    }
    async createTask(userId: string, taskData: Omit<Task, 'taskId' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse> {
      return this.request(`/task/add/${userId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
    }

    // 2. Get All Tasks
    async getAllTasks(filters?: TaskFilters): Promise<ApiResponse> {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/tasks?${queryString}` : '/api/tasks';
      
      return this.request(url, {
        method: "GET",
      });
    }

    // 3. Get Tasks Assigned to User
    async getAssignedTasks(userId: string): Promise<ApiResponse> {
      return this.request(`/tasks/assigned/${userId}`, {
        method: "GET",
      });
    }

    // 4. Get Tasks Created by User
    async getCreatedTasks(userId: string): Promise<ApiResponse> {
      return this.request(`/tasks/created/${userId}`, {
        method: "GET",
      });
    }

    // 5. Get Single Task
    async getTask(taskId: string): Promise<ApiResponse> {
      return this.request(`/tasks/${taskId}`, {
        method: "GET",
      });
    }

    // 6. Update Task
    async updateTask(taskId: string, taskData: Partial<Omit<Task, 'taskId' | 'createdBy' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse> {
      return this.request(`/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
    }

    // 7. Delete Task
    async deleteTask(taskId: string): Promise<ApiResponse> {
      return this.request(`/tasks/${taskId}`, {
        method: "DELETE",
      });
    }

    // 8. Assign Task to User
    async assignTask(taskId: string, assignTo: string): Promise<ApiResponse> {
      return this.request(`/tasks/${taskId}/assign`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignTo }),
      });
    }

    // 9. Update Task Status
    async updateTaskStatus(taskId: string, status: Task['status']): Promise<ApiResponse> {
      return this.request(`/tasks/${taskId}/status`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
    }

    // 10. Get Task Statistics
    async getTaskStatistics(): Promise<ApiResponse> {
      return this.request(`/api/tasks/stats/summary`, {
        method: "GET",
      });
    }

    // 11. Get Task Logs
    async getTaskLogs(taskId: string, filters?: Pick<LogFilters, 'limit' | 'operation'>): Promise<ApiResponse> {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value.toString());
        });
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/api/tasks/${taskId}/logs?${queryString}` : `/api/tasks/${taskId}/logs`;
      
      return this.request(url, {
        method: "GET",
      });
    }

    // 12. Get All System Logs
    async getAllSystemLogs(filters?: LogFilters): Promise<ApiResponse> {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value.toString());
        });
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/api/task/logs?${queryString}` : '/api/task/logs';
      
      return this.request(url, {
        method: "GET",
      });
    }
  }



  const apiClient = new ApiClient(API_BASE_URL)

  export const operatorApi = {
    getAll: () => apiClient.getAllOperators(),
    // Profile
    getProfile: (id: string) => apiClient.getOperatorProfile(id),
    updateProfile: (id: string, data: any) => apiClient.updateOperatorProfile(id, data),
    deleteProfile: (id: string) => apiClient.deleteOperatorProfile(id),

    // Operator 
    addoperators: (data: any) => apiClient.addOperator(data),

    // Technicians
    getTechnicians: () => apiClient.getOperatorTechnicians(),
    registerTechnician: (data: any) => apiClient.registerOperatorTechnician(data),
    getTechnicianProfile: (id: string) => apiClient.getOperatorTechnicianProfile(id),
    updateTechnicianProfile: (id: string, data: any) => apiClient.updateOperatorTechnicianProfile(id, data),
    deleteTechnician: (id: string) => apiClient.deleteOperatorTechnician(id),

    // Customers
    createCustomer: (data: any) => apiClient.createCustomer(data),
    getAlloperator: () => apiClient.getOperatorCustomers(),
    getCustomers: () => apiClient.getOperatorCustomers(),
    registerCustomer: (data: any) => apiClient.registerOperatorCustomer(data),
    getCustomerProfile: (id: string) => apiClient.getOperatorCustomerProfile(id),
    updateCustomerProfile: (id: string, data: any) => apiClient.updateOperatorCustomerProfile(id, data),
    deleteCustomer: (id: string) => apiClient.deleteOperatorCustomer(id),

    // Complaints
    getComplaints: () => apiClient.getOperatorComplaints(),
    getComplaintsByTechnician: (techId: string) => apiClient.getOperatorComplaintsByTechnician(techId),
    createComplaint: (customerId: string, data: any) => apiClient.createOperatorComplaint(customerId, data),
    getComplaint: (id: string) => apiClient.getOperatorComplaint(id),
    updateComplaint: (id: string, data: any) => apiClient.updateOperatorComplaint(id, data),
    assignComplaintTechnician: (id: string, data: any) => apiClient.assignOperatorComplaintTechnician(id, data),
    deleteComplaint: (id: string) => apiClient.deleteOperatorComplaint(id),
    getCustomerComplaints: (customerId: string) => apiClient.getOperatorCustomerComplaints(customerId),

    // Leave Management
    createLeaveRequest: (techId: string, data: any) => apiClient.createOperatorLeaveRequest(techId, data),
    getLeaveRequests: () => apiClient.getOperatorLeaveRequests(),
    getTechnicianLeaveRequests: (techId: string) => apiClient.getOperatorTechnicianLeaveRequests(techId),
    updateLeaveRequest: (id: string, data: any) => apiClient.updateOperatorLeaveRequest(id, data),
    deleteLeaveRequest: (id: string) => apiClient.deleteOperatorLeaveRequest(id),
    approveLeaveRequest: (id: string) => apiClient.approveOperatorLeaveRequest(id),
    rejectLeaveRequest: (id: string) => apiClient.rejectOperatorLeaveRequest(id),
  }
  export const taskApi = {
    // Task Management
    create: (userId: string, taskData: Omit<Task, 'taskId' | 'createdBy' | 'createdAt' | 'updatedAt'>) => 
      apiClient.createTask(userId, taskData),
    
    getAll: (filters?: TaskFilters) => 
      apiClient.getAllTasks(filters),
    
    getAssigned: (userId: string) => 
      apiClient.getAssignedTasks(userId),
    
    getCreated: (userId: string) => 
      apiClient.getCreatedTasks(userId),
    
    getById: (taskId: string) => 
      apiClient.getTask(taskId),
    
    update: (taskId: string, taskData: Partial<Omit<Task, 'taskId' | 'createdBy' | 'createdAt' | 'updatedAt'>>) => 
      apiClient.updateTask(taskId, taskData),
    
    delete: (taskId: string) => 
      apiClient.deleteTask(taskId),
    
    assign: (taskId: string, assignTo: string) => 
      apiClient.assignTask(taskId, assignTo),
    
    updateStatus: (taskId: string, status: Task['status']) => 
      apiClient.updateTaskStatus(taskId, status),
    
    getStats: () => 
      apiClient.getTaskStatistics(),
    
    // Logging
    getLogs: (taskId: string, filters?: Pick<LogFilters, 'limit' | 'operation'>) => 
      apiClient.getTaskLogs(taskId, filters),
    
    getAllLogs: (filters?: LogFilters) => 
      apiClient.getAllSystemLogs(filters),
  }


  export const technicianApi = {
    // Profile

    getProfile: (id: string) => apiClient.getTechnicianProfile(id),
    updateProfile: (id: string, data: any) => apiClient.updateTechnicianProfile(id, data),

    // Complaints
    getAllComplaints: () => apiClient.getAllTechnicianComplaints(),
    getAssignedComplaints: (techId: string) => apiClient.getTechnicianAssignedComplaints(techId),
    createComplaint: (customerId: string, data: any) => apiClient.createTechnicianComplaint(customerId, data),
    getComplaint: (id: string) => apiClient.getTechnicianComplaint(id),
    updateComplaint: (id: string, data: any) => apiClient.updateTechnicianComplaint(id, data),
    assignComplaint: (id: string, data: any) => apiClient.assignTechnicianToComplaint(id, data),
    deleteComplaint: (id: string) => apiClient.deleteTechnicianComplaint(id),
    getCustomerComplaints: (customerId: string) => apiClient.getCustomerComplaints(customerId),

    // Attendance
    checkIn: (techId: string, data: any) => apiClient.technicianCheckIn(techId, data),
    checkOut: (techId: string) => apiClient.technicianCheckOut(techId),
    getDaySummary: (techId: string, date: string) => apiClient.getTechnicianDaySummary(techId, date),
    getRangeSummary: (techId: string, from: string, to: string) => apiClient.getTechnicianRangeSummary(techId, from, to),
    markAttendance: (techId: string, data: any) => apiClient.markTechnicianAttendance(techId, data),
    getAllAttendanceRecords: (techId: string) => apiClient.getAllTechnicianAttendanceRecords(techId),

    // Leave Management
    createLeaveRequest: (techId: string, data: any) => apiClient.createTechnicianLeaveRequest(techId, data),
    getAllLeaveRequests: () => apiClient.getAllTechnicianLeaveRequests(),
    getOwnLeaveRequests: (techId: string) => apiClient.getTechnicianOwnLeaveRequests(techId),
    updateLeaveRequest: (id: string, data: any) => apiClient.updateTechnicianLeaveRequest(id, data),
    deleteLeaveRequest: (id: string) => apiClient.deleteTechnicianLeaveRequest(id),
    approveLeaveRequest: (id: string) => apiClient.approveTechnicianLeaveRequest(id),
    rejectLeaveRequest: (id: string) => apiClient.rejectTechnicianLeaveRequest(id),
  }

  export const inventoryApi = {
    getalltechnician: () => apiClient.getAllTechnicians(),
    // Stock Management
    getAllStockProducts: () => apiClient.getAllStockProducts(),
    getAllProducts: () => apiClient.getAllStockProducts(),
    addProduct: (data: any) => apiClient.addStockItem(data),
    updateProduct: (id: string, data: any) => apiClient.updateStockItem(id, data),
    deleteProduct: (id: string, role: string) => apiClient.deleteStockItem(id, role),

    // Stock Issuance
    issueToOperator: (data: any) => apiClient.issueStockToOperator(data),
    getAllIssuancess: () => apiClient.getAllIssuances(),
    getIssuance: (id: string) => apiClient.getSpecificIssuance(id),
    updateIssuanceStatus: (id: string, status: string) => apiClient.updateIssuanceStatus(id, status),
    getOperatorIssuances: (operatorId: string) => apiClient.getOperatorIssuances(operatorId),

    // Technician Stock
    assignToTechnician: (data: any) => apiClient.assignStockToTechnicianNew(data),
    getTechnicianStock: (techId: string) => apiClient.getTechnicianStock(techId),
    returnFromTechnician: (itemId: string, data: any) => apiClient.returnStockFromTechnician(itemId, data),

    // Customer Installation
    installToCustomer: (data: any) => apiClient.installItemToCustomer(data),
    getCustomerInstallations: () => apiClient.getCustomerInstallations(),
    updateInstallationStatus: (installId: string, status: string) =>
      apiClient.updateInstallationStatus(installId, status),
    confirmInstallation: (itemId: string) => apiClient.confirmInstallation(itemId),

    // Stock Movements
    getStockMovements: () => apiClient.getStockMovements(),
  }

  export const authApi = {
    login: (email: string, password: string) => apiClient.login(email, password),
    registerAdmin: (data: any) => apiClient.registerAdmin(data),
  }

  export const adminApi = {
    getAll: () => apiClient.getAllAdmins(),
    add: (data: any) => apiClient.addAdmin(data),
    get: (id: string) => apiClient.getAdmin(id),
    update: (id: string, data: any) => apiClient.updateAdmin(id, data),
    delete: (id: string) => apiClient.deleteAdmin(id),
  }

  export const staffApi = {
    getAll: () => apiClient.getAllStaff(),
    add: (data: any) => apiClient.addStaff(data),
    get: (id: string) => apiClient.getStaff(id),
    update: (id: string, data: any) => apiClient.updateStaff(id, data),
    delete: (id: string) => apiClient.deleteStaff(id),
    getProfile: (id: string) => apiClient.getStaffProfile(id),
  }

  export const admintechnicianApi = {
    getAll: () => apiClient.getAllTechnicians(),
    add: (data: any) => apiClient.addTechnician(data),
    get: (id: string) => apiClient.getTechnician(id),
    update: (id: string, data: any) => apiClient.updateTechnician(id, data),
    delete: (id: string) => apiClient.deleteTechnician(id),
    getProfile: (id: string) => apiClient.getTechnicianProfile(id),
  }


  export const vendorApi = {
    getAll: () => apiClient.getAllVendors(),  // only admin can access
    add: (data: any) => apiClient.addVendor(data), /// only admin can access
    get: (id: string) => apiClient.getVendor(id), /// only admin can access
    update: (id: string, data: any) => apiClient.updateVendor(id, data), // only admin can access
    delete: (id: string) => apiClient.deleteVendor(id), // only admin can access
    getProfile: (id: string) => apiClient.getVendorProfile(id),
    getProducts: (id: string) => apiClient.getVendorProducts(id),
    addProduct: (data: any) => apiClient.addVendorProduct(data),
    updateProduct: (id: string, data: any) => apiClient.updateVendorProduct(id, data),
    deleteProduct: (id: string) => apiClient.deleteVendorProduct(id),
    getOrders: (id: string) => apiClient.getVendorOrders(id),
    updateOrderStatus: (orderId: string, status: string, trackingId?: string) =>
      apiClient.updateOrderStatusVendor(orderId, status, trackingId),
  }

  export const customerApi = {
    getAll: () => apiClient.getAllCustomers(),
    add: (data: any) => apiClient.addCustomer(data),
    get: (id: string) => apiClient.getCustomer(id),
    update: (id: string, data: any) => apiClient.updateCustomer(id, data),
    updatePlan: (id: string, data: any) => apiClient.updateCustomerPlan(id, data),
    delete: (id: string) => apiClient.deleteCustomer(id),
    getProfile: (id: string) => apiClient.getCustomerProfile(id),
  }

  export const complaintApi = {
    getAll: () => apiClient.getAllComplaints(),
    getById: (id: string) => apiClient.getComplaintsById(id),

    add: (data: any) => apiClient.addComplaint(data),
    rise: (id: string, data: any) => apiClient.riseComplaint(id, data),
    changestatus: (id: string, data: any) => apiClient.changecomplaintstatus(id, data),
    update: (id: string, data: any) => apiClient.updateComplaint(id, data),
    delete: (id: string) => apiClient.deleteComplaint(id),
  }

  export const vendorProductApi = {
    getAll: (id: string) => apiClient.getVendorProducts(id),
    add: (data: any) => apiClient.addVendorProduct(data),
    update: (id: string, data: any) => apiClient.updateVendorProduct(id, data),
    delete: (id: string) => apiClient.deleteVendorProduct(id),
  }

  export const vendorOrderApi = {
    getAll: (id: string) => apiClient.getVendorOrders(id),
    updateStatus: (orderId: string, status: string, trackingId?: string) =>
      apiClient.updateOrderStatusVendor(orderId, status, trackingId),
  }

  export const marketplaceApi = {
    getProducts: () => apiClient.getMarketplaceProducts(),
    createOrder: (data: any) => apiClient.createMarketplaceOrder(data),
    getOrders: () => apiClient.getMarketplaceOrders(),
    updateOrder: (orderId: string, data: any) => apiClient.updateMarketplaceOrder(orderId, data),
  }

  export const notificationApi = {
    getAll: (userId: string) => apiClient.getNotifications(userId),
    markRead: (id: string) => apiClient.markNotificationRead(id),
    send: (data: any) => apiClient.sendNotification(data),
  }

  export const billingApi = {
    getHistory: (customerId: string) => apiClient.getBillingHistory(customerId),
    generateInvoice: (customerId: string, data: any) => apiClient.generateInvoice(customerId, data),
    processPayment: (data: any) => apiClient.processPayment(data),
  }

  export const orderApi = {
    create: (data: any) => apiClient.createOrder(data),
    getAll: () => apiClient.getAllOrders(),
    getSingle: (orderId: string) => apiClient.getOrder(orderId),
    update: (orderId: string, data: any) => apiClient.updateOrder(orderId, data),
    delete: (orderId: string) => apiClient.deleteOrder(orderId),
    place: (data: any) => apiClient.placeOrder(data),
    updateStatus: (orderId: string, data: any) => apiClient.updateOrderStatus(orderId, data),
  }

  export const analyticsApi = {
    getOverview: () => apiClient.getAnalyticsOverview(),
    getRevenue: (params?: any) => apiClient.getAnalyticsRevenue(params),
    getOperators: (params?: any) => apiClient.getAnalyticsOperators(params),
    getTechnicians: (params?: any) => apiClient.getAnalyticsTechnicians(params),
    getInventory: (params?: any) => apiClient.getAnalyticsInventory(params),
    getComplaints: (params?: any) => apiClient.getAnalyticsComplaints(params),
    getMarketplace: (params?: any) => apiClient.getAnalyticsMarketplace(params),
    exportReport: (data: any) => apiClient.exportAnalyticsReport(data),
    scheduleReport: (data: any) => apiClient.scheduleAnalyticsReport(data),
  }

  export const productApi = {
    getAll: () => apiClient.getMarketplaceProducts(),
    add: (data: any) => apiClient.addMarketplaceProduct(data),
    get: (id: string) => apiClient.getProduct(id),
    create: (data: any) => apiClient.createProduct(data), // This should be used instead of "add"
    update: (id: string, data: any) => apiClient.updateProduct(id, data),
    delete: (id: string) => apiClient.deleteProduct(id),
    search: (query: string) => apiClient.searchProducts(query),
    getByCategory: (category: string) => apiClient.getProductsByCategory(category),
  }

  export const leaveApi = {
    create: (technicianId: string, data: any) => apiClient.createLeaveRequest(technicianId, data),
    getAll: () => apiClient.getAllLeaveRequests(),
    getTechnicianRequests: (technicianId: string) => apiClient.getTechnicianLeaveRequests(technicianId),
    update: (leaveId: string, data: any) => apiClient.updateLeaveRequest(leaveId, data),
    approve: (leaveId: string) => apiClient.approveLeaveRequest(leaveId),
    reject: (leaveId: string) => apiClient.rejectLeaveRequest(leaveId),
    delete: (leaveId: string) => apiClient.deleteLeaveRequest(leaveId),
  }

  export const returnApi = {
    getAll: () => apiClient.getAllReturns?.() || Promise.resolve([]),
    create: (data: any) => apiClient.createReturn?.(data) || Promise.resolve({}),
    update: (id: string, data: any) => apiClient.updateReturn?.(id, data) || Promise.resolve({}),
    approve: (id: string) => apiClient.approveReturn?.(id) || Promise.resolve({}),
    reject: (id: string) => apiClient.rejectReturn?.(id) || Promise.resolve({}),
    complete: (id: string) => apiClient.completeReturn?.(id) || Promise.resolve({}),
    delete: (id: string) => apiClient.deleteReturn?.(id) || Promise.resolve({}),
  }

  export const shippingApi = {
    getAll: () => apiClient.getAllShipments?.() || Promise.resolve([]),
    create: (data: any) => apiClient.createShipment?.(data) || Promise.resolve({}),
    update: (id: string, data: any) => apiClient.updateShipment?.(id, data) || Promise.resolve({}),
    updateStatus: (id: string, status: string) => apiClient.updateShipmentStatus?.(id, status) || Promise.resolve({}),
    track: (trackingNumber: string) => apiClient.trackShipment?.(trackingNumber) || Promise.resolve({}),
    delete: (id: string) => apiClient.deleteShipment?.(id) || Promise.resolve({}),
  }

  export default apiClient

  export { apiClient }
  export const api = {
    // Admin APIs
    getOperators: () => apiClient.getAllOperators(),
    getOperator: (id: string) => apiClient.getOperator(id),
    updateOperator: (id: string, data: any) => apiClient.updateOperator(id, data),
    deleteOperator: (id: string) => apiClient.deleteOperator(id),

    getStaff: () => staffApi.getAll(),
    getPlans: () => apiClient.getAllPlans(),
    getAnalytics: () => analyticsApi.getOverview(),
    getBilling: () => apiClient.getAllBilling(),

    // Re-export all existing APIs for backward compatibility
    ...operatorApi,
    ...technicianApi,
    ...inventoryApi,
    ...authApi,
    ...adminApi,
    ...staffApi,
    ...taskApi,
    ...vendorApi,
    ...admintechnicianApi,
    ...customerApi,
    ...complaintApi,
    ...marketplaceApi,
    ...notificationApi,
    ...billingApi,
    ...orderApi,
    ...analyticsApi,
    ...productApi,
    ...leaveApi,
  }
