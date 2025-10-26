"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Download, Wifi, DollarSign, Users, TrendingUp, Package, Zap, AlertCircle } from "lucide-react"
import { exportToCSV } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"

export default function OperatorPlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
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

  const filteredPlans = approvedPlans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.speed.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleExport = () => {
    const exportData = approvedPlans.map((plan) => ({
      ID: plan.plan_id,
      Name: plan.name,
      Speed: plan.speed,
      Price: plan.price,
      "Data Limit": plan.data_limit_gb,
      "Max Customers": plan.max_customers,
      "Created Date": new Date(plan.created_at).toLocaleDateString(),
    }))
    exportToCSV(exportData, "approved-plans")
    toast({
      title: "Export Successful",
      description: "Plans data has been exported to CSV file.",
    })
  }

  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan)
    setShowPlanDetailsDialog(true)
  }

  const planStats = {
    total: approvedPlans.length,
    avgPrice: approvedPlans.length > 0 ? approvedPlans.reduce((sum, p) => sum + p.price, 0) / approvedPlans.length : 0,
    maxSpeed: approvedPlans.length > 0 ? Math.max(...approvedPlans.map((p) => Number.parseInt(p.speed) || 0)) : 0,
  }

  return (
    <DashboardLayout title="Available Plans" description="View and manage approved subscription plans">
      <div className="space-y-6">
        {/* Plan Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Plans</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{planStats.total}</div>
              <p className="text-sm text-gray-500 mt-2">Approved plans</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Average Price</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">₹{Math.round(planStats.avgPrice)}</div>
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
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{planStats.maxSpeed} Mbps</div>
              <p className="text-sm text-gray-500 mt-2">Highest speed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Status</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">Active</div>
              <p className="text-sm text-gray-500 mt-2">All plans</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="plans" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                All Plans
              </TabsTrigger>
              <TabsTrigger value="comparison" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Comparison
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <TabsContent value="plans" className="space-y-6">
            {/* Filters */}
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
            </div>

            {/* Plans Grid View */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
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
                  <Card key={plan.plan_id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
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
                          <div className="flex items-center">
                            <Wifi className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Speed</span>
                          </div>
                          <span className="font-medium">{plan.speed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Data Limit</span>
                          </div>
                          <span className="font-medium">{plan.data_limit_gb} GB</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Max Customers</span>
                          </div>
                          <span className="font-medium">{plan.max_customers}</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full bg-transparent" onClick={() => handleViewPlan(plan)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Plans Table View */}
            {filteredPlans.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Available Plans ({filteredPlans.length})
                  </CardTitle>
                  <CardDescription>Detailed view of all approved plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Plan Details</TableHead>
                          <TableHead className="min-w-[120px]">Speed & Price</TableHead>
                          <TableHead className="min-w-[120px]">Data Limit</TableHead>
                          <TableHead className="min-w-[120px]">Max Customers</TableHead>
                          <TableHead className="min-w-[120px]">Created</TableHead>
                          <TableHead className="min-w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPlans.map((plan) => (
                          <TableRow key={plan.plan_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{plan.name}</div>
                                <div className="text-sm text-gray-500">{plan.plan_id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="flex items-center font-medium">
                                  <Wifi className="h-4 w-4 mr-1 text-gray-400" />
                                  {plan.speed}
                                </div>
                                <div className="flex items-center text-sm font-medium text-green-600">
                                  <DollarSign className="h-3 w-3 mr-1" />₹{plan.price}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{plan.data_limit_gb} GB</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{plan.max_customers}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{new Date(plan.created_at).toLocaleDateString()}</span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => handleViewPlan(plan)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Plan Comparison</CardTitle>
                <CardDescription>Compare features and pricing across all plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Feature</TableHead>
                        {filteredPlans.slice(0, 4).map((plan) => (
                          <TableHead key={plan.plan_id} className="min-w-[120px] text-center">
                            {plan.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Price</TableCell>
                        {filteredPlans.slice(0, 4).map((plan) => (
                          <TableCell key={plan.plan_id} className="text-center font-medium text-green-600">
                            ₹{plan.price}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Speed</TableCell>
                        {filteredPlans.slice(0, 4).map((plan) => (
                          <TableCell key={plan.plan_id} className="text-center">
                            {plan.speed}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Data Limit</TableCell>
                        {filteredPlans.slice(0, 4).map((plan) => (
                          <TableCell key={plan.plan_id} className="text-center">
                            {plan.data_limit_gb} GB
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Max Customers</TableCell>
                        {filteredPlans.slice(0, 4).map((plan) => (
                          <TableCell key={plan.plan_id} className="text-center">
                            {plan.max_customers}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Validity</TableCell>
                        {filteredPlans.slice(0, 4).map((plan) => (
                          <TableCell key={plan.plan_id} className="text-center">
                            {plan.validity_days} days
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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

// Plan Details View Component
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
