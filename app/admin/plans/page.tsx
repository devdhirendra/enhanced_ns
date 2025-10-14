"use client"

import type React from "react"
import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  CreditCard,
  Users,
  Calendar,
  DollarSign,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { confirmDelete, confirmAction } from "@/lib/confirmation-dialog"
import { exportToCSV, formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { toast } from "react-toastify"

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
  const { toast } = useToast()

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const handleDeletePlan = async (plan: any) => {
    try {
      const confirmed = await confirmDelete(`plan "${plan.name}"`)

      if (confirmed) {
        toast({
          title: "Plan Deleted",
          description: `Plan ${plan.name} deleted successfully`,
        })
        console.log("Delete plan:", plan)
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      })
    }
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
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
              <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={activeTab === "plans" ? handleExportPlans : handleExportSubscriptions}
                className="flex-1 sm:flex-none bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {activeTab === "plans" && (
                <Dialog open={showAddPlanDialog} onOpenChange={setShowAddPlanDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 sm:flex-none">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Plan</DialogTitle>
                      <DialogDescription>Create a new subscription plan for operators</DialogDescription>
                    </DialogHeader>
                    <AddPlanForm onClose={() => setShowAddPlanDialog(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
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

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                      <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</div>
                      <div className="text-sm text-gray-500">per {plan.billingCycle}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subscribers:</span>
                        <span className="font-medium">{plan.subscribers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max Connections:</span>
                        <span className="font-medium">
                          {plan.maxConnections === -1 ? "Unlimited" : plan.maxConnections}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max OLTs:</span>
                        <span className="font-medium">{plan.maxOLTs === -1 ? "Unlimited" : plan.maxOLTs}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Features:</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleViewPlan(plan)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePlan(plan)}>
                        <Trash2 className="h-4 w-4" />
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

// Add Plan Form Component
function AddPlanForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    billingCycle: "monthly",
    maxConnections: 0,
    maxOLTs: 0,
    features: [""],
    status: "active",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Plan Created",
      description: `Plan ${formData.name} created successfully!`,
    })
    console.log("Plan form submitted:", formData)
    onClose()
  }

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] })
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
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
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="billingCycle">Billing Cycle</Label>
          <Select
            value={formData.billingCycle}
            onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="maxConnections">Max Connections</Label>
          <Input
            id="maxConnections"
            type="number"
            value={formData.maxConnections}
            onChange={(e) => setFormData({ ...formData, maxConnections: Number.parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="maxOLTs">Max OLTs</Label>
          <Input
            id="maxOLTs"
            type="number"
            value={formData.maxOLTs}
            onChange={(e) => setFormData({ ...formData, maxOLTs: Number.parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Features</Label>
          <Button type="button" variant="outline" size="sm" onClick={addFeature}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Enter feature"
              />
              {formData.features.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Plan</Button>
      </div>
    </form>
  )
}
