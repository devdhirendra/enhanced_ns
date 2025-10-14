"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Receipt,
  Download,
  Eye,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function CustomerBillsPage() {
  const [dateRange, setDateRange] = useState([1, 12])
  const [amountRange, setAmountRange] = useState([0, 5000])
  const [searchTerm, setSearchTerm] = useState("")

  const bills = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      dueDate: "2024-01-30",
      amount: 1999,
      status: "paid",
      plan: "Premium Fiber 100 Mbps",
      period: "Jan 2024",
      paymentMethod: "UPI",
      paidDate: "2024-01-16",
    },
    {
      id: "INV-2023-012",
      date: "2023-12-15",
      dueDate: "2023-12-30",
      amount: 1999,
      status: "paid",
      plan: "Premium Fiber 100 Mbps",
      period: "Dec 2023",
      paymentMethod: "Credit Card",
      paidDate: "2023-12-18",
    },
    {
      id: "INV-2023-011",
      date: "2023-11-15",
      dueDate: "2023-11-30",
      amount: 1999,
      status: "paid",
      plan: "Premium Fiber 100 Mbps",
      period: "Nov 2023",
      paymentMethod: "Net Banking",
      paidDate: "2023-11-20",
    },
    {
      id: "INV-2023-010",
      date: "2023-10-15",
      dueDate: "2023-10-30",
      amount: 1999,
      status: "overdue",
      plan: "Premium Fiber 100 Mbps",
      period: "Oct 2023",
      paymentMethod: "",
      paidDate: "",
    },
  ]

  const currentBill = {
    id: "INV-2024-002",
    date: "2024-02-15",
    dueDate: "2024-02-28",
    amount: 1999,
    status: "pending",
    plan: "Premium Fiber 100 Mbps",
    period: "Feb 2024",
    breakdown: {
      planCharges: 1699,
      taxes: 300,
      additionalCharges: 0,
      discount: 0,
    },
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalPaid = bills.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.amount, 0)
  const avgMonthly = totalPaid / bills.filter((b) => b.status === "paid").length

  return (
    <DashboardLayout title="Bills & Invoices" description="View and manage your billing history">
      <div className="space-y-6">
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Bill</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
            <TabsTrigger value="analytics">Billing Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">Current Bill</CardTitle>
                    <CardDescription>Your current billing period charges</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(currentBill.amount)}</p>
                    <Badge className={getStatusColor(currentBill.status)}>
                      {currentBill.status.charAt(0).toUpperCase() + currentBill.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bill Date:</span>
                      <span className="font-medium">{formatDate(currentBill.date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <span className="font-medium text-red-600">{formatDate(currentBill.dueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Billing Period:</span>
                      <span className="font-medium">{currentBill.period}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Plan:</span>
                      <span className="font-medium">{currentBill.plan}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Bill Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Plan Charges:</span>
                        <span>{formatCurrency(currentBill.breakdown.planCharges)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Taxes & Fees:</span>
                        <span>{formatCurrency(currentBill.breakdown.taxes)}</span>
                      </div>
                      {currentBill.breakdown.additionalCharges > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Additional Charges:</span>
                          <span>{formatCurrency(currentBill.breakdown.additionalCharges)}</span>
                        </div>
                      )}
                      {currentBill.breakdown.discount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-600">Discount:</span>
                          <span className="text-green-600">-{formatCurrency(currentBill.breakdown.discount)}</span>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(currentBill.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Bills</CardTitle>
                <CardDescription>Filter your billing history by date and amount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Date Range: Last {dateRange[0]} - {dateRange[1]} months
                    </Label>
                    <Slider value={dateRange} onValueChange={setDateRange} max={12} step={1} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Amount Range: {formatCurrency(amountRange[0])} - {formatCurrency(amountRange[1])}
                    </Label>
                    <Slider
                      value={amountRange}
                      onValueChange={setAmountRange}
                      max={5000}
                      step={100}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search bills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bills Table */}
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your complete billing history and payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{bill.id}</div>
                            <div className="text-sm text-gray-500">{bill.plan}</div>
                          </div>
                        </TableCell>
                        <TableCell>{bill.period}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(bill.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(bill.status)}
                            <Badge className={getStatusColor(bill.status)}>
                              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{formatDate(bill.dueDate)}</div>
                            {bill.paidDate && (
                              <div className="text-xs text-green-600">Paid: {formatDate(bill.paidDate)}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                            {bill.status === "overdue" && (
                              <Button size="sm">
                                <CreditCard className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Paid</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalPaid)}</div>
                  <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Average Monthly</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(avgMonthly)}</div>
                  <p className="text-xs text-gray-500 mt-1">Per month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Bills Paid</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {bills.filter((b) => b.status === "paid").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">On time payments</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Next Due</CardTitle>
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">Feb 28</div>
                  <p className="text-xs text-gray-500 mt-1">2024</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Your payment history and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Methods Used</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">UPI</span>
                          <span className="font-medium">1 payment</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Credit Card</span>
                          <span className="font-medium">1 payment</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Net Banking</span>
                          <span className="font-medium">1 payment</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">On Time</span>
                          <span className="font-medium text-green-600">3 bills</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Overdue</span>
                          <span className="font-medium text-red-600">1 bill</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Success Rate</span>
                          <span className="font-medium">75%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
