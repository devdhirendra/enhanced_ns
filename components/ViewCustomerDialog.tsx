"use client"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Wifi, 
  CreditCard, 
  Calendar,
  Clock,
  AlertTriangle
} from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  customerId: string
  plan: string
  connectionStatus: string
  monthlyCharges: number
  address: string
  joinDate: string
  lastPayment: string
  outstandingAmount: number
  connectionType: string
}

interface ViewCustomerDialogProps {
  customer: Customer | null
  open: boolean
  onClose: () => void
}

export default function ViewCustomerDialog({ customer, open, onClose }: ViewCustomerDialogProps) {
  if (!customer) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
    }
  }

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "basic":
        return "Basic (50 Mbps)"
      case "standard":
        return "Standard (100 Mbps)"
      case "premium":
        return "Premium (200 Mbps)"
      case "enterprise":
        return "Enterprise (500 Mbps)"
      default:
        return plan
    }
  }

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case "fiber":
        return <Wifi className="h-5 w-5 text-blue-600" />
      case "broadband":
        return <Wifi className="h-5 w-5 text-green-600" />
      case "wireless":
        return <Wifi className="h-5 w-5 text-purple-600" />
      default:
        return <Wifi className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div>{customer.name}</div>
              <div className="text-sm font-normal text-gray-500">ID: {customer.customerId}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete customer information and service details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Plan Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  {getConnectionTypeIcon(customer.connectionType)}
                  <span>Service Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">{getPlanLabel(customer.plan)}</div>
                  <div className="text-sm text-gray-500 capitalize">{customer.connectionType} Connection</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(customer.connectionStatus)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Billing Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Rate:</span>
                    <span className="font-medium">₹{customer.monthlyCharges.toLocaleString()}</span>
                  </div>
                  {customer.outstandingAmount > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Outstanding:</span>
                      <span className="font-medium text-red-600">₹{customer.outstandingAmount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Outstanding:</span>
                      <span className="font-medium text-green-600">₹0</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-medium">{customer.phone || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium break-all">{customer.email}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <div className="font-medium">{customer.address || "Not provided"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Join Date</div>
                    <div className="font-medium">
                      {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Not available"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Last Payment</div>
                    <div className="font-medium">
                      {customer.lastPayment ? new Date(customer.lastPayment).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "No payments yet"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts and Warnings */}
          {customer.outstandingAmount > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Payment Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-red-700">
                  This customer has an outstanding amount of ₹{customer.outstandingAmount.toLocaleString()}. 
                  Please follow up for payment collection.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
