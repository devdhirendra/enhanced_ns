"use client"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Zap, Users, Clock, AlertCircle, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { useAuth } from "@/contexts/AuthContext"
import { PlanAssignmentDialog } from "@/components/plan-assignment-dialog"

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

  useEffect(() => {
    if (user?.user_id) {
      fetchPlans()
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

  const filteredApprovedPlans = getFilteredAndSortedPlans(approvedPlans)

  // Pagination
  const getPagedPlans = (plans: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return plans.slice(startIndex, startIndex + itemsPerPage)
  }

  const displayedApprovedPlans = getPagedPlans(filteredApprovedPlans)
  const totalPagesApproved = Math.ceil(filteredApprovedPlans.length / itemsPerPage)

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
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="approved">All Plans</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, speed, or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="speed">Speed (Highest)</SelectItem>
                <SelectItem value="date">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plans Tab */}
          <TabsContent value="approved" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
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
