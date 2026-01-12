// lib/analytics-api.ts

const API_BASE_URL = "https://nsbackend-l5wc.vercel.app/api"

export interface AnalyticsResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Admin Analytics Types
export interface AdminMetrics {
  system: {
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    userRetention: string
    userGrowth: number
    activeRoles: {
      operators: number
      technicians: number
      staff: number
      vendors: number
      customers: number
    }
  }
  revenue: {
    totalRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
    averageRevenuePerUser: string
    revenueByOperator: Array<{
      operatorId: string
      operatorName: string
      totalCustomers: number
      activeCustomers: number
      revenue: number
      percentageOfTotal: string
      customerGrowth: number
      trend: string
      subscriptionCount: number
      averageRevenuePerCustomer: string
    }>
    revenueByPlan: Array<{
      planId: string
      planName: string
      planType: string
      price: number
      subscriptionCount: number
      activeSubscriptions: number
      revenue: number
      percentageOfTotal: string
    }>
  }
  customers: {
    totalCustomers: number
    activeCustomers: number
    inactiveCustomers: number
    newCustomersThisMonth: number
    churnRate: string
    customerGrowth: number
    customersByOperator: Array<{
      operatorId: string
      operatorName: string
      customerCount: number
      activeCustomers: number
    }>
  }
  orders: {
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
    orderFulfillmentRate: string
    totalOrderValue: number
    averageOrderValue: string
    orderGrowth: number
    ordersByStatus: {
      completed: number
      pending: number
      cancelled: number
      processing: number
    }
  }
  tasks: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    overdueTasks: number
    taskCompletionRate: string
    tasksByType: {
      installation: number
      maintenance: number
      support: number
      complaint: number
    }
    tasksByPriority: {
      high: number
      medium: number
      low: number
    }
    tasksByStatus: {
      completed: number
      pending: number
      in_progress: number
      overdue: number
    }
  }
  attendance: {
    totalWorkingDays: number
    presentDays: number
    absentDays: number
    halfDays: number
    leaveDays: number
    attendanceRate: string
    attendanceByRole: {
      operators: number
      technicians: number
      staff: number
    }
    leaveRequests: {
      total: number
      approved: number
      pending: number
      rejected: number
    }
  }
  plans: {
    totalPlans: number
    activePlans: number
    inactivePlans: number
    plansByType: {
      basic: number
      standard: number
      premium: number
    }
  }
  subscriptions: {
    totalSubscriptions: number
    activeSubscriptions: number
    expiredSubscriptions: number
    suspendedSubscriptions: number
    subscriptionRate: string
    subscriptionsByPlan: Array<{
      planId: string
      planName: string
      planType: string
      price: number
      subscriptionCount: number
      activeSubscriptions: number
      revenue: number
      percentageOfTotal: string
    }>
    subscriptionGrowth: number
  }
  complaints: {
    totalComplaints: number
    openComplaints: number
    resolvedComplaints: number
    inProgressComplaints: number
    resolutionRate: string
    averageResolutionTime: string
    complaintsByCategory: {
      billing: number
      technical: number
      service: number
      network: number
      equipment: number
    }
    complaintsByPriority: {
      high: number
      medium: number
      low: number
    }
  }
  operational: {
    equipmentHealth: {
      totalEquipment: number
      activeEquipment: number
      faultyEquipment: number
      maintenanceRequired: number
      equipmentUtilization: string
      inventoryValue: number
    }
    installations: {
      total: number
      completed: number
      pending: number
      cancelled: number
      successRate: string
    }
    onboarding: {
      total: number
      completed: number
      pending: number
      successRate: string
    }
  }
}

export interface AdminCharts {
  revenueTimeline: Array<{ date: string; value: number; count: number }>
  customerGrowth: Array<{ date: string; value: number; count: number }>
  orderTimeline: Array<{ date: string; value: number; count: number }>
  taskTimeline: Array<{ date: string; value: number; count: number }>
  complaintTrends: Array<{ date: string; value: number; count: number }>
  subscriptionTrends: Array<{ date: string; value: number; count: number }>
  operatorPerformance: Array<any>
  attendanceTrend: Array<any>
}

