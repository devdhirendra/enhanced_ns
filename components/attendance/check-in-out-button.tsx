"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { attendanceApi } from "@/lib/attendance-api"
import { Clock, MapPin, LogIn, LogOut } from "lucide-react"

interface CheckInOutButtonProps {
  userId: string
  isCheckedIn: boolean
  checkInTime?: string
  location?: string
  onSuccess?: () => void
}

export function CheckInOutButton({ userId, isCheckedIn, checkInTime, location, onSuccess }: CheckInOutButtonProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [locationInput, setLocationInput] = useState(location || "")

  const handleCheckIn = async () => {
    if (!locationInput.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter your current location",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await attendanceApi.checkIn(userId, {
        location: locationInput,
        date: new Date().toISOString().split("T")[0],
      })

      if (response.success) {
        toast({
          title: "Checked In",
          description: `Successfully checked in at ${locationInput}`,
        })
        onSuccess?.()
      } else {
        toast({
          title: "Check-in Failed",
          description: response.error || "Failed to check in",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during check-in",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.checkOut(userId)

      if (response.success) {
        toast({
          title: "Checked Out",
          description: "Successfully checked out",
        })
        onSuccess?.()
      } else {
        toast({
          title: "Check-out Failed",
          description: response.error || "Failed to check out",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during check-out",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attendance Check-In/Out
        </CardTitle>
        <CardDescription>
          {isCheckedIn ? `Checked in at ${checkInTime}` : "You are currently checked out"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCheckedIn ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="location">Current Location</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="e.g., Office Building A, Field Zone 5"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleCheckIn} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? "Checking In..." : "Check In"}
            </Button>
          </>
        ) : (
          <Button onClick={handleCheckOut} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
            <LogOut className="h-4 w-4 mr-2" />
            {loading ? "Checking Out..." : "Check Out"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
