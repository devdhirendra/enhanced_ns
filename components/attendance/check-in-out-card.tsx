"use client"

import { useState } from "react"
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
import { Clock, MapPin, CheckCircle, XCircle, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { showConfirmation } from "@/lib/confirmation-dialog"

interface CheckInOutCardProps {
  status: "checked_in" | "checked_out"
  checkInTime: string | null
  workingHours: string
  location: string
  onCheckIn: () => Promise<void>
  onCheckOut: (notes: string) => Promise<void>
  loading?: boolean
}

export function CheckInOutCard({
  status,
  checkInTime,
  workingHours,
  location,
  onCheckIn,
  onCheckOut,
  loading = false,
}: CheckInOutCardProps) {
  const { toast } = useToast()
  const [checkOutNotes, setCheckOutNotes] = useState("")
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckOut = async () => {
    setCheckOutDialogOpen(false)

    setTimeout(async () => {
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
        await onCheckOut(checkOutNotes)
        setCheckOutNotes("")
      } catch (error) {
        console.error("[v0] Check-out error:", error)
        toast({
          title: "Check Out Failed",
          description: "Failed to check out. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }, 100)
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-600" />
          Today's Attendance Status
        </CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-in Time</p>
              <p className="font-bold text-lg text-gray-900">{checkInTime || "Not checked in"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="bg-blue-100 p-3 rounded-full">
              <Timer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Working Hours</p>
              <p className="font-bold text-lg text-gray-900">{workingHours}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="bg-purple-100 p-3 rounded-full">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-bold text-lg text-gray-900">{location}</p>
            </div>
          </div>

          <div className="flex items-center justify-center p-4">
            {status === "checked_in" ? (
              <Dialog open={checkOutDialogOpen} onOpenChange={setCheckOutDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading || loading}>
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
                      Confirm Check Out
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button onClick={onCheckIn} className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {loading ? "Checking In..." : "Check In"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
