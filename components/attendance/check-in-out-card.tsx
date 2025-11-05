"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Clock, MapPin, CheckCircle, XCircle, Timer, Badge } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { showConfirmation } from "@/lib/confirmation-dialog"

interface CheckInOutCardProps {
  isCheckedIn: boolean
  checkInTime: string | null
  checkOutTime: string | null
  workingHours: string
  location: string
  sessionId?: string
  onCheckIn: () => Promise<boolean>
  onCheckOut: (notes: string) => Promise<boolean>
  loading?: boolean
}

export function CheckInOutCard({
  isCheckedIn,
  checkInTime,
  checkOutTime,
  workingHours,
  location,
  sessionId,
  onCheckIn,
  onCheckOut,
  loading = false,
}: CheckInOutCardProps) {
  const { toast } = useToast()
  const [checkOutNotes, setCheckOutNotes] = useState("")
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState("")

  useEffect(() => {
    if (isCheckedIn && checkInTime) {
      const updateElapsedTime = () => {
        try {
          const checkIn = new Date(checkInTime)
          const now = new Date()
          const diff = now.getTime() - checkIn.getTime()
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const newElapsedTime = `${hours}h ${minutes}m`
          setElapsedTime(newElapsedTime)
        } catch (error) {
          console.error("Error calculating elapsed time:", error)
          setElapsedTime(workingHours)
        }
      }

      updateElapsedTime()
      const interval = setInterval(updateElapsedTime, 60000)
      return () => clearInterval(interval)
    } else {
      setElapsedTime(workingHours)
    }
  }, [isCheckedIn, checkInTime, workingHours])

  const handleCheckOut = async () => {
    setCheckOutDialogOpen(false)

    const confirmed = await showConfirmation({
      title: "Check Out",
      message: "Are you sure you want to check out for today?",
      confirmText: "Check Out",
      cancelText: "Cancel",
    })

    if (!confirmed) {
      setCheckOutDialogOpen(true)
      return
    }

    try {
      setIsLoading(true)
      const success = await onCheckOut(checkOutNotes)
      if (success) {
        setCheckOutNotes("")
      } else {
        setCheckOutDialogOpen(true)
      }
    } catch (error) {
      console.error("Check-out error:", error)
      setCheckOutDialogOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = async () => {
    const confirmed = await showConfirmation({
      title: "Check In",
      message: "Are you sure you want to check in for today?",
      confirmText: "Check In",
      cancelText: "Cancel",
    })

    if (!confirmed) return

    try {
      setIsLoading(true)
      const success = await onCheckIn()
      if (!success) {
        console.error("Check-in failed")
      }
    } catch (error) {
      console.error("Check-in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "---"

    try {
      return new Date(timeString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      })
    } catch (error) {
      console.error("Error formatting time:", error, timeString)
      return "---"
    }
  }

  const displayTime = isCheckedIn ? elapsedTime : workingHours

  return (
    <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-600" />
          Today's Attendance Status
          {isCheckedIn && <Badge className="bg-green-100 text-green-800 ml-2">Checked In</Badge>}
        </CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            month: "long",
            day: "numeric",
            timeZone: "Asia/Kolkata",
          })}
          {sessionId && <span className="ml-2 text-xs text-gray-500">Session: {sessionId.substring(0, 8)}...</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm border border-green-200">
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-in Time</p>
              <p className="font-bold text-lg text-gray-900">{formatTime(checkInTime)}</p>
            </div>
          </div>

          {checkOutTime && (
            <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm border border-red-200">
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out Time</p>
                <p className="font-bold text-lg text-gray-900">{formatTime(checkOutTime)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm border border-blue-200">
            <div className="bg-blue-100 p-3 rounded-full">
              <Timer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Working Hours</p>
              <p className="font-bold text-lg text-gray-900">{displayTime}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm border border-purple-200">
            <div className="bg-purple-100 p-3 rounded-full">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-bold text-lg text-gray-900 truncate">{location || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {isCheckedIn ? (
            <Dialog open={checkOutDialogOpen} onOpenChange={setCheckOutDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={isLoading || loading}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {isLoading || loading ? "Checking Out..." : "Check Out"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check Out</DialogTitle>
                  <DialogDescription>Add any notes before checking out.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={checkOutNotes}
                      onChange={(e) => setCheckOutNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCheckOut} className="w-full" disabled={isLoading || loading}>
                    {isLoading || loading ? "Processing..." : "Confirm Check Out"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              onClick={handleCheckIn}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading || isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading || isLoading ? "Checking In..." : "Check In"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
