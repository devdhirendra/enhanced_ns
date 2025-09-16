"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface ComplaintReplyFormProps {
  complaintId: string
  onClose: () => void
  onSuccess: () => void
  userId?: string // Add this line
}

export default function ComplaintReplyForm({ complaintId, onClose, onSuccess }: ComplaintReplyFormProps) {
  const [formData, setFormData] = useState({
    message: "",
    status: "in-progress",
    isInternal: false,
    nextAction: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Reply sent successfully!")
    console.log("Reply submitted:", { complaintId, ...formData })

    if (onSuccess) {
      onSuccess()
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Reply to Complaint</h3>
        
        <div>
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Type your response to the customer..."
            rows={6}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Update Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="nextAction">Next Action Required</Label>
            <Select value={formData.nextAction} onValueChange={(value) => setFormData({ ...formData, nextAction: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select next action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer-response">Awaiting Customer Response</SelectItem>
                <SelectItem value="technical-visit">Schedule Technical Visit</SelectItem>
                <SelectItem value="billing-review">Billing Review Required</SelectItem>
                <SelectItem value="escalation">Escalate to Manager</SelectItem>
                <SelectItem value="none">No Further Action</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Send Reply
        </Button>
      </div>
    </form>
  )
}
