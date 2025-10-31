"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { confirmDelete } from "@/lib/confirmation-dialog"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { useAuth } from "@/contexts/AuthContext"
import { PlanAssignmentDialog } from "@/components/plan-assignment-dialog"
import { SubscriptionStatusDialog } from "@/components/subscription-status-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsCardSkeleton, PlanSkeletonGrid, SubscriptionTableSkeleton } from "@/components/plan-skeleton"
import { formatDate } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function AdminPlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("plans")
  const [plans, setPlans] = useState<any[]>([])
  const [pendingPlans, setPendingPlans] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [subscriberCounts, setSubscriberCounts] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPlanDetails, setShowPlanDetails] = useState(false)
  const [showPendingDetails, setShowPendingDetails] = useState(false)
  const [selectedPendingPlan, setSelectedPendingPlan] = useState<any>(null)
  const [creatorInfo, setCreatorInfo] = useState<any>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState<any>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { user } = useAuth()
  const { toast } = useToast()

  const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState("")
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("all")
  const [subscriptionSortBy, setSubscriptionSortBy] = useState("date")
  const [subscriptionsRefreshLoading, setSubscriptionsRefreshLoading] = useState(false)
  const [selectedSubscriptionForDetails, setSelectedSubscriptionForDetails] = useState<any>(null)
  const [showSubscriptionDetailsDialog, setShowSubscriptionDetailsDialog] = useState(false)
  const [subscriptionCurrentPage, setSubscriptionCurrentPage] = useState(1)
  const [subscriptionSortOrder, setSubscriptionSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchPlans()
    fetchSubscriptions()
  }, [])

  const fetchPlans = async () => {
    try {
      setStatsLoading(true)
      setLoading(true)
      const [approvedPlans, pendingPlansData] = await Promise.all([
        planSubscriptionApi.getPlansByStatus("Approved"),
        planSubscriptionApi.getPlansByStatus("Pending"),
      ])
      setPlans(Array.isArray(approvedPlans) ? approvedPlans : [])
      setPendingPlans(Array.isArray(pendingPlansData) ? pendingPlansData : [])

      const counts: any = {}
      const allSubs = await planSubscriptionApi.getAllSubscriptions()
      if (Array.isArray(approvedPlans)) {
        approvedPlans.forEach((plan: any) => {
          counts[plan.plan_id] = allSubs.filter(
            (sub: any) => sub.plan_id === plan.plan_id && sub.status === "Active",
          ).length
        })
      }
      setSubscriberCounts(counts)
    } catch (error) {
      console.error("Error fetching plans:", error)
      toast({
        title: "Error",
        description: "Failed to fetch plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setStatsLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true)
      const allSubs = await planSubscriptionApi.getAllSubscriptions()
      setSubscriptions(Array.isArray(allSubs) ? allSubs : [])
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions",
        variant: "destructive",
      })
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  const handleRefreshSubscriptions = async () => {
    try {
      setSubscriptionsRefreshLoading(true)
      await fetchSubscriptions()
      toast({
        title: "Success",
        description: "Subscriptions data refreshed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh subscriptions",
        variant: "destructive",
      })
    } finally {
      setSubscriptionsRefreshLoading(false)
    }
  }

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || plan.approval_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSubscriptionSort = (field: "date" | "price" | "name") => {
    if (subscriptionSortBy === field) {
      setSubscriptionSortOrder(subscriptionSortOrder === "asc" ? "desc" : "asc")
    } else {
      setSubscriptionSortBy(field)
      setSubscriptionSortOrder("desc")
    }
  }

  const getFilteredAndSortedSubscriptions = (subs: any[]) => {
    const filtered = subs.filter((sub) => {
      const matchesSearch =
        (sub.user_info?.name || "").toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
        (sub.user_info?.email || "").toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
        (sub.plan_info?.name || "").toLowerCase().includes(subscriptionSearchTerm.toLowerCase())

      const matchesStatus = subscriptionStatusFilter === "all" || sub.status === subscriptionStatusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (subscriptionSortBy) {
        case "price":
          aValue = a.plan_info?.price || 0
          bValue = b.plan_info?.price || 0
          break
        case "date":
          aValue = new Date(a.start_date).getTime()
          bValue = new Date(b.start_date).getTime()
          break
        case "name":
          aValue = (a.user_info?.name || "").toLowerCase()
          bValue = (b.user_info?.name || "").toLowerCase()
          break
        default:
          return 0
      }

      if (subscriptionSortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }

  const filteredSubscriptions = getFilteredAndSortedSubscriptions(subscriptions)
  const totalSubscriptionPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)

  const getPagedSubscriptions = (subs: any[]) => {
    const startIndex = (subscriptionCurrentPage - 1) * itemsPerPage
    return subs.slice(startIndex, startIndex + itemsPerPage)
  }

  const displayedSubscriptions = getPagedSubscriptions(filteredSubscriptions)

  const handleApprovePlan = async (plan: any) => {
    try {
      await planSubscriptionApi.approvePlan(plan.plan_id, {
        approved_by: user?.user_id || "",
        approval_status: "Approved",
        comment: "Approved by admin",
      })
      toast({
        title: "Success",
        description: `Plan ${plan.name} approved successfully`,
      })
      fetchPlans()
    } catch (error) {
      console.error("Error approving plan:", error)
      toast({
        title: "Error",
        description: "Failed to approve plan",
        variant: "destructive",
      })
    }
  }

  const handleRejectPlan = async (plan: any) => {
    try {
      await planSubscriptionApi.approvePlan(plan.plan_id, {
        approved_by: user?.user_id || "",
        approval_status: "Rejected",
        comment: "Rejected by admin",
      })
      toast({
        title: "Success",
        description: `Plan ${plan.name} rejected`,
      })
      fetchPlans()
    } catch (error) {
      console.error("Error rejecting plan:", error)
      toast({
        title: "Error",
        description: "Failed to reject plan",
        variant: "destructive",
      })
    }
  }

  const handleDeletePlan = async (plan: any) => {
    try {
      const confirmed = await confirmDelete(`plan "${plan.name}"`)
      if (confirmed) {
        await planSubscriptionApi.deletePlan(plan.plan_id, user?.user_id || "")
        toast({
          title: "Success",
          description: `Plan ${plan.name} deleted successfully`,
        })
        fetchPlans()
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      })
    }
  }

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan)
    setShowAddPlanDialog(true)
  }

  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan)
    setShowPlanDetails(true)
  }

  const handleViewPendingPlan = (plan: any) => {
    setSelectedPendingPlan(plan)
    setCreatorInfo({
      name: "John Operator",
      role: "Operator",
      email: "john@example.com",
      phone: "+91-9876543210",
      createdAt: plan.created_at,
    })
    setShowPendingDetails(true)
  }

  // Fix: Handle row click for subscription details
  const handleSubscriptionRowClick = (sub: any, event: React.MouseEvent) => {
    // Check if the click was on the Change Status button or its children
    const target = event.target as HTMLElement
    const isChangeStatusButton = 
      target.closest('button')?.textContent?.includes('Change Status') ||
      target.closest('button')?.className?.includes('bg-blue-50')
    
    if (isChangeStatusButton) {
      // If clicking Change Status button, open status dialog
      event.stopPropagation()
      setSelectedSubscription(sub)
      setShowStatusDialog(true)
    } else {
      // Otherwise open details dialog
      setSelectedSubscriptionForDetails(sub)
      setShowSubscriptionDetailsDialog(true)
    }
  }

  const totalPlans = plans.length
  const totalRevenue = plans.reduce((sum, plan) => sum + (plan.price || 0), 0)
  const activeSubscriptions = subscriptions.filter((s) => s.status === "Active").length
  const pendingCount = pendingPlans.length

  return (
    <DashboardLayout title="Plans & Subscriptions" description="Manage subscription plans and customer subscriptions">
      <div className="space-y-6">
        {statsLoading ? (
          <StatsCardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card
              className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => {
                setActiveTab("plans")
                setStatusFilter("all")
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Plans</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalPlans}</div>
                <p className="text-sm text-gray-500 mt-2">Available plans</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setActiveTab("subscriptions")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Active Subscriptions</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeSubscriptions}</div>
                <p className="text-sm text-gray-500 mt-2">Active customers</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setActiveTab("pending")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Pending Approval</CardTitle>
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{pendingCount}</div>
                <p className="text-sm text-gray-500 mt-2">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-2">All plans combined</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="plans">Approved Plans</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingPlans.length})</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>
            <Dialog open={showAddPlanDialog} onOpenChange={setShowAddPlanDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                  <DialogDescription>
                    {selectedPlan ? "Update the plan details" : "Create a new subscription plan"}
                  </DialogDescription>
                </DialogHeader>
                <AddPlanForm
                  onClose={() => {
                    setShowAddPlanDialog(false)
                    setSelectedPlan(null)
                  }}
                  onSuccess={fetchPlans}
                  initialPlan={selectedPlan}
                />
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="plans" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <PlanSkeletonGrid count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredPlans.map((plan) => (
                  <Card
                    key={plan.plan_id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 group"
                    onClick={() => handleViewPlan(plan)}
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-200 to-blue-300" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {plan.name}
                          </CardTitle>
                          <CardDescription className="text-gray-600 mt-1">{plan.speed}</CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 text-xs font-semibold">
                          {plan.approval_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">₹{plan.price}</div>
                          <div className="text-xs text-gray-500 mt-1">per {plan.validity_days} days</div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700 font-semibold">Active Subscribers</span>
                        </div>
                        <span className="font-bold text-lg text-blue-600">{subscriberCounts[plan.plan_id] || 0}</span>
                      </div>

                      <div className="space-y-2 text-sm border-t pt-3 border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Data Limit:</span>
                          <span className="font-semibold text-gray-900">{plan.data_limit_gb} GB</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Max Customers:</span>
                          <span className="font-semibold text-gray-900">{plan.max_customers}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPlanForAssign(plan)
                            setShowAssignDialog(true)
                          }}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm bg-gray-50 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditPlan(plan)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 text-xs sm:text-sm bg-red-50 hover:bg-red-100 border-red-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePlan(plan)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!loading && filteredPlans.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No approved plans found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Active Subscriptions</CardTitle>
                    <CardDescription>Manage customer subscriptions and billing</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshSubscriptions}
                    disabled={subscriptionsRefreshLoading}
                  >
                    {subscriptionsRefreshLoading ? "Refreshing..." : "Refresh Data"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by customer name, email, or plan..."
                      value={subscriptionSearchTerm}
                      onChange={(e) => {
                        setSubscriptionSearchTerm(e.target.value)
                        setSubscriptionCurrentPage(1)
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={subscriptionStatusFilter}
                    onValueChange={(value) => {
                      setSubscriptionStatusFilter(value)
                      setSubscriptionCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {subscriptionsLoading ? (
                  <SubscriptionTableSkeleton />
                ) : (
                  <>
                    {/* Horizontal scrolling only for the table - Same as operators page */}
                    <ScrollArea className="w-full">
                      <div className="min-w-[1200px]">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50">
                              <TableHead className="w-[180px] font-semibold">Customer Name</TableHead>
                              <TableHead className="w-[200px] font-semibold">Email</TableHead>
                              <TableHead className="w-[180px] font-semibold">Plan</TableHead>
                              <TableHead className="w-[120px] font-semibold">
                                <Button
                                  variant="ghost"
                                  onClick={() => handleSubscriptionSort("price")}
                                  className="font-semibold p-0 h-auto hover:bg-transparent"
                                >
                                  Price
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                              </TableHead>
                              <TableHead className="w-[140px] font-semibold">
                                <Button
                                  variant="ghost"
                                  onClick={() => handleSubscriptionSort("date")}
                                  className="font-semibold p-0 h-auto hover:bg-transparent"
                                >
                                  Start Date
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                              </TableHead>
                              <TableHead className="w-[140px] font-semibold">End Date</TableHead>
                              <TableHead className="w-[120px] font-semibold">Days Left</TableHead>
                              <TableHead className="w-[100px] font-semibold">Status</TableHead>
                              <TableHead className="w-[120px] font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {displayedSubscriptions.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                  No subscriptions found
                                </TableCell>
                              </TableRow>
                            ) : (
                              displayedSubscriptions.map((sub) => (
                                <TableRow
                                  key={sub.subscription_id}
                                  className="hover:bg-blue-50 border-b border-gray-100 cursor-pointer"
                                  onClick={(e) => handleSubscriptionRowClick(sub, e)}
                                >
                                  <TableCell className="font-medium text-gray-900">
                                    {sub.user_info?.name || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-gray-700">{sub.user_info?.email || "N/A"}</TableCell>
                                  <TableCell className="font-semibold text-gray-900">
                                    {sub.plan_info?.name || "N/A"}
                                  </TableCell>
                                  <TableCell className="font-bold text-blue-600">
                                    ₹{sub.plan_info?.price || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-gray-700">{formatDate(sub.start_date)}</TableCell>
                                  <TableCell className="text-gray-700">{formatDate(sub.end_date)}</TableCell>
                                  <TableCell className="font-semibold text-blue-600">
                                    {Math.max(
                                      0,
                                      Math.floor(
                                        (new Date(sub.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                                      ),
                                    )}{" "}
                                    days
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        sub.status === "Active"
                                          ? "bg-green-100 text-green-800 font-semibold"
                                          : sub.status === "Paused"
                                            ? "bg-yellow-100 text-yellow-800 font-semibold"
                                            : sub.status === "Cancelled"
                                              ? "bg-red-100 text-red-800 font-semibold"
                                              : "bg-gray-100 text-gray-800 font-semibold"
                                      }
                                    >
                                      {sub.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSubscription(sub)
                                        setShowStatusDialog(true)
                                      }}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                                    >
                                      Change Status
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {/* Pagination - Same as operators page */}
                    {totalSubscriptionPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="text-sm text-gray-700">
                          Showing {Math.min((subscriptionCurrentPage - 1) * itemsPerPage + 1, filteredSubscriptions.length)} to{" "}
                          {Math.min(subscriptionCurrentPage * itemsPerPage, filteredSubscriptions.length)} of{" "}
                          {filteredSubscriptions.length} entries
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubscriptionCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={subscriptionCurrentPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: totalSubscriptionPages }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                variant={subscriptionCurrentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSubscriptionCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubscriptionCurrentPage(prev => Math.min(prev + 1, totalSubscriptionPages))}
                            disabled={subscriptionCurrentPage === totalSubscriptionPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Plans Tab */}
          <TabsContent value="pending" className="space-y-6">
            {loading ? (
              <PlanSkeletonGrid count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {pendingPlans.map((plan) => (
                  <Card
                    key={plan.plan_id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-l-4 border-l-yellow-500"
                    onClick={() => handleViewPendingPlan(plan)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                          <CardDescription>{plan.speed}</CardDescription>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">₹{plan.price}</div>
                          <div className="text-xs text-gray-500 mt-1">per {plan.validity_days} days</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Data Limit:</span>
                          <span className="font-medium">{plan.data_limit_gb} GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Customers:</span>
                          <span className="font-medium">{plan.max_customers}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApprovePlan(plan)
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRejectPlan(plan)
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!loading && pendingPlans.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending plans for approval</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Plan Details Dialog */}
        <Dialog open={showPlanDetails} onOpenChange={setShowPlanDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Plan Details</DialogTitle>
              <DialogDescription>View complete plan information</DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Plan Name</Label>
                    <p className="font-medium">{selectedPlan.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Speed</Label>
                    <p className="font-medium">{selectedPlan.speed}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Price</Label>
                    <p className="font-medium">₹{selectedPlan.price}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Validity</Label>
                    <p className="font-medium">{selectedPlan.validity_days} days</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Data Limit</Label>
                    <p className="font-medium">{selectedPlan.data_limit_gb} GB</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Max Customers</Label>
                    <p className="font-medium">{selectedPlan.max_customers}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <Badge className="bg-green-100 text-green-800">{selectedPlan.approval_status}</Badge>
                  </div>
                  <div>
                    <Label className="text-gray-600">Created</Label>
                    <p className="font-medium">{formatDate(selectedPlan.created_at)}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-600">Active Subscribers</Label>
                    <p className="font-bold text-blue-600 text-lg">{subscriberCounts[selectedPlan.plan_id] || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Pending Details Dialog */}
        <Dialog open={showPendingDetails} onOpenChange={setShowPendingDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pending Plan Details</DialogTitle>
              <DialogDescription>Review plan submission and creator information</DialogDescription>
            </DialogHeader>
            {selectedPendingPlan && creatorInfo && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Plan Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Plan Name</Label>
                      <p className="font-medium">{selectedPendingPlan.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Speed</Label>
                      <p className="font-medium">{selectedPendingPlan.speed}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Price</Label>
                      <p className="font-medium">₹{selectedPendingPlan.price}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Validity</Label>
                      <p className="font-medium">{selectedPendingPlan.validity_days} days</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Data Limit</Label>
                      <p className="font-medium">{selectedPendingPlan.data_limit_gb} GB</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Max Customers</Label>
                      <p className="font-medium">{selectedPendingPlan.max_customers}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Created By</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Name</Label>
                      <p className="font-medium">{creatorInfo.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Role</Label>
                      <Badge className="bg-blue-100 text-blue-800">{creatorInfo.role}</Badge>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium text-sm">{creatorInfo.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-medium">{creatorInfo.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-600">Submitted On</Label>
                      <p className="font-medium">{formatDate(creatorInfo.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPendingDetails(false)
                      handleRejectPlan(selectedPendingPlan)
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPendingDetails(false)
                      handleApprovePlan(selectedPendingPlan)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Subscription Details Dialog */}
        <Dialog open={showSubscriptionDetailsDialog} onOpenChange={setShowSubscriptionDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Subscription Details</DialogTitle>
              <DialogDescription>View and manage subscription information</DialogDescription>
            </DialogHeader>
            {selectedSubscriptionForDetails && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Name</Label>
                      <p className="font-medium">{selectedSubscriptionForDetails.user_info?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium text-sm">{selectedSubscriptionForDetails.user_info?.email || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-medium">{selectedSubscriptionForDetails.user_info?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Customer ID</Label>
                      <p className="font-medium text-sm">{selectedSubscriptionForDetails.user_info?.customerId || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Plan Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Plan Name</Label>
                      <p className="font-medium">{selectedSubscriptionForDetails.plan_info?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Speed</Label>
                      <p className="font-medium">{selectedSubscriptionForDetails.plan_info?.speed || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Price</Label>
                      <p className="font-bold text-blue-600">₹{selectedSubscriptionForDetails.plan_info?.price || "0"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Data Limit</Label>
                      <p className="font-medium">{selectedSubscriptionForDetails.plan_info?.data_limit_gb || "N/A"} GB</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Start Date</Label>
                      <p className="font-medium">{formatDate(selectedSubscriptionForDetails.start_date)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">End Date</Label>
                      <p className="font-medium">{formatDate(selectedSubscriptionForDetails.end_date)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Days Remaining</Label>
                      <p className="font-bold text-green-600">
                        {Math.max(
                          0,
                          Math.floor(
                            (new Date(selectedSubscriptionForDetails.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                          ),
                        )}{" "}
                        days
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Status</Label>
                      <Badge
                        className={
                          selectedSubscriptionForDetails.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : selectedSubscriptionForDetails.status === "Paused"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedSubscriptionForDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowSubscriptionDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSubscriptionDetailsDialog(false)
                      setSelectedSubscription(selectedSubscriptionForDetails)
                      setShowStatusDialog(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Change Status
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <PlanAssignmentDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          plan={selectedPlanForAssign}
          onSuccess={fetchPlans}
        />

        <SubscriptionStatusDialog
          open={showStatusDialog}
          onOpenChange={setShowStatusDialog}
          subscription={selectedSubscription}
          onSuccess={() => {
            fetchSubscriptions()
            fetchPlans()
          }}
        />
      </div>
    </DashboardLayout>
  )
}

function AddPlanForm({
  onClose,
  onSuccess,
  initialPlan,
}: {
  onClose: () => void
  onSuccess: () => void
  initialPlan?: any
}) {
  const [formData, setFormData] = useState({
    name: initialPlan?.name || "",
    speed: initialPlan?.speed || "",
    price: initialPlan?.price || 0,
    validity_days: initialPlan?.validity_days || 30,
    data_limit_gb: initialPlan?.data_limit_gb || 100,
    max_customers: initialPlan?.max_customers || 1000,
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (initialPlan) {
        await planSubscriptionApi.updatePlan(initialPlan.plan_id, user?.user_id || "", formData)
        toast({
          title: "Success",
          description: `Plan ${formData.name} updated successfully`,
        })
      } else {
        await planSubscriptionApi.createPlan(user?.user_id || "", formData)
        toast({
          title: "Success",
          description: `Plan ${formData.name} created successfully (pending approval)`,
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving plan:", error)
      toast({
        title: "Error",
        description: `Failed to ${initialPlan ? "update" : "create"} plan`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="speed">Speed *</Label>
          <Input
            id="speed"
            value={formData.speed}
            onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
            placeholder="e.g., 100 Mbps"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="validity">Validity (Days) *</Label>
          <Input
            id="validity"
            type="number"
            value={formData.validity_days}
            onChange={(e) => setFormData({ ...formData, validity_days: Number.parseInt(e.target.value) || 30 })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dataLimit">Data Limit (GB) *</Label>
          <Input
            id="dataLimit"
            type="number"
            value={formData.data_limit_gb}
            onChange={(e) => setFormData({ ...formData, data_limit_gb: Number.parseInt(e.target.value) || 100 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="maxCustomers">Max Customers *</Label>
          <Input
            id="maxCustomers"
            type="number"
            value={formData.max_customers}
            onChange={(e) => setFormData({ ...formData, max_customers: Number.parseInt(e.target.value) || 1000 })}
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialPlan ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  )
}