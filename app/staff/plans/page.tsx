"use client"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import SubscriptionStatusDialog from "@/components/subscription-status-dialog" // Import SubscriptionStatusDialog

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Zap, Users, Clock, AlertCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { useAuth } from "@/contexts/AuthContext"
import { PlanAssignmentDialog } from "@/components/plan-assignment-dialog"
import { PlanSkeletonGrid, StatsCardSkeleton } from "@/components/plan-skeleton"
import { formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function StaffPlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("approved")
  const [approvedPlans, setApprovedPlans] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 10
  const { user } = useAuth()
  const { toast } = useToast()

  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState("")
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("all")
  const [subscriptionSortBy, setSubscriptionSortBy] = useState("date")
  const [subscriptionCurrentPage, setSubscriptionCurrentPage] = useState(1)
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false)

  useEffect(() => {
    if (user?.user_id) {
      fetchPlans()
      fetchSubscriptions()
    }
  }, [user?.user_id])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const approved = await planSubscriptionApi.getPlansByStatus("Approved")
      setApprovedPlans(Array.isArray(approved) ? approved : [])
    } catch (error) {
      console.error("Error fetching plans:", error)
      toast({
        title: "Error",
        description: "Failed to fetch plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const getFilteredAndSortedPlans = (plans: any[]) => {
    const filtered = plans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.speed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.plan_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || plan.approval_status === statusFilter

      return matchesSearch && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "speed":
          return Number.parseInt(b.speed) - Number.parseInt(a.speed)
        case "date":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
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
      switch (subscriptionSortBy) {
        case "price":
          return (b.plan_info?.price || 0) - (a.plan_info?.price || 0)
        case "date":
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        case "name":
          return (a.user_info?.name || "").localeCompare(b.user_info?.name || "")
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredApprovedPlans = getFilteredAndSortedPlans(approvedPlans)
  const filteredSubscriptions = getFilteredAndSortedSubscriptions(subscriptions)

  const getPagedPlans = (plans: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return plans.slice(startIndex, startIndex + itemsPerPage)
  }

  const displayedApprovedPlans = getPagedPlans(filteredApprovedPlans)
  const totalPagesApproved = Math.ceil(filteredApprovedPlans.length / itemsPerPage)

  const totalSubscriptionPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)
  const subscriptionDisplayed = filteredSubscriptions.slice(
    (subscriptionCurrentPage - 1) * itemsPerPage,
    subscriptionCurrentPage * itemsPerPage,
  )

  const handleExport = () => {
    const csv = [
      ["Plan ID", "Name", "Speed", "Price", "Data Limit", "Max Customers", "Status", "Created Date"],
      ...filteredApprovedPlans.map((p) => [
        p.plan_id,
        p.name,
        p.speed,
        p.price,
        p.data_limit_gb,
        p.max_customers,
        p.approval_status || "N/A",
        new Date(p.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `plans-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Plans exported successfully",
    })
  }

  return (
    <DashboardLayout title="Plans Management" description="View and assign subscription plans to customers">
      <div className="space-y-6">
        {/* Stats Cards */}
        {loading ? (
          <StatsCardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Available Plans</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{approvedPlans.length}</div>
                <p className="text-sm text-gray-500 mt-2">For assignment</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Plans</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{approvedPlans.length}</div>
                <p className="text-sm text-gray-500 mt-2">All available</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Avg Price</CardTitle>
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹
                  {approvedPlans.length > 0
                    ? Math.round(approvedPlans.reduce((sum, p) => sum + p.price, 0) / approvedPlans.length)
                    : 0}
                </div>
                <p className="text-sm text-gray-500 mt-2">Per plan</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Max Speed</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {approvedPlans.length > 0 ? Math.max(...approvedPlans.map((p) => Number.parseInt(p.speed) || 0)) : 0}{" "}
                  Mbps
                </div>
                <p className="text-sm text-gray-500 mt-2">Highest speed</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            setCurrentPage(1)
          }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="approved">Plans</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Approved Plans Tab */}
          <TabsContent value="approved" className="space-y-6">
            {loading ? (
              <PlanSkeletonGrid count={9} />
            ) : displayedApprovedPlans.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No plans available</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {displayedApprovedPlans.map((plan) => (
                    <Card key={plan.plan_id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        </div>
                        <CardDescription>{plan.speed}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">₹{plan.price}</div>
                          <div className="text-sm text-gray-500">per {plan.validity_days} days</div>
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              setSelectedPlan(plan)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => {
                              setSelectedPlanForAssign(plan)
                              setShowAssignDialog(true)
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Assign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPagesApproved > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPagesApproved}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPagesApproved, currentPage + 1))}
                      disabled={currentPage === totalPagesApproved}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Active Subscriptions</CardTitle>
                    <CardDescription>View customer subscriptions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchSubscriptions} disabled={subscriptionsLoading}>
                    {subscriptionsLoading ? "Refreshing..." : "Refresh Data"}
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
                  <Select
                    value={subscriptionSortBy}
                    onValueChange={(value) => {
                      setSubscriptionSortBy(value)
                      setSubscriptionCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Newest First</SelectItem>
                      <SelectItem value="price">Price (High to Low)</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {subscriptionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <TableHead className="min-w-[150px] font-bold text-gray-900">Customer Name</TableHead>
                          <TableHead className="min-w-[150px] font-bold text-gray-900">Email</TableHead>
                          <TableHead className="min-w-[150px] font-bold text-gray-900">Plan</TableHead>
                          <TableHead className="min-w-[120px] font-bold text-gray-900">Start Date</TableHead>
                          <TableHead className="min-w-[120px] font-bold text-gray-900">End Date</TableHead>
                          <TableHead className="min-w-[100px] font-bold text-gray-900">Days Left</TableHead>
                          <TableHead className="min-w-[100px] font-bold text-gray-900">Status</TableHead>
                          <TableHead className="min-w-[100px] font-bold text-gray-900">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptionDisplayed.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              No subscriptions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          subscriptionDisplayed.map((sub) => (
                            <TableRow
                              key={sub.subscription_id}
                              className="hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                              onClick={() => {
                                setSelectedSubscription(sub)
                                setShowSubscriptionDetails(true)
                              }}
                            >
                              <TableCell className="font-medium text-gray-900">
                                {sub.user_info?.name || "N/A"}
                              </TableCell>
                              <TableCell className="text-gray-700">{sub.user_info?.email || "N/A"}</TableCell>
                              <TableCell className="font-semibold text-gray-900">
                                {sub.plan_info?.name || "N/A"}
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
                                        : "bg-gray-100 text-gray-800 font-semibold"
                                  }
                                >
                                  {sub.status}
                                </Badge>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
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
                )}

                {totalSubscriptionPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubscriptionCurrentPage(Math.max(1, subscriptionCurrentPage - 1))}
                      disabled={subscriptionCurrentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {subscriptionCurrentPage} of {totalSubscriptionPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubscriptionCurrentPage(Math.min(totalSubscriptionPages, subscriptionCurrentPage + 1))}
                      disabled={subscriptionCurrentPage === totalSubscriptionPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Plan Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plan Details</DialogTitle>
              <DialogDescription>Complete information about the plan</DialogDescription>
            </DialogHeader>
            {selectedPlan && <PlanDetailsView plan={selectedPlan} />}
          </DialogContent>
        </Dialog>

        {/* Subscription Details Dialog */}
        <Dialog open={showSubscriptionDetails} onOpenChange={setShowSubscriptionDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Subscription Details</DialogTitle>
              <DialogDescription>View complete subscription information</DialogDescription>
            </DialogHeader>
            {selectedSubscription && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Name</Label>
                      <p className="font-medium">{selectedSubscription.user_info?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium text-sm">{selectedSubscription.user_info?.email || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Plan Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Plan Name</Label>
                      <p className="font-medium">{selectedSubscription.plan_info?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Speed</Label>
                      <p className="font-medium">{selectedSubscription.plan_info?.speed || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Start Date</Label>
                      <p className="font-medium">{formatDate(selectedSubscription.start_date)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">End Date</Label>
                      <p className="font-medium">{formatDate(selectedSubscription.end_date)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Days Remaining</Label>
                      <p className="font-bold text-green-600">
                        {Math.max(
                          0,
                          Math.floor(
                            (new Date(selectedSubscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                          ),
                        )}{" "}
                        days
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Status</Label>
                      <Badge className="bg-green-100 text-green-800">{selectedSubscription.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Plan Assignment Dialog */}
        <PlanAssignmentDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          plan={selectedPlanForAssign}
          onSuccess={fetchPlans}
        />

        {/* Status Dialog for Subscriptions */}
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

function PlanDetailsView({ plan }: { plan: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan Name:</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plan ID:</span>
                <span className="font-medium text-xs">{plan.plan_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge className="bg-green-100 text-green-800">{plan.approval_status}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Technical Specifications</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Speed:</span>
                <span className="font-medium">{plan.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data Limit:</span>
                <span className="font-medium">{plan.data_limit_gb} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Validity:</span>
                <span className="font-medium">{plan.validity_days} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-2">Pricing & Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500">Price:</span>
            <div className="font-medium text-lg text-green-600 mt-1">₹{plan.price}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500">Max Customers:</span>
            <div className="font-medium text-lg mt-1">{plan.max_customers}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500">Created:</span>
            <div className="font-medium mt-1">{new Date(plan.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
