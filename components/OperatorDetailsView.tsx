"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, DollarSign, Calendar, Phone, Mail, MapPin, HardHat, Edit, FileText } from "lucide-react"
import { toast } from "sonner"

interface Operator {
  id: string
  companyName: string
  ownerName: string
  phone: string
  email: string
  address: { state: string; district: string; area: string }
  gstNumber: string
  businessType: string
  technicianCount: number
  customerCount: number
  serviceCapacity: { connections: number; olts: number }
  planAssigned: string
  revenue: number
  status: string
  expiryDate: string
  lastRenewed: string
  nextBillDate: string
  createdAt: string
}

interface OperatorDetailsViewProps {
  operator: Operator
}

export default function OperatorDetailsView({ operator }: OperatorDetailsViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{operator.companyName}</h2>
            <p className="text-gray-600">{operator.ownerName}</p>
            {getStatusBadge(operator.status)}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Edit functionality opened")}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Invoice generated successfully!")}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">{operator.customerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HardHat className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Technicians</p>
                <p className="text-2xl font-bold text-gray-900">{operator.technicianCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{operator.revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Next Bill</p>
                <p className="text-sm font-medium text-gray-900">{operator.nextBillDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{operator.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{operator.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">
                  {operator.address.area}, {operator.address.district}, {operator.address.state}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Business Type</p>
              <p className="font-medium capitalize">{operator.businessType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">GST Number</p>
              <p className="font-medium">{operator.gstNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plan Assigned</p>
              <Badge variant="outline" className="capitalize">
                {operator.planAssigned}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Capacity</p>
              <p className="font-medium">
                {operator.serviceCapacity.connections} connections, {operator.serviceCapacity.olts} OLTs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
