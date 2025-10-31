"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { planSubscriptionApi } from "@/lib/plan-subscription-api"
import { useAuth } from "@/contexts/AuthContext"

interface SubscriptionStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: any
  onSuccess?: () => void
}

export function SubscriptionStatusDialog({
  open,
  onOpenChange,
  subscription,
  onSuccess,
}: SubscriptionStatusDialogProps) {
  const [newStatus, setNewStatus] = useState(subscription?.status || "Active")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleStatusChange = async () => {
    if (!subscription) return

    try {
      setLoading(true)
      await planSubscriptionApi.updateSubscriptionStatus(subscription.subscription_id, {
        status: newStatus as any,
        reason,
        admin_id: user?.user_id || "",
      })

      toast({
        title: "Success",
        description: `Subscription status changed to ${newStatus}`,
      })

      onSuccess?.()
      onOpenChange(false)
      setNewStatus("Active")
      setReason("")
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

  if (!subscription) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Subscription Status</DialogTitle>
          <DialogDescription>Update the subscription status and add a reason if needed</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Subscription Info */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Customer</p>
            <p className="font-medium text-gray-900">{subscription.user_info?.name || "N/A"}</p>
            <p className="text-xs text-gray-600">{subscription.user_info?.email || "N/A"}</p>
          </div>

          {/* Current Status */}
          <div>
            <Label className="text-gray-600">Current Status</Label>
            <Badge
              className={
                subscription.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : subscription.status === "Paused"
                    ? "bg-yellow-100 text-yellow-800"
                    : subscription.status === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
              }
            >
              {subscription.status}
            </Badge>
          </div>

          {/* New Status */}
          <div>
            <Label htmlFor="status">Change Status To *</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={loading || newStatus === subscription.status}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubscriptionStatusDialog
