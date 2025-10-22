"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Search, CheckCircle } from "lucide-react"
import { taskApi } from "@/lib/task-api"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface TaskReassignModalProps {
  task: any
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onReassignSuccess?: () => void
}

export default function TaskReassignModal({
  task,
  userId,
  open,
  onOpenChange,
  onReassignSuccess,
}: TaskReassignModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState("")
  const [emailSearch, setEmailSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searching, setSearching] = useState(false)

  const handleEmailSearch = async (email: string) => {
    if (!email.trim()) {
      setSelectedUser(null)
      return
    }

    try {
      setSearching(true)
      const result = await taskApi.getUserByEmail(email)

      if (result && result.user_id) {
        setSelectedUser(result)
      } else {
        toast({
          title: "User Not Found",
          description: `No user found with email: ${email}`,
          variant: "destructive",
        })
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Error searching user:", error)
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive",
      })
      setSelectedUser(null)
    } finally {
      setSearching(false)
    }
  }

  const handleReassign = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user to reassign the task",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please add a comment explaining the reassignment",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const result = await taskApi.reassign(task.taskId, userId, {
        assignTo: selectedUser.email,
        comment: `Task reassigned to ${selectedUser.profileDetail?.name || selectedUser.email}. Reason: ${comment}`,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: `Task reassigned to ${selectedUser.profileDetail?.name || selectedUser.email}`,
        })
        setComment("")
        setEmailSearch("")
        setSelectedUser(null)
        onOpenChange(false)
        onReassignSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reassign task",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reassign task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reassign Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pr-4">
          {/* Current Task Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Current Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{task.title}</p>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge>{task.priority}</Badge>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search User */}
          <div className="space-y-3">
            <Label htmlFor="email">Search User by Email</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                placeholder="Enter email address..."
                value={emailSearch}
                onChange={(e) => {
                  setEmailSearch(e.target.value)
                  handleEmailSearch(e.target.value)
                }}
                className="pl-10"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          {selectedUser && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Selected User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-green-700 font-medium">Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedUser.profileDetail?.name || selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-medium">Email</p>
                    <p className="text-sm text-gray-700">{selectedUser.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-green-700 font-medium">Role</p>
                      <Badge variant="outline" className="text-xs">
                        {selectedUser.role}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-medium">User ID</p>
                      <Badge variant="outline" className="text-xs font-mono">
                        {selectedUser.user_id?.slice(0, 12)}...
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reassignment Comment */}
          <div className="space-y-3">
            <Label htmlFor="comment">Reassignment Comment (Required)</Label>
            <Textarea
              id="comment"
              placeholder="Explain why you're reassigning this task..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Note: The task will be marked as completed and then reassigned to the selected user.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleReassign}
              disabled={loading || !selectedUser || !comment.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reassigning...
                </>
              ) : (
                "Reassign Task"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
