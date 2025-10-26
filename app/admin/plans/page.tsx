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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Users,
  Calendar,
  DollarSign,
  MoreHorizontal,
  CheckCircle,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { confirmDelete, confirmAction } from "@/lib/confirmation-dialog"
import { exportToCSV, formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { useAuth } from "@/contexts/AuthContext"

// Demo data for plans
const plans = [
  {
    id: "PLAN001",
    name: "Basic Plan",
    description: "Essential features for small operators",
    price: 2999,
    billingCycle: "monthly",
    features: ["Up to 500 customers", "Basic support", "Standard dashboard"],
    maxConnections: 500,
    maxOLTs: 2,
    status: "active",
    subscribers: 45,
    createdAt: "2023-01-15",
  },
  {
    id: "PLAN002",
    name: "Professional Plan",
    description: "Advanced features for growing businesses",
    price: 4999,
    billingCycle: "monthly",
    features: ["Up to 2000 customers", "Priority support", "Advanced analytics"],
    maxConnections: 2000,
    maxOLTs: 5,
    status: "active",
    subscribers: 28,
    createdAt: "2023-01-15",
  },
  {
    id: "PLAN003",
    name: "Enterprise Plan",
    description: "Complete solution for large operators",
    price: 9999,
    billingCycle: "monthly",
    features: ["Unlimited customers", "24/7 support", "Custom integrations"],
    maxConnections: -1,
    maxOLTs: -1,
    status: "active",
    subscribers: 12,
    createdAt: "2023-01-15",
  },
]

// Demo data for subscriptions
const subscriptions = [
  {
    id: "SUB001",
    operator: "City Networks",
    operatorId: "OP001",
    plan: "Professional Plan",
    planId: "PLAN002",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    amount: 4999,
    billingCycle: "monthly",
    nextBilling: "2024-02-01",
    autoRenew: true,
  },
  {
    id: "SUB002",
    operator: "Metro Fiber",
    operatorId: "OP002",
    plan: "Basic Plan",
    planId: "PLAN001",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    amount: 2999,
    billingCycle: "monthly",
    nextBilling: "2024-02-15",
    autoRenew: false,
  },
  {
    id: "SUB003",
    operator: "Speed Net",
    operatorId: "OP003",
    plan: "Enterprise Plan",
    planId: "PLAN003",
    status: "expired",
    startDate: "2023-12-01",
    endDate: "2024-01-31",
    amount: 9999,
    billingCycle: "monthly",
    nextBilling: "2024-01-31",
    autoRenew: false,
  },
]

export default function PlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("plans")
  const [plans, setPlans] = useState<any[]>([])
  const [pendingPlans, setPendingPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const approvedPlans = await planSubscriptionApi.getPlansByStatus("Approved")
      const pendingPlansData = await planSubscriptionApi.getPlansByStatus("Pending")
      setPlans(Array.isArray(approvedPlans) ? approvedPlans : [])
      setPendingPlans(Array.isArray(pendingPlansData) ? pendingPlansData : [])
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

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || plan.approval_status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.operator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Action handlers
  const handleExportPlans = () => {
    const exportData = plans.map((plan) => ({
      "Plan Name": plan.name,
      Price: plan.price,
      "Billing Cycle": plan.billingCycle,
      "Max Connections": plan.maxConnections === -1 ? "Unlimited" : plan.maxConnections,
      "Max OLTs": plan.maxOLTs === -1 ? "Unlimited" : plan.maxOLTs,
      Subscribers: plan.subscribers,
      Status: plan.status,
    }))
    exportToCSV(exportData, "subscription-plans")
    toast({
      title: "Export Successful",
      description: "Plans data exported successfully!",
    })
  }

  const handleExportSubscriptions = () => {
    const exportData = subscriptions.map((sub) => ({
      "Subscription ID": sub.id,
      Operator: sub.operator,
      Plan: sub.plan,
      Amount: sub.amount,
      Status: sub.status,
      "Start Date": sub.startDate,
      "End Date": sub.endDate,
      "Next Billing": sub.nextBilling,
    }))
    exportToCSV(exportData, "subscriptions")
    toast({
      title: "Export Successful",
      description: "Subscriptions data exported successfully!",
    })
  }

  const handleViewPlan = (plan: any) => {
    toast({
      title: "Viewing Plan",
      description: `Viewing plan: ${plan.name}`,
    })
    console.log("View plan:", plan)
  }

  const handleEditPlan = (plan: any) => {
    toast({
      title: "Editing Plan",
      description: `Editing plan: ${plan.name}`,
    })
    console.log("Edit plan:", plan)
  }

  const handleViewSubscription = (subscription: any) => {
    toast({
      title: "Viewing Subscription",
      description: `Viewing subscription: ${subscription.id}`,
    })
    console.log("View subscription:", subscription)
  }

  const handleEditSubscription = (subscription: any) => {
    toast({
      title: "Editing Subscription",
      description: `Editing subscription: ${subscription.id}`,
    })
    console.log("Edit subscription:", subscription)
  }

  const handleCancelSubscription = async (subscription: any) => {
    try {
      const confirmed = await confirmAction("cancel", `subscription "${subscription.id}"`)

      if (confirmed) {
        toast({
          title: "Subscription Cancelled",
          description: `Subscription ${subscription.id} cancelled successfully`,
        })
        console.log("Cancel subscription:", subscription)
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRenewSubscription = (subscription: any) => {
    toast({
      title: "Subscription Renewed",
      description: `Subscription ${subscription.id} renewed successfully`,
    })
    console.log("Renew subscription:", subscription)
  }

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length
  const totalPlans = plans.length

  return (
    <DashboardLayout title="Plans & Subscriptions" description="Manage subscription plans and operator subscriptions">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
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

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Subscriptions</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeSubscriptions}</div>
              <p className="text-sm text-gray-500 mt-2">Current subscribers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Monthly Revenue</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Renewal Rate</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">85%</div>
              <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

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
                  <DialogTitle>Create New Plan</DialogTitle>
                  <DialogDescription>Create a new subscription plan</DialogDescription>
                </DialogHeader>
                <AddPlanForm onClose={() => setShowAddPlanDialog(false)} onSuccess={fetchPlans} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={activeTab === "plans" ? "Search plans..." : "Search subscriptions..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Approved Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPlans.map((plan) => (
                <Card key={plan.plan_id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">{plan.approval_status}</Badge>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{new Date(plan.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleDeletePlan(plan)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pending Plans Tab */}
          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pendingPlans.map((plan) => (
                <Card key={plan.plan_id} className="border-0 shadow-lg border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <CardDescription>Awaiting approval</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">₹{plan.price}</div>
                      <div className="text-sm text-gray-500">per {plan.validity_days} days</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Speed:</span>
                        <span className="font-medium">{plan.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Limit:</span>
                        <span className="font-medium">{plan.data_limit_gb} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created By:</span>
                        <span className="font-medium text-xs">{plan.created_by.substring(0, 8)}...</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprovePlan(plan)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleRejectPlan(plan)}>
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Active Subscriptions ({filteredSubscriptions.length})
                </CardTitle>
                <CardDescription>Manage operator subscriptions and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Subscription</TableHead>
                        <TableHead className="min-w-[150px]">Operator</TableHead>
                        <TableHead className="min-w-[120px]">Plan</TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[120px]">Billing</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Next Billing</TableHead>
                        <TableHead className="min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{subscription.id}</div>
                              <div className="text-sm text-gray-500">
                                {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">{subscription.operator}</div>
                            <div className="text-sm text-gray-500">{subscription.operatorId}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{subscription.plan}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">{formatCurrency(subscription.amount)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="capitalize">{subscription.billingCycle}</div>
                              <div className="text-gray-500">{subscription.autoRenew ? "Auto-renew" : "Manual"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(subscription.status)}>{subscription.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{formatDate(subscription.nextBilling)}</div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-48" align="end">
                                <DropdownMenuItem onClick={() => handleViewSubscription(subscription)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {subscription.status === "expired" ? (
                                  <DropdownMenuItem onClick={() => handleRenewSubscription(subscription)}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Renew
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleCancelSubscription(subscription)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function AddPlanForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    speed: "",
    price: 0,
    validity_days: 30,
    data_limit_gb: 100,
    max_customers: 1000,
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await planSubscriptionApi.createPlan(user?.user_id || "", formData)
      toast({
        title: "Success",
        description: `Plan ${formData.name} created successfully (pending approval)`,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error creating plan:", error)
      toast({
        title: "Error",
        description: "Failed to create plan",
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
          {loading ? "Creating..." : "Create Plan"}
        </Button>
      </div>
    </form>
  )
}
