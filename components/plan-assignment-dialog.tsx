"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { useAuth } from "@/contexts/AuthContext"

interface PlanAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: any
  onSuccess?: () => void
}

export function PlanAssignmentDialog({ open, onOpenChange, plan, onSuccess }: PlanAssignmentDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [reason, setReason] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadAllCustomers()
    }
  }, [open])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = allCustomers.filter(
        (c) =>
          c.profileDetail?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.profileDetail?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setCustomers(filtered)
    } else {
      setCustomers([])
    }
  }, [searchTerm, allCustomers])

  const loadAllCustomers = async () => {
    try {
      setLoading(true)
      const response = await planSubscriptionApi.getAllCustomers()
      const customerList = Array.isArray(response) ? response : []
      setAllCustomers(customerList)
    } catch (error) {
      console.error("Error loading customers:", error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      })
      return
    }

    try {
      setAssigning(true)
      const customerId = selectedCustomer.user_id || selectedCustomer.id
      await planSubscriptionApi.subscribeToPlan(customerId, plan.plan_id)
      toast({
        title: "Success",
        description: `Plan assigned to ${selectedCustomer.profileDetail?.name || selectedCustomer.email}`,
      })
      onSuccess?.()
      onOpenChange(false)
      setSelectedCustomer(null)
      setReason("")
      setSearchTerm("")
    } catch (error) {
      console.error("Error assigning plan:", error)
      toast({
        title: "Error",
        description: "Failed to assign plan",
        variant: "destructive",
      })
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Plan to Customer</DialogTitle>
          <DialogDescription>Assign the {plan?.name} plan to a customer on their behalf</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Info */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{plan?.name}</p>
                <p className="text-sm text-gray-600">{plan?.speed}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₹{plan?.price}</p>
                <p className="text-xs text-gray-500">{plan?.validity_days} days</p>
              </div>
            </div>
          </div>

          {/* Customer Search */}
          <div>
            <Label htmlFor="customer-search">Search Customer by Name or Email</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="customer-search"
                placeholder="Type name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Customer List Dropdown */}
          {searchTerm && (
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 border-b-2 border-blue-600 mx-auto animate-spin" />
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No customers found</p>
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.user_id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCustomer?.user_id === customer.user_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{customer.profileDetail?.name || "N/A"}</p>
                        <p className="text-sm text-gray-600">{customer.profileDetail?.email || customer.email}</p>
                        <p className="text-xs text-gray-500">{customer.profileDetail?.phone || "N/A"}</p>
                      </div>
                      <Badge
                        className={
                          customer.profileDetail?.planStatus === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {customer.profileDetail?.planStatus || "none"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Selected Customer */}
          {selectedCustomer && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Selected Customer:</p>
              <p className="font-medium text-gray-900">
                {selectedCustomer.profileDetail?.name || selectedCustomer.email}
              </p>
              <p className="text-xs text-gray-600">{selectedCustomer.profileDetail?.email || selectedCustomer.email}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedCustomer || assigning}>
              {assigning ? "Assigning..." : "Assign Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
