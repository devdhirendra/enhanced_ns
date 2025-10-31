"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, Zap, CheckCircle, ArrowUp, AlertCircle, Lock, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"

export default function CustomerPlanPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [planHistory, setPlanHistory] = useState<any[]>([])
  const [historySortBy, setHistorySortBy] = useState("date")
  const [historyPage, setHistoryPage] = useState(1)
  const historyPerPage = 5
  const [loadingCurrentPlan, setLoadingCurrentPlan] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (user?.user_id) {
      Promise.all([fetchPlans(), fetchCurrentSubscription(), fetchPlanHistory()])
    }
  }, [user?.user_id])

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
      setLoadingCurrentPlan(true)
      if (user?.user_id) {
        const subscription = await planSubscriptionApi.getActiveSubscription(user.user_id)
        if (subscription) {
          setCurrentPlan(subscription)
        }
      }
    } catch (error) {
      console.error("Error fetching current subscription:", error)
    } finally {
      setLoadingCurrentPlan(false)
    }
  }

  const fetchPlanHistory = async () => {
    try {
      setLoadingHistory(true)
      if (user?.user_id) {
        const history = await planSubscriptionApi.getSubscriptionHistory(user.user_id)
        setPlanHistory(Array.isArray(history) ? history : [])
      }
    } catch (error) {
      console.error("Error fetching plan history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch plan history",
        variant: "destructive",
      })
    } finally {
      setLoadingHistory(false)
    }
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

      setIsPaymentDialogOpen(false)
    } catch (error) {
      console.error("Error subscribing to plan:", error)
      toast({
        title: "Error",
        description: "Failed to subscribe to plan",
        variant: "destructive",
      })
    }
  }

  const getSortedHistory = () => {
    if (!planHistory.length) return []
    const sorted = [...planHistory]
    if (historySortBy === "date") {
      sorted.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime())
    } else if (historySortBy === "price") {
      sorted.sort((a, b) => (b.plan_id || 0) - (a.plan_id || 0))
    }
    return sorted
  }

  const sortedHistory = getSortedHistory()
  const paginatedHistory = sortedHistory.slice((historyPage - 1) * historyPerPage, historyPage * historyPerPage)
  const totalHistoryPages = Math.ceil(sortedHistory.length / historyPerPage)

  return (
    <DashboardLayout title="Plan Management" description="Manage your internet subscription and billing">
      <div className="space-y-6">
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Plan</TabsTrigger>
            <TabsTrigger value="available">Available Plans</TabsTrigger>
            <TabsTrigger value="history">Plan History</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {loadingCurrentPlan ? (
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg animate-pulse" />
              </div>
            ) : currentPlan?.subscription_id ? (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {currentPlan.name || "Active Plan"}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-2">Your current subscription</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                        {currentPlan.status || "Active"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 text-lg">Subscription Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-600">Plan Speed:</span>
                          <span className="font-semibold text-gray-900">{currentPlan.speed || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-600">Monthly Price:</span>
                          <span className="font-bold text-blue-600 text-lg">₹{currentPlan.price || "0"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-600">Start Date:</span>
                          <span className="font-semibold text-gray-900">{formatDate(currentPlan.start_date)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-600">End Date:</span>
                          <span className="font-semibold text-gray-900">{formatDate(currentPlan.end_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 text-lg">Status & Duration</h4>
                      <div className="p-6 bg-white rounded-lg border border-green-200 space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-600 rounded-full" />
                          <span className="text-green-700 font-semibold">Active & Running</span>
                        </div>
                        <div className="pt-4 border-t border-green-100">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600">
                              {Math.max(
                                0,
                                Math.floor(
                                  (new Date(currentPlan.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                                ),
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-2">Days remaining in plan</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={fetchCurrentSubscription}>
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Refresh Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                  <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Plan</h3>
                  <p className="text-gray-600 mb-6">Subscribe to a plan to get started with our services</p>
                  <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Browse Available Plans
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading plans...</p>
              </div>
            ) : availablePlans.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No plans available at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlans.map((plan) => (
                  <Card
                    key={plan.plan_id}
                    className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg font-bold text-gray-900">
                        <Zap className="h-5 w-5 mr-2 text-blue-600" />
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">{plan.speed}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">₹{plan.price}</div>
                          <p className="text-sm text-gray-600 mt-1">per {plan.validity_days} days</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Data Limit:</span>
                          <span className="font-semibold">{plan.data_limit_gb} GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Connections:</span>
                          <span className="font-semibold">{plan.max_customers}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                        onClick={() => handleSubscribeToPlan(plan)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Subscribe Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Plan Change History</CardTitle>
                    <CardDescription className="text-gray-600">Your subscription history</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={historySortBy} onValueChange={setHistorySortBy}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Newest First</SelectItem>
                        <SelectItem value="price">Plan ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchPlanHistory} disabled={loadingHistory}>
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingHistory ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading history...</p>
                    </div>
                  ) : paginatedHistory && paginatedHistory.length > 0 ? (
                    <>
                      {paginatedHistory.map((history: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                history.status === "Active"
                                  ? "bg-green-100"
                                  : history.status === "Paused"
                                    ? "bg-yellow-100"
                                    : history.status === "Expired"
                                      ? "bg-gray-100"
                                      : "bg-blue-100"
                              }`}
                            >
                              <Wifi
                                className={`h-5 w-5 ${
                                  history.status === "Active"
                                    ? "text-green-600"
                                    : history.status === "Paused"
                                      ? "text-yellow-600"
                                      : history.status === "Expired"
                                        ? "text-gray-600"
                                        : "text-blue-600"
                                }`}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">Plan ID: {history.plan_id}</h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(history.start_date)} to {formatDate(history.end_date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={
                                history.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : history.status === "Paused"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : history.status === "Expired"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-blue-100 text-blue-800"
                              }
                            >
                              {history.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {totalHistoryPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                            disabled={historyPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-gray-600">
                            Page {historyPage} of {totalHistoryPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHistoryPage(Math.min(totalHistoryPages, historyPage + 1))}
                            disabled={historyPage === totalHistoryPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No plan history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Subscription Confirmation</DialogTitle>
              <DialogDescription>Review and confirm your plan subscription</DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedPlan.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Speed: {selectedPlan.speed}</p>
                    <p>Data Limit: {selectedPlan.data_limit_gb} GB</p>
                    <p>Validity: {selectedPlan.validity_days} days</p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Payment in Development</p>
                    <p>
                      Contact <span className="font-medium">admin@networksolutions.com</span> to complete your
                      subscription.
                    </p>
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-900 text-center">₹{selectedPlan.price}</div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmSubscription} className="bg-blue-600 hover:bg-blue-700">
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
