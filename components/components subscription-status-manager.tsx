"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { Pause, Play, X } from "lucide-react"

interface SubscriptionStatusManagerProps {
  subscription: any
  onStatusChange?: () => void
  adminId: string
}

export function SubscriptionStatusManager({ subscription, onStatusChange, adminId }: SubscriptionStatusManagerProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(subscription.status)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async () => {
    try {
      setLoading(true)
      await planSubscriptionApi.updateSubscriptionStatus(subscription.subscription_id, {
        status: newStatus as "Active" | "Paused" | "Cancelled" | "Expired",
        reason,
        admin_id: adminId,
      })
      toast({
        title: "Success",
        description: `Subscription status changed to ${newStatus}`,
      })
      setIsOpen(false)
      onStatusChange?.()
    } catch (error) {
      console.error("Error updating subscription status:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Paused":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Play className="h-4 w-4" />
      case "Paused":
        return <Pause className="h-4 w-4" />
      case "Cancelled":
        return <X className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <>
      <Badge className={getStatusColor(subscription.status)}>
        {getStatusIcon(subscription.status)}
        <span className="ml-1">{subscription.status}</span>
      </Badge>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="ml-2">
          Change Status
        </Button>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Subscription Status</DialogTitle>
            <DialogDescription>Update the status of this subscription</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for status change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusChange} disabled={loading}>
                {loading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
