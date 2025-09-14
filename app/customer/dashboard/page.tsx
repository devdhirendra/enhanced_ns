"use client"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wifi,
  CreditCard,
  LifeBuoy,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  TrendingUp,
  FileText,
  Bell,
  Gift,
  Settings,
  MessageSquare,
  Plus,
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useState } from "react"

// Demo data
const customerData = {
  name: "Amit Sharma",
  customerId: "CUST-2024-001",
  phone: "+91 9876543214",
  email: "amit@example.com",
  address: "House 123, Sector 15, Chandigarh",
  connectionDate: "2024-01-15",
  status: "active",
}

const planDetails = {
  planName: "Fiber Pro 100",
  speed: { download: 100, upload: 100 },
  dataLimit: "Unlimited",
  monthlyRate: 999,
  validity: 30,
  nextRenewal: "2024-02-15",
  daysLeft: 12,
  autoRenewal: true,
}

const usageData = [
  { date: "01", download: 45, upload: 12 },
  { date: "02", download: 52, upload: 15 },
  { date: "03", download: 38, upload: 10 },
  { date: "04", download: 65, upload: 18 },
  { date: "05", download: 48, upload: 14 },
  { date: "06", download: 72, upload: 22 },
  { date: "07", download: 55, upload: 16 },
]

const billingHistory = [
  { id: 1, month: "January 2024", amount: 999, dueDate: "2024-01-15", paidDate: "2024-01-14", status: "paid" },
  { id: 2, month: "December 2023", amount: 999, dueDate: "2023-12-15", paidDate: "2023-12-13", status: "paid" },
  { id: 3, month: "November 2023", amount: 999, dueDate: "2023-11-15", paidDate: "2023-11-16", status: "paid" },
  { id: 4, month: "February 2024", amount: 999, dueDate: "2024-02-15", paidDate: null, status: "pending" },
]

const supportTickets = [
  {
    id: 1,
    subject: "Internet connectivity issue",
    status: "open",
    priority: "high",
    created: "2024-01-10",
    updated: "2024-01-11",
  },
  {
    id: 2,
    subject: "Billing inquiry",
    status: "resolved",
    priority: "medium",
    created: "2024-01-05",
    updated: "2024-01-06",
  },
]

const networkStatus = {
  connectionStatus: "online",
  signalStrength: 85,
  latency: 12,
  lastOutage: "2024-01-08 14:30",
  uptime: "99.8%",
}

const announcements = [
  {
    id: 1,
    title: "Network Maintenance Scheduled",
    message: "Scheduled maintenance on Feb 20, 2024 from 2:00 AM to 4:00 AM. Minimal service disruption expected.",
    type: "maintenance",
    date: "2024-02-15",
    priority: "medium",
  },
  {
    id: 2,
    title: "New Speed Upgrade Available",
    message: "Upgrade to our new 200 Mbps plan at just ₹1299/month. Limited time offer!",
    type: "offer",
    date: "2024-02-14",
    priority: "high",
  },
  {
    id: 3,
    title: "Payment Gateway Update",
    message: "We've added new payment options including cryptocurrency and digital wallets.",
    type: "update",
    date: "2024-02-12",
    priority: "low",
  },
]

const offers = [
  {
    id: 1,
    title: "Valentine's Special",
    description: "Get 50% off on your next bill payment",
    discount: "50%",
    validTill: "2024-02-29",
    code: "LOVE50",
    type: "discount",
  },
  {
    id: 2,
    title: "Refer & Earn",
    description: "Refer friends and earn ₹500 cashback",
    discount: "₹500",
    validTill: "2024-03-31",
    code: "REFER500",
    type: "cashback",
  },
  {
    id: 3,
    title: "Speed Boost",
    description: "Free speed upgrade for 3 months",
    discount: "Free",
    validTill: "2024-02-25",
    code: "BOOST3M",
    type: "upgrade",
  },
]

const complaints = [
  {
    id: 1,
    subject: "Slow internet speed during peak hours",
    description: "Internet speed drops significantly between 7-10 PM",
    status: "in-progress",
    priority: "high",
    created: "2024-02-10",
    category: "technical",
  },
  {
    id: 2,
    subject: "Billing discrepancy",
    description: "Charged extra amount in last month's bill",
    status: "resolved",
    priority: "medium",
    created: "2024-02-05",
    category: "billing",
  },
]

export default function CustomerDashboard() {
  const currentUsage = usageData[usageData.length - 1]
  const pendingBill = billingHistory.find((bill) => bill.status === "pending")

  const [speedRange, setSpeedRange] = useState([100])
  const [priceRange, setPriceRange] = useState([999])
  const [dataLimitRange, setDataLimitRange] = useState([100])
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false)
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)
  const [newComplaint, setNewComplaint] = useState({
    subject: "",
    description: "",
    category: "technical",
    priority: "medium",
  })

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "bg-orange-100 text-orange-800"
      case "offer":
        return "bg-green-100 text-green-800"
      case "update":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOfferColor = (type: string) => {
    switch (type) {
      case "discount":
        return "bg-red-100 text-red-800"
      case "cashback":
        return "bg-green-100 text-green-800"
      case "upgrade":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleComplaintSubmit = () => {
    // In a real app, this would submit to API
    console.log("Complaint submitted:", newComplaint)
    setNewComplaint({
      subject: "",
      description: "",
      category: "technical",
      priority: "medium",
    })
    setIsComplaintDialogOpen(false)
  }

  return (
    <DashboardLayout title="Customer Dashboard" description={`Welcome back, ${customerData.name}`}>
      <div className="space-y-8">
        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Connection Status</CardTitle>
              <Wifi
                className={`h-5 w-5 ${networkStatus.connectionStatus === "online" ? "text-green-600" : "text-red-600"}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 capitalize">{networkStatus.connectionStatus}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  className={networkStatus.connectionStatus === "online" ? "status-active" : "bg-red-100 text-red-800"}
                >
                  {networkStatus.signalStrength}% signal
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">{networkStatus.uptime} uptime</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Plan</CardTitle>
              <Zap className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{planDetails.planName}</div>
              <p className="text-sm text-gray-600 mt-1">
                {planDetails.speed.download} Mbps / {planDetails.dataLimit}
              </p>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600 font-medium">{planDetails.daysLeft} days left</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Bill</CardTitle>
              <CreditCard className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">₹{planDetails.monthlyRate}</div>
              {pendingBill ? (
                <div className="flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600 font-medium">Payment due</span>
                </div>
              ) : (
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Paid</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Due: {planDetails.nextRenewal}</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Support Tickets</CardTitle>
              <LifeBuoy className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{supportTickets.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-red-100 text-red-800 text-xs">
                  {supportTickets.filter((t) => t.status === "open").length} open
                </Badge>
                <Badge className="status-active text-xs">
                  {supportTickets.filter((t) => t.status === "resolved").length} resolved
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Customization with Sliders */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Plan Customization
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </CardTitle>
            <CardDescription>Adjust your plan preferences with our interactive sliders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Preferred Speed (Mbps)</Label>
                  <div className="mt-3">
                    <Slider
                      value={speedRange}
                      onValueChange={setSpeedRange}
                      max={500}
                      min={25}
                      step={25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>25 Mbps</span>
                      <span className="font-medium text-pink-600">{speedRange[0]} Mbps</span>
                      <span>500 Mbps</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Higher speeds are perfect for streaming, gaming, and multiple devices
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Budget Range (₹/month)</Label>
                  <div className="mt-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={3000}
                      min={299}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>₹299</span>
                      <span className="font-medium text-pink-600">₹{priceRange[0]}</span>
                      <span>₹3000</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Find plans that fit your budget perfectly</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Data Allowance (GB/day)</Label>
                  <div className="mt-3">
                    <Slider
                      value={dataLimitRange}
                      onValueChange={setDataLimitRange}
                      max={200}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>10 GB</span>
                      <span className="font-medium text-pink-600">
                        {dataLimitRange[0] >= 150 ? "Unlimited" : `${dataLimitRange[0]} GB`}
                      </span>
                      <span>Unlimited</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Choose data limits based on your usage patterns</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Recommended Plan</h4>
                  <p className="text-sm text-gray-600">
                    Based on your preferences: {speedRange[0]} Mbps, ₹{priceRange[0]}/month
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  View Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Details Card */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              My Internet Plan
              <Button variant="outline" size="sm">
                Upgrade Plan
              </Button>
            </CardTitle>
            <CardDescription>Your current subscription details and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Plan Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan Name:</span>
                      <span className="font-medium">{planDetails.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speed:</span>
                      <span className="font-medium">{planDetails.speed.download} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Limit:</span>
                      <span className="font-medium">{planDetails.dataLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rate:</span>
                      <span className="font-medium">₹{planDetails.monthlyRate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Current Usage</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Download</span>
                        <span className="text-sm font-medium">{currentUsage.download} GB</span>
                      </div>
                      <Progress value={currentUsage.download} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Upload</span>
                        <span className="text-sm font-medium">{currentUsage.upload} GB</span>
                      </div>
                      <Progress value={currentUsage.upload} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Renewal Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Renewal:</span>
                      <span className="font-medium">{planDetails.nextRenewal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Left:</span>
                      <span className="font-medium text-orange-600">{planDetails.daysLeft} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auto Renewal:</span>
                      <Badge className={planDetails.autoRenewal ? "status-active" : "bg-gray-100 text-gray-800"}>
                        {planDetails.autoRenewal ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Chart */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Data Usage Trend</CardTitle>
            <CardDescription>Your daily internet usage over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Area
                  type="monotone"
                  dataKey="download"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorDownload)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="upload"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorUpload)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Announcements & Offers Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Announcements */}
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Announcements
                </CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </div>
              <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>All Announcements</DialogTitle>
                    <DialogDescription>Stay updated with the latest news and updates</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                          <Badge className={getAnnouncementColor(announcement.type)}>{announcement.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                        <p className="text-xs text-gray-500">{announcement.date}</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.slice(0, 2).map((announcement) => (
                  <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{announcement.title}</h4>
                      <Badge className={getAnnouncementColor(announcement.type)} size="sm">
                        {announcement.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{announcement.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{announcement.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Offers */}
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-green-600" />
                  Special Offers
                </CardTitle>
                <CardDescription>Exclusive deals and promotions for you</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offers.slice(0, 2).map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{offer.title}</h4>
                        <p className="text-sm text-gray-600">{offer.description}</p>
                      </div>
                      <Badge className={getOfferColor(offer.type)} size="sm">
                        {offer.discount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-gray-500">
                        Code: <span className="font-mono font-medium">{offer.code}</span>
                      </div>
                      <div className="text-xs text-gray-500">Valid till: {offer.validTill}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing and Support */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Bills */}
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>Your billing history and payments</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{bill.month}</h4>
                      <p className="text-sm text-gray-600">Due: {bill.dueDate}</p>
                      {bill.paidDate && <p className="text-xs text-gray-500">Paid: {bill.paidDate}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{bill.amount}</p>
                      <Badge className={bill.status === "paid" ? "status-active" : "bg-red-100 text-red-800"}>
                        {bill.status}
                      </Badge>
                      {bill.status === "pending" && (
                        <Button size="sm" className="mt-2">
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-orange-600" />
                  Support & Complaints
                </CardTitle>
                <CardDescription>Manage your support requests and complaints</CardDescription>
              </div>
              <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Complaint
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit New Complaint</DialogTitle>
                    <DialogDescription>Describe your issue and we'll get back to you within 24 hours</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={newComplaint.subject}
                        onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
                        placeholder="Brief description of the issue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newComplaint.description}
                        onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                        placeholder="Provide detailed information about your complaint"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newComplaint.category}
                          onValueChange={(value) => setNewComplaint({ ...newComplaint, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="service">Service Quality</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newComplaint.priority}
                          onValueChange={(value) => setNewComplaint({ ...newComplaint, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsComplaintDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleComplaintSubmit} className="bg-orange-600 hover:bg-orange-700">
                      Submit Complaint
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tickets" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
                  <TabsTrigger value="complaints">Complaints</TabsTrigger>
                </TabsList>
                <TabsContent value="tickets" className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                        <p className="text-sm text-gray-600">Created: {ticket.created}</p>
                        <p className="text-xs text-gray-500">Updated: {ticket.updated}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex space-x-2">
                          <Badge className={`priority-${ticket.priority}`}>{ticket.priority}</Badge>
                          <Badge
                            className={ticket.status === "resolved" ? "status-active" : "bg-blue-100 text-blue-800"}
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="complaints" className="space-y-4">
                  {complaints.map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{complaint.subject}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">{complaint.description}</p>
                        <p className="text-xs text-gray-500">Created: {complaint.created}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex space-x-2">
                          <Badge className={`priority-${complaint.priority}`}>{complaint.priority}</Badge>
                          <Badge
                            className={
                              complaint.status === "resolved" ? "status-active" : "bg-orange-100 text-orange-800"
                            }
                          >
                            {complaint.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Track Status
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Network Status */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Network Status</CardTitle>
            <CardDescription>Real-time connection and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">Connection</h3>
                <p className="text-2xl font-bold text-green-600 capitalize">{networkStatus.connectionStatus}</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Wifi className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Signal Strength</h3>
                <p className="text-2xl font-bold text-blue-600">{networkStatus.signalStrength}%</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">Latency</h3>
                <p className="text-2xl font-bold text-purple-600">{networkStatus.latency}ms</p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900">Uptime</h3>
                <p className="text-2xl font-bold text-orange-600">{networkStatus.uptime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Button className="h-16 flex flex-col items-center justify-center space-y-2">
            <CreditCard className="h-5 w-5" />
            <span>Pay Bill</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2 bg-transparent">
            <LifeBuoy className="h-5 w-5" />
            <span>Get Support</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2 bg-transparent">
            <Zap className="h-5 w-5" />
            <span>Upgrade Plan</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2 bg-transparent">
            <FileText className="h-5 w-5" />
            <span>Download Invoice</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
