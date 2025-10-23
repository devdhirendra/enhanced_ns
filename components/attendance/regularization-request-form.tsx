"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { attendanceApi } from "@/lib/attendance-api"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RegularizationRequestFormProps {
  userId: string
  onSuccess?: () => void
}

export function RegularizationRequestForm({ userId, onSuccess }: RegularizationRequestFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    checkInTime: "",
    checkOutTime: "",
    reason: "",
  })

// In the handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!formData.date || !formData.checkInTime || !formData.checkOutTime || !formData.reason) {
    toast({
      title: "Missing Fields",
      description: "Please fill in all required fields",
      variant: "destructive",
    })
    return
  }

  try {
    setLoading(true)
    // FIXED: Use the correct API structure
    const response = await attendanceApi.requestRegularization({
      userId,
      date: formData.date,
      checkIn: `${formData.date}T${formData.checkInTime}:00Z`,
      checkOut: `${formData.date}T${formData.checkOutTime}:00Z`,
      reason: formData.reason,
    })

    if (response.success) {
      toast({
        title: "Request Submitted",
        description: "Your regularization request has been submitted for approval",
      })
      setFormData({ date: "", checkInTime: "", checkOutTime: "", reason: "" })
      onSuccess?.()
    } else {
      toast({
        title: "Submission Failed",
        description: response.error || "Failed to submit regularization request",
        variant: "destructive",
      })
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "An error occurred while submitting the request",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Request Attendance Regularization</CardTitle>
        <CardDescription>
          Submit a request to regularize your attendance for a missed check-in or check-out
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Regularization requests must be submitted within 30 days of the incident
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkInTime">Check-In Time *</Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Check-Out Time *</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Regularization *</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need to regularize your attendance..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              className="min-h-24"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Regularization Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
