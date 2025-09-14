"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  CreditCard,
  IndianRupee,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
  Receipt,
  Save,
  Download,
  FileText,
} from "lucide-react"

// Mock data for cash collections
const mockCollections = [
  {
    id: "COL-001",
    customer: {
      name: "Rajesh Kumar",
      phone: "+91 9876543210",
      address: "House 123, Sector 15, Chandigarh",
      customerId: "CUST-001",
    },
    amount: 1500,
    billNumber: "BILL-2024-001",
    collectionDate: "2024-01-20",
    collectionTime: "10:30 AM",
    paymentMethod: "cash",
    status: "collected",
    dueDate: "2024-01-20",
    serviceType: "Monthly Internet",
    notes: "Collected full amount",
    receiptNumber: "RCP-001",
  },
  {
    id: "COL-002",
    customer: {
      name: "Priya Singh",
      phone: "+91 9876543211",
      address: "Flat 45, Sector 22, Chandigarh",
      customerId: "CUST-002",
    },
    amount: 2200,
    billNumber: "BILL-2024-002",
    collectionDate: "2024-01-20",
    collectionTime: "2:15 PM",
    paymentMethod: "cash",
    status: "collected",
    dueDate: "2024-01-18",
    serviceType: "Internet + Cable TV",
    notes: "Customer paid with exact change",
    receiptNumber: "RCP-002",
  },
  {
    id: "COL-003",
    customer: {
      name: "Amit Sharma",
      phone: "+91 9876543212",
      address: "Shop 67, Sector 35, Chandigarh",
      customerId: "CUST-003",
    },
    amount: 3500,
    billNumber: "BILL-2024-003",
    collectionDate: null,
    collectionTime: null,
    paymentMethod: null,
    status: "pending",
    dueDate: "2024-01-22",
    serviceType: "Business Internet",
    notes: "Customer not available, will visit again",
    receiptNumber: null,
  },
  {
    id: "COL-004",
    customer: {
      name: "Neha Gupta",
      phone: "+91 9876543213",
      address: "House 89, Sector 18, Chandigarh",
      customerId: "CUST-004",
    },
    amount: 1800,
    billNumber: "BILL-2024-004",
    collectionDate: "2024-01-19",
    collectionTime: "4:45 PM",
    paymentMethod: "cash",
    status: "partial",
    dueDate: "2024-01-19",
    serviceType: "Monthly Internet",
    notes: "Collected ₹1000, remaining ₹800 pending",
    receiptNumber: "RCP-003",
    partialAmount: 1000,
  },
]