// Operator Analytics Types
export interface OperatorMetrics {
  customers: {
    totalCustomers: number
    activeCustomers: number
    inactiveCustomers: number
    newCustomersThisMonth: number
    churnRate: string
    customerGrowth: number
    customersAtRisk: number
    customersByPlan: Array<{
      planId: string
      planName: string
      customerCount: number
    }>
    customerSatisfactionScore: number
  }
  revenue: {
    totalRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
    averageRevenuePerCustomer: string
    pendingPayments: number
    paymentCollectionRate: string
    outstandingAmount: number
    revenueByPlan: Array<{
      planId: string
      planName: string
      subscriptionCount: number
      activeSubscriptions: number
      revenue: number
    }>
  }
  service: {
    totalInstallations: number
    completedInstallations: number
    pendingInstallations: number
    cancelledInstallations: number
    installationSuccessRate: string
    averageInstallationTime: number
    totalUpgrades: number
    totalDowngrades: number
  }
  tasks: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    taskCompletionRate: string
    tasksByType: {
      installation: number
      maintenance: number
      support: number
      complaint: number
    }
    tasksByPriority: {
      high: number
      medium: number
      low: number
    }
  }
  equipment: {
    totalEquipment: number
    activeEquipment: number
    faultyEquipment: number
    maintenanceRequired: number
    failureRate: string
    inventoryValue: number
  }
  complaints: {
    totalComplaints: number
    openComplaints: number
    resolvedComplaints: number
    inProgressComplaints: number
    resolutionRate: string
    averageResolutionTime: string
    complaintsByCategory: {
      billing: number
      technical: number
      service: number
      network: number
    }
    complaintGrowth: number
  }
  subscriptions: {
    totalSubscriptions: number
    activeSubscriptions: number
    expiredSubscriptions: number
    suspendedSubscriptions: number
    subscriptionsByPlan: Array<any>
    subscriptionGrowth: number
  }
}

// Technician Analytics Types
export interface TechnicianMetrics {
  jobs: {
    totalJobs: number
    completedJobs: number
    pendingJobs: number
    inProgressJobs: number
    cancelledJobs: number
    jobCompletionRate: string
    averageJobTime: string
    averageJobRating: string
    jobsByType: {
      installation: number
      maintenance: number
      troubleshooting: number
      support: number
    }
    jobsByStatus: {
      completed: number
      pending: number
      in_progress: number
      cancelled: number
    }
    jobGrowth: number
  }
  performance: {
    performanceScore: string
    customerSatisfactionRating: string
    totalRatings: number
    ratingDistribution: {
      five_star: number
      four_star: number
      three_star: number
      two_star: number
      one_star: number
    }
    positiveReviews: number
    negativeReviews: number
    reviewRate: string
  }
  collections: {
    totalCollected: number
    averageCollectionPerJob: string
    failedCollections: number
    successfulCollections: number
    collectionRate: string
    collectionGrowth: number
  }
  attendance: {
    totalWorkingDays: number
    presentDays: number
    absentDays: number
    halfDays: number
    attendanceRate: string
    averageWorkingHours: string
    lateArrivals: number
    earlyDepartures: number
  }
  installations: {
    totalInstallations: number
    completedInstallations: number
    pendingInstallations: number
    installationSuccessRate: string
    averageInstallationTime: number
  }
  complaints: {
    totalComplaints: number
    resolvedComplaints: number
    pendingComplaints: number
  }
}

// Vendor Analytics Types
export interface VendorMetrics {
  orders: {
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
    orderFulfillmentRate: string
    averageOrderValue: number
    totalOrderValue: number
    ordersByStatus: {
      completed: number
      pending: number
      processing: number
      cancelled: number
      delivered: number
    }
    orderGrowth: number
  }
  revenue: {
    totalRevenue: number
    grossProfit: number
    netProfit: number
    profitMargin: string
    revenueGrowth: number
    averageProfitPerOrder: string
    commissionEarned: number
    commissionPercentage: number
  }
  inventory: {
    totalProducts: number
    totalQuantity: number
    outOfStockProducts: number
    lowStockProducts: number
    inventoryTurnoverRate: string
    inventoryValue: number
    slowMovingItems: number
  }
  products: {
    topSellingProducts: Array<{
      productId: string
      productName: string
      quantity: number
      revenue: number
    }>
    averageProductRating: string
    productsAbove4Stars: number
    productsBelow3Stars: number
    totalProductsSold: number
  }
  customers: {
    totalCustomers: number
    repeatCustomers: number
    repeatPurchaseRate: string
    newCustomersThisMonth: number
    customerRetentionRate: string
  }
  shipping: {
    totalShipments: number
    onTimeDeliveries: number
    onTimeDeliveryRate: string
    averageDeliveryTime: string
    returnRate: string
    damageClaims: number
  }
  ratings: {
    vendorRating: string
    totalReviews: number
    ratingDistribution: {
      five_star: number
      four_star: number
      three_star: number
      two_star: number
      one_star: number
    }
  }
}

// Staff Analytics Types
export interface StaffMetrics {
  onboarding: {
    totalOnboardings: number
    completedOnboardings: number
    pendingOnboardings: number
    cancelledOnboardings: number
    onboardingSuccessRate: string
    averageOnboardingTime: string
    customerSatisfactionScore: string
    onboardingGrowth: number
  }
  leads: {
    totalLeads: number
    convertedLeads: number
    conversionRate: string
    avgLeadValue: string
    leadsThisMonth: number
    leadsBySource: {
      phone: number
      email: number
      referral: number
      website: number
      walk_in: number
    }
    leadGrowth: number
  }
  calls: {
    totalCalls: number
    incomingCalls: number
    outgoingCalls: number
    averageCallDuration: string
    totalCallMinutes: string
    callAnswerRate: string
  }
  tickets: {
    totalTickets: number
    resolvedTickets: number
    pendingTickets: number
    ticketResolutionRate: string
    averageResolutionTime: string
    customerSatisfactionRating: string
  }
  performance: {
    performanceScore: string
    targetAchievement: number
    bonusEligible: boolean
    incentivesEarned: number
  }
  attendance: {
    totalWorkingDays: number
    presentDays: number
    absentDays: number
    attendanceRate: string
    leavesUtilized: number
  }
  follow_up: {
    totalFollowUps: number
    completedFollowUps: number
    pendingFollowUps: number
    followUpCompletionRate: string
    averageFollowUpTime: number
  }
}

