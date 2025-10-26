"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Search, Filter, Eye, Zap, Users, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { useAuth } from "@/contexts/AuthContext"

export default function StaffPlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("approved")
  const [approvedPlans, setApprovedPlans] = useState<any[]>([])
  const [myPlans, setMyPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const approved = await planSubscriptionApi.getPlansByStatus("Approved")
      const myCreatedPlans = await planSubscriptionApi.getPlansByCreator(user?.user_id || "")
      setApprovedPlans(Array.isArray(approved) ? approved : [])
      setMyPlans(Array.isArray(myCreatedPlans) ? myCreatedPlans : [])
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

  const filteredApprovedPlans = approvedPlans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredMyPlans = myPlans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || plan.approval_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = myPlans.filter((p) => p.approval_status === "Pending").length
  const approvedCount = myPlans.filter((p) => p.approval_status === "Approved").length

  return (
    <DashboardLayout title="Plans Management" description="Create and manage subscription plans">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Approved Plans</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{approvedCount}</div>
              <p className="text-sm text-gray-500 mt-2">My created plans</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Approval</CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{pendingCount}</div>
              <p className="text-sm text-gray-500 mt-2">Awaiting admin review</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Available Plans</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{approvedPlans.length}</div>
              <p className="text-sm text-gray-500 mt-2">For allocation</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Created</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{myPlans.length}</div>
              <p className="text-sm text-gray-500 mt-2">All my plans</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="approved">Available Plans</TabsTrigger>
              <TabsTrigger value="myplans">My Plans</TabsTrigger>
            </TabsList>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Plan</DialogTitle>
                  <DialogDescription>Create a new subscription plan (requires admin approval)</DialogDescription>
                </DialogHeader>
                <CreatePlanForm onClose={() => setShowCreateDialog(false)} onSuccess={fetchPlans} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === "myplans" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Approved Plans Tab */}
          <TabsContent value="approved" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredApprovedPlans.map((plan) => (
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
                    <Button className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Allocate to Customer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Plans Tab */}
          <TabsContent value="myplans" className="space-y-6">
            {filteredMyPlans.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No plans created yet</p>
                  <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredMyPlans.map((plan) => (
                  <Card
                    key={plan.plan_id}
                    className={`border-0 shadow-lg ${
                      plan.approval_status === "Pending" ? "border-l-4 border-l-yellow-500" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                        <Badge
                          className={
                            plan.approval_status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : plan.approval_status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {plan.approval_status}
                        </Badge>
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
                          <span className="font-medium text-xs">{new Date(plan.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {plan.approval_status === "Pending" && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">Awaiting admin approval</p>
                        </div>
                      )}
                      <Button variant="outline" className="w-full bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function CreatePlanForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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
        description: "Plan created successfully and sent for approval",
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
