"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Wifi,
  Zap,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Settings,
  Download,
  Upload,
  AlertCircle,
  Lock,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"

export default function CustomerPlanPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [planHistory, setPlanHistory] = useState<any[]>([])

  useEffect(() => {
    fetchPlans()
    fetchCurrentSubscription()
    fetchPlanHistory()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const plans = await planSubscriptionApi.getPlansByStatus("Approved")
      setAvailablePlans(Array.isArray(plans) ? plans : [])
    } catch (error) {
      console.error("Error fetching plans:", error)
      toast({
        title: "Error",
        description: "Failed to fetch available plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      if (user?.user_id) {
        const subscription = await planSubscriptionApi.getActiveSubscription(user.user_id)
        setCurrentPlan(subscription)
      }
    } catch (error) {
      console.error("Error fetching current subscription:", error)
    }
  }

  const fetchPlanHistory = async () => {
    try {
      if (user?.user_id) {
        const history = await planSubscriptionApi.getPlanHistory(user.user_id)
        setPlanHistory(Array.isArray(history) ? history : [])
      }
    } catch (error) {
      console.error("Error fetching plan history:", error)
    }
  }

  const handlePlanChange = (planId: string, action: string) => {
    if (action === "upgrade") {
      toast({
        title: "Upgrade Initiated",
        description:
          "Your plan upgrade request has been submitted. Changes will take effect on your next billing cycle.",
      })
    } else if (action === "downgrade") {
      toast({
        title: "Downgrade Requested",
        description:
          "Your plan downgrade request has been submitted. Changes will take effect on your next billing cycle.",
      })
    }
    setIsUpgradeDialogOpen(false)
  }

  const handleSubscribeToPlan = async (plan: any) => {
    setSelectedPlan(plan)
    setIsPaymentDialogOpen(true)
  }

  const handleConfirmSubscription = async () => {
    try {
      if (!user?.user_id || !selectedPlan) return

      toast({
        title: "Payment Integration Required",
        description:
          "Payment gateway integration is in development. Contact admin@networksolutions.com for manual subscription setup.",
        variant: "default",
      })

      // Once payment is integrated, uncomment this:
      // await planSubscriptionApi.subscribeToPlan(user.user_id, selectedPlan.plan_id)
      // toast({
      //   title: "Success",
      //   description: `Successfully subscribed to ${selectedPlan.name}`,
      // })
      // fetchCurrentSubscription()
      // setIsPaymentDialogOpen(false)
    } catch (error) {
      console.error("Error subscribing to plan:", error)
      toast({
        title: "Error",
        description: "Failed to subscribe to plan",
        variant: "destructive",
      })
    }
  }

  const getComparisonIcon = (comparison: string) => {
    switch (comparison) {
      case "upgrade":
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case "downgrade":
        return <ArrowDown className="h-4 w-4 text-red-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-600" />
    }
  }

  const getComparisonColor = (comparison: string) => {
    switch (comparison) {
      case "upgrade":
        return "border-green-200 bg-green-50"
      case "downgrade":
        return "border-red-200 bg-red-50"
      case "current":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-white"
    }
  }

  return (
    <DashboardLayout title="Plan Management" description="Manage your internet plan and usage">
      <div className="space-y-6">
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">Current Plan</TabsTrigger>
            <TabsTrigger value="available">Available Plans</TabsTrigger>
            <TabsTrigger value="usage">Usage Details</TabsTrigger>
            <TabsTrigger value="history">Plan History</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {/* Current Plan Overview */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentPlan?.name || "No Active Plan"}</CardTitle>
                    <CardDescription>Your current active plan</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">₹{currentPlan?.price || "0"}</div>
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      {currentPlan?.status
                        ? currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1)
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {currentPlan && (
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Plan Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Plan Type:</span>
                          <span className="font-medium">{currentPlan?.type || "Standard"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Speed:</span>
                          <span className="font-medium">{currentPlan?.speed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Billing Cycle:</span>
                          <span className="font-medium capitalize">{currentPlan?.billingCycle || "Monthly"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Next Billing:</span>
                          <span className="font-medium">{formatDate(currentPlan?.nextBilling)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Plan Start:</span>
                          <span className="font-medium">{formatDate(currentPlan?.startDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Plan Features</h4>
                      <div className="space-y-2">
                        {currentPlan?.features && Array.isArray(currentPlan.features) ? (
                          currentPlan.features.map((feature: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No features available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => setIsUpgradeDialogOpen(true)} className="flex-1">
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Modify Plan
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Billing History
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Quick Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Data Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Used this month:</span>
                      <span className="font-medium">{currentPlan?.usage?.dataUsed || "0"} GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Plan limit:</span>
                      <span className="font-medium">{currentPlan?.usage?.dataLimit || "Unlimited"}</span>
                    </div>
                    <Progress value={65} className="w-full" />
                    <p className="text-xs text-gray-500">65% of typical monthly usage</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Speed Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average speed:</span>
                      <span className="font-medium">{currentPlan?.usage?.speedUsed || "0"} Mbps</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Plan speed:</span>
                      <span className="font-medium">{currentPlan?.usage?.speedLimit || "0"} Mbps</span>
                    </div>
                    <Progress value={87} className="w-full" />
                    <p className="text-xs text-gray-500">87% of plan speed achieved</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : availablePlans.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No plans available at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availablePlans.map((plan) => (
                  <Card key={plan.plan_id} className="border-0 shadow-lg relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-blue-600" />
                            {plan.name}
                          </CardTitle>
                          <CardDescription>{plan.speed}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">₹{plan.price}</div>
                          <p className="text-sm text-gray-500">per {plan.validity_days} days</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      <Button className="w-full" onClick={() => handleSubscribeToPlan(plan)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Subscribe to This Plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Download Speed</CardTitle>
                  <Download className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">87 Mbps</div>
                  <p className="text-xs text-gray-500 mt-1">Average this month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Upload Speed</CardTitle>
                  <Upload className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">18 Mbps</div>
                  <p className="text-xs text-gray-500 mt-1">Average this month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Data Used</CardTitle>
                  <Wifi className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">328 GB</div>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Uptime</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">99.2%</div>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Usage Breakdown</CardTitle>
                <CardDescription>Your internet usage patterns and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Data Usage Progress</span>
                      <span className="text-sm text-gray-500">328 GB used</span>
                    </div>
                    <Progress value={65} className="w-full" />
                    <p className="text-xs text-gray-500 mt-1">65% of typical monthly usage</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Speed Efficiency</span>
                      <span className="text-sm text-gray-500">87% of plan speed</span>
                    </div>
                    <Progress value={87} className="w-full" />
                    <p className="text-xs text-gray-500 mt-1">Excellent performance</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Peak Usage Hours</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">8:00 PM - 10:00 PM</span>
                          <span className="font-medium">Highest</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">6:00 PM - 8:00 PM</span>
                          <span className="font-medium">High</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">2:00 AM - 6:00 AM</span>
                          <span className="font-medium">Lowest</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Usage by Device Type</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Mobile Devices</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Laptops/PCs</span>
                          <span className="font-medium">35%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Smart TV/Streaming</span>
                          <span className="font-medium">20%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Change History</CardTitle>
                <CardDescription>Your plan upgrade and downgrade history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planHistory && planHistory.length > 0 ? (
                    planHistory.map((history: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Wifi className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{history.planName}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(history.startDate)} -{" "}
                            {history.endDate === "Current" ? "Current" : formatDate(history.endDate)}
                          </p>
                          <p className="text-sm text-gray-500">Duration: {history.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{history.reason}</p>
                          {history.endDate === "Current" && (
                            <Badge className="bg-green-100 text-green-800 mt-1">Active</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No plan history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade Dialog */}
        <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Plan Change</DialogTitle>
              <DialogDescription>
                Are you sure you want to change your plan? Changes will take effect on your next billing cycle.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Current Plan</h4>
                <p className="text-sm text-gray-600">
                  {currentPlan?.name} - ₹{currentPlan?.price}/month
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handlePlanChange(selectedPlan?.plan_id, "upgrade")}>Confirm Change</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Subscription Confirmation</DialogTitle>
              <DialogDescription>Review and confirm your plan subscription</DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedPlan.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Speed: {selectedPlan.speed}</p>
                    <p>Data Limit: {selectedPlan.data_limit_gb} GB</p>
                    <p>Validity: {selectedPlan.validity_days} days</p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Payment Integration in Development</p>
                    <p>
                      This is the development phase. Payment methods are not yet integrated. Please contact{" "}
                      <span className="font-medium">admin@networksolutions.com</span> to complete your subscription
                      manually.
                    </p>
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-900 text-center">₹{selectedPlan.price}</div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmSubscription}>Proceed to Payment</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
