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
  Edit,
  Trash2,
  CreditCard,
  DollarSign,
  CheckCircle,
  X,
  AlertCircle,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { confirmDelete } from "@/lib/confirmation-dialog"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { useAuth } from "@/contexts/AuthContext"
import { PlanAssignmentDialog } from "@/components/plan-assignment-dialog"

export default function PlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("plans")
  const [plans, setPlans] = useState<any[]>([])
  const [pendingPlans, setPendingPlans] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPlanDetails, setShowPlanDetails] = useState(false)
  const [showPendingDetails, setShowPendingDetails] = useState(false)
  const [selectedPendingPlan, setSelectedPendingPlan] = useState<any>(null)
  const [creatorInfo, setCreatorInfo] = useState<any>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState<any>(null)
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

  const totalPlans = plans.length
  const totalRevenue = plans.reduce((sum, plan) => sum + (plan.price || 0), 0)
  const activeSubscriptions = plans.filter((p) => p.approval_status === "Approved").length
  const pendingCount = pendingPlans.length  

  return (
    <DashboardLayout title="Plans & Subscriptions" description="Manage subscription plans and operator subscriptions">
      <div className="space-y-6">
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
            onClick={() => {
              setActiveTab("plans")
              setStatusFilter("active")
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Plans</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeSubscriptions}</div>
              <p className="text-sm text-gray-500 mt-2">Approved & active</p>
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
                <Card
                  key={plan.plan_id}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleViewPlan(plan)}
                >
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
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPlanForAssign(plan)
                          setShowAssignDialog(true)
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditPlan(plan)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePlan(plan)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredPlans.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No approved plans found</p>
                </CardContent>
              </Card>
            )}
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
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleViewPendingPlan(plan)}
                      >
                        View Details
                      </Button>
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
            {pendingPlans.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending plans for approval</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Active Subscriptions</CardTitle>
                <CardDescription>Manage operator subscriptions and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Subscription ID</TableHead>
                        <TableHead className="min-w-[150px]">Plan Name</TableHead>
                        <TableHead className="min-w-[120px]">Price</TableHead>
                        <TableHead className="min-w-[120px]">Start Date</TableHead>
                        <TableHead className="min-w-[120px]">End Date</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No active subscriptions
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscriptions.map((sub) => (
                          <TableRow key={sub.subscription_id}>
                            <TableCell className="font-medium">{sub.subscription_id}</TableCell>
                            <TableCell>{sub.plan_name}</TableCell>
                            <TableCell>₹{sub.price}</TableCell>
                            <TableCell>{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(sub.end_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  sub.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : sub.status === "Paused"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {sub.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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
                    <p className="font-medium">{new Date(selectedPlan.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
                      <p className="font-medium">{new Date(creatorInfo.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowPendingDetails(false)}>
                    Close
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
