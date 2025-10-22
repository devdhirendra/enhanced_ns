"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Star, User, Calendar, AlertCircle } from "lucide-react"
import { taskApi } from "@/lib/task-api"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TaskReassignModal from "./task-reassign-modal"

interface TaskDetailModalProps {
  task: any
  userId: string
  userRole: string
  onClose: () => void
  onTaskUpdated?: () => void
}

export default function TaskDetailModal({ task, userId, userRole, onClose, onTaskUpdated }: TaskDetailModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState("")
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState(5)
  const [taskData, setTaskData] = useState(task)
  const [statusComment, setStatusComment] = useState("")
  const [showStatusComment, setShowStatusComment] = useState(false)
  const [newStatus, setNewStatus] = useState(task.status)
  const [showReassignModal, setShowReassignModal] = useState(false)

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const result = await taskApi.getById(task.taskId)
        if (result?.data) {
          setTaskData(result.data)
        }
      } catch (error) {
        console.error("Error fetching task details:", error)
      }
    }

    fetchTaskDetails()
  }, [task.taskId])

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const result = await taskApi.addNote(task.taskId, userId, { note })

      if (result.success) {
        toast({
          title: "Success",
          description: "Note added successfully",
        })
        setNote("")
        const updatedTask = await taskApi.getById(task.taskId)
        if (updatedTask?.data) {
          setTaskData(updatedTask.data)
        }
        onTaskUpdated?.()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please enter feedback",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const result = await taskApi.addFeedback(task.taskId, userId, { feedback, rating })

      if (result.success) {
        toast({
          title: "Success",
          description: "Feedback added successfully",
        })
        setFeedback("")
        setRating(5)
        const updatedTask = await taskApi.getById(task.taskId)
        if (updatedTask?.data) {
          setTaskData(updatedTask.data)
        }
        onTaskUpdated?.()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add feedback",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (newStatus === "Completed" && userRole === "technician" && !statusComment.trim()) {
      toast({
        title: "Error",
        description: "Please add a comment when marking task as complete",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const result = await taskApi.updateStatus(task.taskId, userId, {
        status: newStatus,
        comment: statusComment,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: `Task status updated to ${newStatus}`,
        })
        setStatusComment("")
        setShowStatusComment(false)
        const updatedTask = await taskApi.getById(task.taskId)
        if (updatedTask?.data) {
          setTaskData(updatedTask.data)
          setNewStatus(updatedTask.data.status)
        }
        onTaskUpdated?.()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{taskData.title}</h2>
        <p className="text-gray-600 mt-1">{taskData.description}</p>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge className={getPriorityColor(taskData.priority)}>{taskData.priority}</Badge>
        <Badge className={getStatusColor(taskData.status)}>{taskData.status}</Badge>
        <Badge variant="outline">{taskData.category}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Creator Information */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-purple-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">Created By</p>
                <p className="text-sm font-semibold text-purple-900 mt-1">
                  {taskData.creatorDetail?.profileDetail?.name || "Unknown"}
                </p>
                <p className="text-xs text-purple-700">{taskData.creatorDetail?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {taskData.creatorDetail?.role}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ID: {taskData.creatorDetail?.user_id?.slice(0, 8)}...
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-purple-700">
                  <Calendar className="h-3 w-3" />
                  {formatDate(taskData.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned To Information */}
          {taskData.assignToDetail && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Assigned To</p>
                  <p className="text-sm font-semibold text-blue-900 mt-1">
                    {taskData.assignToDetail.profileDetail?.name || taskData.assignToDetail.email}
                  </p>
                  <p className="text-xs text-blue-700">{taskData.assignToDetail.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {taskData.assignToDetail.role}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      ID: {taskData.assignToDetail.user_id?.slice(0, 8)}...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-blue-700">
                    <Calendar className="h-3 w-3" />
                    Assigned: {formatDate(taskData.assignedAt || taskData.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task Dates and Duration */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm text-gray-600">Due Date</Label>
              <p className="font-medium">{formatDate(taskData.dueDate)}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Estimated Hours</Label>
              <p className="font-medium">{taskData.estimatedHours || 0}h</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Category</Label>
              <p className="font-medium">{taskData.category}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(userRole === "technician" || userRole === "admin") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Task Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === "Completed" && userRole === "technician" && (
              <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2 text-sm text-blue-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Please add a comment explaining the completion</span>
                </div>
                <Textarea
                  placeholder="Add completion comment..."
                  rows={3}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                />
              </div>
            )}

            <Button onClick={handleStatusUpdate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>

            <Button onClick={() => setShowReassignModal(true)} variant="outline" className="w-full">
              Reassign Task
            </Button>
          </CardContent>
        </Card>
      )}

      {!["technician", "admin"].includes(userRole) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => setShowReassignModal(true)} className="w-full bg-blue-600 hover:bg-blue-700">
              Reassign Task
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Notes and Feedback */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note">Your Note</Label>
                <Textarea
                  id="note"
                  placeholder="Add a note about this task..."
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button onClick={handleAddNote} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Note"
                )}
              </Button>
            </CardContent>
          </Card>

          {taskData.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Existing Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {taskData.notes.creatorNote && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">Creator Note</p>
                    <p className="text-sm text-blue-800 mt-1">{taskData.notes.creatorNote}</p>
                  </div>
                )}
                {taskData.notes.assignToNote && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900">Assignee Note</p>
                    <p className="text-sm text-green-800 mt-1">{taskData.notes.assignToNote}</p>
                  </div>
                )}
                {taskData.notes.assignForNote && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-900">Customer Note</p>
                    <p className="text-sm text-yellow-800 mt-1">{taskData.notes.assignForNote}</p>
                  </div>
                )}
                {!taskData.notes.creatorNote && !taskData.notes.assignToNote && !taskData.notes.assignForNote && (
                  <p className="text-sm text-gray-500">No notes yet</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Feedback & Rating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your feedback about this task..."
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg transition-colors ${
                        star <= rating ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">Selected Rating: {rating}/5</p>
              </div>

              <Button onClick={handleAddFeedback} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </CardContent>
          </Card>

          {taskData.feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  {taskData.feedback?.rating &&
                    [...Array(Math.min(taskData.feedback.rating, 5))].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  {taskData.feedback?.rating && (
                    <span className="text-sm text-gray-600 ml-2">({taskData.feedback.rating}/5)</span>
                  )}
                </div>
                <p className="text-gray-700">{taskData.feedback?.comment || taskData.feedback}</p>
              </CardContent>
            </Card>
          )}
          {!taskData.feedback && (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">No feedback yet</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Close Button */}
      <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
        Close
      </Button>

      <TaskReassignModal
        task={taskData}
        userId={userId}
        open={showReassignModal}
        onOpenChange={setShowReassignModal}
        onReassignSuccess={() => {
          onTaskUpdated?.()
        }}
      />
    </div>
  )
}
