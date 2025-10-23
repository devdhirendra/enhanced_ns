// components/attendance/audit-log-viewer.tsx - FIXED
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { attendanceApi } from "@/lib/attendance-api"
import { Clock } from "lucide-react"

interface AuditEvent {
  timestamp: string
  eventType: string
  details: Record<string, any>
}

interface AuditLogViewerProps {
  userId: string
  from?: string
  to?: string
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  "check-in": "bg-green-100 text-green-800",
  "check-out": "bg-blue-100 text-blue-800",
  "leave-applied": "bg-yellow-100 text-yellow-800",
  "leave-approved": "bg-green-100 text-green-800",
  "leave-rejected": "bg-red-100 text-red-800",
  "regularization-requested": "bg-purple-100 text-purple-800",
  "regularization-approved": "bg-green-100 text-green-800",
  "regularization-rejected": "bg-red-100 text-red-800",
}

export function AuditLogViewer({ userId, from, to }: AuditLogViewerProps) {
  const { toast } = useToast()
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchAuditLog()
  }, [userId, from, to, page])

  const fetchAuditLog = async () => {
    try {
      setLoading(true)
      // FIXED: Pass filters as a single object
      const response = await attendanceApi.getAuditLog(userId, {
        from,
        to,
        page,
        limit: 20
      })
      
      if (response.success) {
        setEvents(Array.isArray(response.data) ? response.data : response.data?.events || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audit log",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getEventBadge = (eventType: string) => {
    const color = EVENT_TYPE_COLORS[eventType] || "bg-gray-100 text-gray-800"
    return <Badge className={color}>{eventType.replace(/-/g, " ")}</Badge>
  }

  const getEventDescription = (event: AuditEvent) => {
    switch (event.eventType) {
      case "check-in":
        return `Checked in at ${event.details.location || "Unknown location"}`
      case "check-out":
        return `Checked out after ${event.details.durationMinutes || 0} minutes`
      case "leave-applied":
        return `Applied for ${event.details.leaveType} leave`
      case "leave-approved":
        return "Leave request approved"
      case "leave-rejected":
        return "Leave request rejected"
      case "regularization-requested":
        return "Regularization request submitted"
      case "regularization-approved":
        return "Regularization request approved"
      case "regularization-rejected":
        return "Regularization request rejected"
      default:
        return "Event occurred"
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
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Audit Log
        </CardTitle>
        <CardDescription>Complete history of all attendance events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No events found</p>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 pt-1">{getEventBadge(event.eventType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{getEventDescription(event)}</p>
                    <p className="text-xs text-gray-600 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}