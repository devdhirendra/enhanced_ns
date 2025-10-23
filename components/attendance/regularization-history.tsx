"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { attendanceApi } from "@/lib/attendance-api"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface RegularizationRequest {
  regularizationId: string
  date: string
  checkIn: string
  checkOut: string
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface RegularizationHistoryProps {
  userId: string
}

export function RegularizationHistory({ userId }: RegularizationHistoryProps) {
  const { toast } = useToast()
  const [requests, setRequests] = useState<RegularizationRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [userId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getRegularizationHistory(userId)
      if (response.success) {
        setRequests(Array.isArray(response.data) ? response.data : response.data?.regularizations || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load regularization history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regularization History</CardTitle>
        <CardDescription>View your submitted regularization requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No regularization requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.regularizationId}>
                    <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(request.checkIn).toLocaleTimeString()}</TableCell>
                    <TableCell>{new Date(request.checkOut).toLocaleTimeString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