// Customer Analytics Types
export interface CustomerMetrics {
  account: {
    accountStatus: string
    accountAge: number
    customerId: string
    connectionType: string
    operator: string
  }
  plan: {
    currentPlan: string
    planPrice: number
    planSpeed: string
    dataLimit: number
    planStatus: string
    startDate: string
    endDate: string
    daysRemaining: number
    upgrades: number
    downgrades: number
  }
  usage: {
    usagePercentage: string
    dataUsed: string
    dataRemaining: string
    peakUsageHours: string
    averageDailyUsage: string
    averageNightlyUsage: string
    bandwidthSpeed: string
    averageLatency: string
    jitterScore: string
    packetLossPercentage: string
    totalDataUsed?: number
    usageTrend?: Array<{ date: string; used: number }>
  }
  billing: {
    monthlyBill: number
    totalPaid: number
    dueAmount: number
    lastPaymentDate: string
    nextBillingDate: string
    paymentStatus: string
    pendingInvoices: number
    latePayments: number
    averagePaymentDelay: number
  }
  payments?: {
    monthlyBillAmount: number
    totalPaid: number
    totalPending: number
    nextBillingDate?: string
    paymentHistory?: Array<{ date: string; amount: number; status: string }>
  }
  service: {
    serviceUptime: number
    outageIncidents: number
    averageOutageDuration: string
    maintenanceNotices: number
    lastMaintenanceDate: string
    currentPlan?: string
    planSince?: string
    speedTestResults?: {
      download: number
      upload: number
      ping: number
    }
  }
  support: {
    totalTickets: number
    openTickets: number
    resolvedTickets: number
    ticketResolutionRate: string
    averageResolutionTime: string
    satisfactionRating: string
  }
  referral: {
    referralsGenerated: number
    referralsConverted: number
    referralRewards: number
    referralStatus: string
  }
  loyalty: {
    accountLifetimeValue: number
    loyaltyPoints: number
    membershipTier: string
    nextTierRequirement: number
  }
}

class AnalyticsClient {
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
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<AnalyticsResponse<T>> {
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
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Analytics API Error:", error)
      throw error
    }
  }

  // Admin Analytics
  async getAdminAnalytics(
    period = "30d",
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsResponse<{ metrics: AdminMetrics; charts: AdminCharts; summary: any }>> {
    const params = new URLSearchParams({ period, ...(startDate && { startDate }), ...(endDate && { endDate }) })
    return this.request(`/admin/analytics/dashboard?${params.toString()}`)
  }

  // Operator Analytics
  async getOperatorAnalytics(
    operatorId: string,
    period = "30d",
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsResponse<{ metrics: OperatorMetrics; charts: any; summary: any }>> {
    const params = new URLSearchParams({
      operatorId,
      period,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })
    return this.request(`/operator/analytics/dashboard?${params.toString()}`)
  }

  // Technician Analytics
  async getTechnicianAnalytics(
    technicianId: string,
    period = "30d",
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsResponse<{ metrics: TechnicianMetrics; charts: any; summary: any }>> {
    const params = new URLSearchParams({
      technicianId,
      period,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })
    return this.request(`/technician/analytics/dashboard?${params.toString()}`)
  }

  // Vendor Analytics
  async getVendorAnalytics(
    vendorId: string,
    period = "30d",
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsResponse<{ metrics: VendorMetrics; charts: any; summary: any }>> {
    const params = new URLSearchParams({
      vendorId,
      period,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })
    return this.request(`/vendor/analytics/dashboard?${params.toString()}`)
  }

  // Staff Analytics
  async getStaffAnalytics(
    staffId: string,
    period = "30d",
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsResponse<{ metrics: StaffMetrics; charts: any; summary: any }>> {
    const params = new URLSearchParams({
      staffId,
      period,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })
    return this.request(`/staff/analytics/dashboard?${params.toString()}`)
  }

  // Customer Analytics
  async getCustomerAnalytics(
    customerId: string,
    period = "30d",
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsResponse<{ metrics: CustomerMetrics; charts: any; summary: any }>> {
    const params = new URLSearchParams({
      customerId,
      period,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })
    return this.request(`/customer/analytics/dashboard?${params.toString()}`)
  }

  // Export Analytics
  async exportAnalytics(
    role: string,
    format: "json" | "csv" = "json",
    period = "30d",
    startDate?: string,
    endDate?: string,
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      period,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })
    
    const url = `${this.baseURL}/${role}/analytics/export?${params.toString()}`
    const headers: Record<string, string> = {}
    
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`)
    }
    
    return response.blob()
  }
}

export const analyticsApi = new AnalyticsClient(API_BASE_URL)