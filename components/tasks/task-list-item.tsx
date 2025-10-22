"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, User, AlertCircle, CheckCircle, Play } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface TaskListItemProps {
  task: any
  onViewDetails: (task: any) => void
  onStatusChange?: (taskId: string, status: string) => void
  userRole: string
}

export default function TaskListItem({ task, onViewDetails, onStatusChange, userRole }: TaskListItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Completed"

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Task Info */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                {task.category}
              </Badge>
              {isOverdue && (
                <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{task.estimatedHours || 0}h</span>
              </div>
              {task.assignToDetail && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{task.assignToDetail.profileDetail?.name || task.assignToDetail.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 lg:ml-4">
            <Button size="sm" variant="outline" onClick={() => onViewDetails(task)}>
              View Details
            </Button>

            {/* Status Actions */}
            {userRole !== "admin" && (
              <>
                {task.status === "Pending" && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => onStatusChange?.(task.taskId, "In Progress")}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                {task.status === "In Progress" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onStatusChange?.(task.taskId, "Completed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
