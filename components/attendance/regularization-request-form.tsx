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
    minHours: 8,
  })
  const [files, setFiles] = useState<File[]>([])

  const isEligibleForRegularization = () => {
    if (!formData.checkInTime || !formData.checkOutTime) return false
    const checkIn = Number.parseInt(formData.checkInTime.split(":")[0])
    const checkOut = Number.parseInt(formData.checkOutTime.split(":")[0])
    const hours = checkOut - checkIn
    return hours < formData.minHours
  }

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

    if (!isEligibleForRegularization()) {
      toast({
        title: "Not Eligible",
        description: "You can only request regularization if your working hours are less than 8 hours",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const istDate = new Date(formData.date)
      const checkInIST = new Date(`${formData.date}T${formData.checkInTime}:00`)
      const checkOutIST = new Date(`${formData.date}T${formData.checkOutTime}:00`)

      const response = await attendanceApi.requestRegularization({
        userId,
        date: formData.date,
        checkIn: checkInIST.toISOString(),
        checkOut: checkOutIST.toISOString(),
        reason: formData.reason,
      })

      if (response.success) {
        toast({
          title: "Request Submitted",
          description: "Your regularization request has been submitted for approval",
        })
        setFormData({ date: "", checkInTime: "", checkOutTime: "", reason: "", minHours: 8 })
        setFiles([])
        onSuccess?.()
      } else {
        toast({
          title: "Submission Failed",
          description: response.error || "Failed to submit regularization request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Regularization error:", error)
      toast({
        title: "Error",
        description: "An error occurred while submitting the request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Request Attendance Regularization</CardTitle>
        <CardDescription>
          Submit a request to regularize your attendance if you couldn't complete 8 hours of work
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You are eligible for regularization if your working hours are less than 8 hours
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
              <Label htmlFor="minHours">Minimum Hours Required</Label>
              <Input id="minHours" type="number" value={formData.minHours} readOnly className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkInTime">Check-In Time (IST) *</Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Check-Out Time (IST) *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="documents">Supporting Documents (Optional)</Label>
            <Input
              id="documents"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">Upload up to 5 files (PDF, JPG, PNG)</p>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, idx) => (
                  <p key={idx} className="text-sm text-green-600">
                    ✓ {file.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading || !isEligibleForRegularization()} className="w-full">
            {loading ? "Submitting..." : "Submit Regularization Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
