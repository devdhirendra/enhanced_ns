"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { attendanceApi } from "@/lib/attendance-api"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface RegularizationRequest {
  regularizationId: string
  userId: string
  date: string
  checkIn: string
  checkOut: string
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface RegularizationApprovalTableProps {
  userId: string
  onRefresh?: () => void
}

export function RegularizationApprovalTable({ userId, onRefresh }: RegularizationApprovalTableProps) {
  const { toast } = useToast()
  const [requests, setRequests] = useState<RegularizationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<RegularizationRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [comments, setComments] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getRegularizationHistory(userId)
      if (response.success) {
        setRequests(Array.isArray(response.data) ? response.data : response.data?.regularizations || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load regularization requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    try {
      setActionLoading(true)
      const response = await attendanceApi.updateRegularizationStatus(selectedRequest.regularizationId, {
        status: "approved",
        approvedBy: userId,
        comments,
      })

      if (response.success) {
        toast({
          title: "Approved",
          description: "Regularization request approved successfully",
        })
        setSelectedRequest(null)
        setComments("")
        fetchRequests()
        onRefresh?.()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to approve request",
          variant: "destructive",
        })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      setActionLoading(true)
      const response = await attendanceApi.updateRegularizationStatus(selectedRequest.regularizationId, {
        status: "rejected",
        approvedBy: userId,
        comments,
      })

      if (response.success) {
        toast({
          title: "Rejected",
          description: "Regularization request rejected",
        })
        setSelectedRequest(null)
        setComments("")
        fetchRequests()
        onRefresh?.()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to reject request",
          variant: "destructive",
        })
      }
    } finally {
      setActionLoading(false)
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Regularization Requests</CardTitle>
          <CardDescription>Review and approve/reject attendance regularization requests</CardDescription>
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
                  <TableHead>Action</TableHead>
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
                      <TableCell>
                        {request.status === "pending" && (
                          <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Regularization Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Request from ${new Date(selectedRequest.date).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Check-In</p>
                  <p className="font-semibold">{new Date(selectedRequest.checkIn).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Check-Out</p>
                  <p className="font-semibold">{new Date(selectedRequest.checkOut).toLocaleTimeString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Reason</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.reason}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Add your comments..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </Button>
                <Button onClick={handleReject} disabled={actionLoading} variant="destructive" className="flex-1">
                  {actionLoading ? "Processing..." : "Reject"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