export default function CollectionPage() {
  const [collections, setCollections] = useState(mockCollections)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCollectionDialog, setShowCollectionDialog] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<any>(null)
  const [collectionAmount, setCollectionAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [collectionNotes, setCollectionNotes] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      collection.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.customer.phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || collection.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "collected":
        return "bg-green-100 text-green-800"
      case "partial":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "collected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleCollectPayment = () => {
    if (!selectedCollection || !collectionAmount) {
      alert("Please enter collection amount")
      return
    }

    const amount = Number.parseFloat(collectionAmount)
    const remainingAmount =
      selectedCollection.status === "partial"
        ? selectedCollection.amount - (selectedCollection.partialAmount || 0)
        : selectedCollection.amount

    let newStatus = "collected"
    let partialAmount = null

    if (amount < remainingAmount) {
      newStatus = "partial"
      partialAmount = (selectedCollection.partialAmount || 0) + amount
    }

    setCollections(
      collections.map((collection) =>
        collection.id === selectedCollection.id
          ? {
              ...collection,
              status: newStatus,
              collectionDate: new Date().toISOString().split("T")[0],
              collectionTime: new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              paymentMethod: paymentMethod,
              notes: collectionNotes,
              receiptNumber: `RCP-${Date.now()}`,
              partialAmount: partialAmount,
            }
          : collection,
      ),
    )

    setHasChanges(true)
    setShowCollectionDialog(false)
    setCollectionAmount("")
    setCollectionNotes("")
    setSelectedCollection(null)
  }

  const handleApplyChanges = () => {
    console.log("Applying collection changes:", collections)
    setHasChanges(false)
  }

  const collectionStats = {
    total: collections.length,
    collected: collections.filter((c) => c.status === "collected").length,
    pending: collections.filter((c) => c.status === "pending").length,
    partial: collections.filter((c) => c.status === "partial").length,
    totalAmount: collections.reduce((acc, c) => acc + c.amount, 0),
    collectedAmount:
      collections.filter((c) => c.status === "collected").reduce((acc, c) => acc + c.amount, 0) +
      collections.filter((c) => c.status === "partial").reduce((acc, c) => acc + (c.partialAmount || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Collection</h1>
          <p className="text-gray-500">Collect payments from customers and track collections</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button onClick={handleApplyChanges} className="bg-orange-600 hover:bg-orange-700">
              <Save className="h-4 w-4 mr-2" />
              Apply Changes
            </Button>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">₹{collectionStats.collectedAmount}</div>
            <p className="text-xs text-green-600 mt-1">{collectionStats.collected} payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              ₹{collectionStats.totalAmount - collectionStats.collectedAmount}
            </div>
            <p className="text-xs text-orange-600 mt-1">{collectionStats.pending} payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Partial</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{collectionStats.partial}</div>
            <p className="text-xs text-yellow-600 mt-1">Partial payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Collection Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {Math.round((collectionStats.collectedAmount / collectionStats.totalAmount) * 100)}%
            </div>
            <p className="text-xs text-blue-600 mt-1">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Collections List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Payment Collections</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredCollections.map((collection) => (
            <div
              key={collection.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
                    <h3 className="font-medium text-gray-900">{collection.customer.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{collection.billNumber}</Badge>
                      <Badge className="bg-blue-100 text-blue-800">{collection.serviceType}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{collection.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{collection.customer.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{collection.customer.address}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="h-4 w-4" />
                        <span className="font-medium">Amount: ₹{collection.amount}</span>
                        {collection.status === "partial" && collection.partialAmount && (
                          <span className="text-yellow-600">(₹{collection.partialAmount} collected)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {collection.dueDate}</span>
                      </div>
                    </div>
                    {collection.notes && (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="italic">{collection.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 lg:ml-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(collection.status)}
                    <Badge className={getStatusColor(collection.status)}>{collection.status.toUpperCase()}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(collection.status === "pending" || collection.status === "partial") && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCollection(collection)
                          setShowCollectionDialog(true)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Collect
                      </Button>
                    )}

                    {collection.receiptNumber && (
                      <Button size="sm" variant="outline">
                        <Receipt className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    )}

                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Collection Details - {collection.billNumber}</DialogTitle>
                        </DialogHeader>
                        <CollectionDetailsModal collection={collection} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Collection Dialog */}
      <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>Record payment collection from {selectedCollection?.customer.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Bill Amount</Label>
                  <p className="text-lg font-bold">₹{selectedCollection?.amount}</p>
                </div>
                <div>
                  <Label className="font-medium">Due Date</Label>
                  <p>{selectedCollection?.dueDate}</p>
                </div>
                {selectedCollection?.status === "partial" && selectedCollection?.partialAmount && (
                  <>
                    <div>
                      <Label className="font-medium">Already Collected</Label>
                      <p className="text-green-600 font-medium">₹{selectedCollection.partialAmount}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Remaining</Label>
                      <p className="text-orange-600 font-medium">
                        ₹{selectedCollection.amount - selectedCollection.partialAmount}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Collection Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={collectionAmount}
                onChange={(e) => setCollectionAmount(e.target.value)}
                placeholder="Enter amount collected"
                max={
                  selectedCollection?.status === "partial"
                    ? selectedCollection.amount - (selectedCollection.partialAmount || 0)
                    : selectedCollection?.amount
                }
              />
            </div>

            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Collection Notes</Label>
              <Textarea
                id="notes"
                value={collectionNotes}
                onChange={(e) => setCollectionNotes(e.target.value)}
                placeholder="Add any notes about the collection..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCollectPayment} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Record Collection
              </Button>
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Collection Details Modal Component
function CollectionDetailsModal({ collection }: { collection: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="font-medium">Customer</Label>
          <p className="text-gray-600">{collection.customer.name}</p>
        </div>
        <div>
          <Label className="font-medium">Phone</Label>
          <p className="text-gray-600">{collection.customer.phone}</p>
        </div>
        <div>
          <Label className="font-medium">Bill Number</Label>
          <p className="text-gray-600">{collection.billNumber}</p>
        </div>
        <div>
          <Label className="font-medium">Service Type</Label>
          <p className="text-gray-600">{collection.serviceType}</p>
        </div>
        <div>
          <Label className="font-medium">Amount</Label>
          <p className="text-gray-600 font-bold">₹{collection.amount}</p>
        </div>
        <div>
          <Label className="font-medium">Due Date</Label>
          <p className="text-gray-600">{collection.dueDate}</p>
        </div>
        <div>
          <Label className="font-medium">Status</Label>
          <Badge className={getStatusColor(collection.status)}>{collection.status.toUpperCase()}</Badge>
        </div>
        {collection.receiptNumber && (
          <div>
            <Label className="font-medium">Receipt Number</Label>
            <p className="text-gray-600">{collection.receiptNumber}</p>
          </div>
        )}
      </div>

      <div>
        <Label className="font-medium">Address</Label>
        <p className="text-gray-600 mt-1">{collection.customer.address}</p>
      </div>

      {collection.collectionDate && (
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Collection Date</Label>
              <p className="text-gray-600">{collection.collectionDate}</p>
            </div>
            <div>
              <Label className="font-medium">Collection Time</Label>
              <p className="text-gray-600">{collection.collectionTime}</p>
            </div>
            <div>
              <Label className="font-medium">Payment Method</Label>
              <p className="text-gray-600 capitalize">{collection.paymentMethod}</p>
            </div>
            {collection.partialAmount && (
              <div>
                <Label className="font-medium">Collected Amount</Label>
                <p className="text-green-600 font-medium">₹{collection.partialAmount}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {collection.notes && (
        <div>
          <Label className="font-medium">Notes</Label>
          <p className="text-gray-600 mt-1">{collection.notes}</p>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case "collected":
      return "bg-green-100 text-green-800"
    case "partial":
      return "bg-yellow-100 text-yellow-800"
    case "pending":
      return "bg-orange-100 text-orange-800"
    case "failed":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
