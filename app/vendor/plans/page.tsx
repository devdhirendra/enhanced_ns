"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Package, AlertCircle, Zap, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { PlanSkeletonGrid, StatsCardSkeleton } from "@/components/plan-skeleton"

export default function VendorPlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPlanDetailsDialog, setShowPlanDetailsDialog] = useState(false)
  const [approvedPlans, setApprovedPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const plans = await planSubscriptionApi.getPlansByStatus("Approved")
      setApprovedPlans(Array.isArray(plans) ? plans : [])
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

  const getFilteredAndSortedPlans = () => {
    const filtered = approvedPlans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.speed.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "speed":
          return Number.parseInt(b.speed) - Number.parseInt(a.speed)
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }

  const filteredPlans = getFilteredAndSortedPlans()

  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan)
    setShowPlanDetailsDialog(true)
  }

  return (
    <DashboardLayout title="Available Plans" description="Browse available subscription plans">
      <div className="space-y-6">
        {/* Stats */}
        {loading ? (
          <StatsCardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Plans</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{approvedPlans.length}</div>
                <p className="text-sm text-gray-500 mt-2">Available plans</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Avg Price</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
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
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {approvedPlans.length > 0 ? Math.max(...approvedPlans.map((p) => Number.parseInt(p.speed) || 0)) : 0}{" "}
                  Mbps
                </div>
                <p className="text-sm text-gray-500 mt-2">Highest speed</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Status</CardTitle>
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">All</div>
                <p className="text-sm text-gray-500 mt-2">Plans approved</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="speed">Speed (Highest)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <PlanSkeletonGrid count={6} />
        ) : filteredPlans.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No plans available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card
                key={plan.plan_id}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleViewPlan(plan)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                      <CardDescription className="mt-1">{plan.speed}</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">₹{plan.price}</div>
                    <p className="text-sm text-gray-500">per {plan.validity_days} days</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data Limit:</span>
                      <span className="font-medium">{plan.data_limit_gb} GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Max Customers:</span>
                      <span className="font-medium">{plan.max_customers}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewPlan(plan)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Plan Details Dialog */}
        <Dialog open={showPlanDetailsDialog} onOpenChange={setShowPlanDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plan Details</DialogTitle>
              <DialogDescription>Complete information about the service plan</DialogDescription>
            </DialogHeader>
            {selectedPlan && <PlanDetailsView plan={selectedPlan} />}
          </DialogContent>
        </Dialog>
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
                <span className="font-medium">{plan.plan_id}</span>
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
