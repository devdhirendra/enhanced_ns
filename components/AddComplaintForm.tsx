"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface AddComplaintFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function AddComplaintForm({ onClose, onSuccess }: AddComplaintFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "technical",
    priority: "medium",
    customerInfo: {
      name: "",
      email: "",
      phone: "",
      customerId: "",
    },
    source: "phone",
    assignedTo: "",
    expectedResolution: "",
    attachments: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(`Complaint "${formData.title}" created successfully!`)
    console.log("Form submitted:", formData)

    if (onSuccess) {
      onSuccess()
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="title">Complaint Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information about the complaint..."
              rows={4}
              required
            />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="service">Service Quality</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="support">Customer Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="inperson">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerInfo.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                customerInfo: { ...formData.customerInfo, name: e.target.value }
              })}
              required
            />
          </div>
          <div>
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              value={formData.customerInfo.customerId}
              onChange={(e) => setFormData({ 
                ...formData, 
                customerInfo: { ...formData.customerInfo, customerId: e.target.value }
              })}
            />
          </div>
          <div>
            <Label htmlFor="customerEmail">Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerInfo.email}
              onChange={(e) => setFormData({ 
                ...formData, 
                customerInfo: { ...formData.customerInfo, email: e.target.value }
              })}
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              value={formData.customerInfo.phone}
              onChange={(e) => setFormData({ 
                ...formData, 
                customerInfo: { ...formData.customerInfo, phone: e.target.value }
              })}
              required
            />
          </div>
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Assignment & Resolution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech-team">Technical Team</SelectItem>
                <SelectItem value="billing-team">Billing Team</SelectItem>
                <SelectItem value="support-team">Support Team</SelectItem>
                <SelectItem value="field-team">Field Team</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expectedResolution">Expected Resolution Date</Label>
            <Input
              id="expectedResolution"
              type="date"
              value={formData.expectedResolution}
              onChange={(e) => setFormData({ ...formData, expectedResolution: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Create Complaint
        </Button>
      </div>
    </form>
  )
}
