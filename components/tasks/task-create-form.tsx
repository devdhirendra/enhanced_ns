"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"
import { taskApi } from "@/lib/task-api"
import { useToast } from "@/hooks/use-toast"

interface TaskCreateFormProps {
  userId: string
  userRole: string
  onTaskCreated?: () => void
}

interface UserData {
  user_id: string
  email: string
  role: string
  profileDetail?: {
    name: string
    phone: string
  }
}

export default function TaskCreateForm({ userId, userRole, onTaskCreated }: TaskCreateFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searchingUser, setSearchingUser] = useState(false)
  const [foundUser, setFoundUser] = useState<UserData | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Maintenance",
    priority: "Medium",
    assignToEmail: "",
    assignForEmail: "",
    dueDate: "",
    estimatedHours: 0,
  })

  const handleSearchUser = async (email: string) => {
    if (!email) {
      setFoundUser(null)
      return
    }

    try {
      setSearchingUser(true)
      const result = await taskApi.getUserByEmail(email)

      if (result && result.user_id) {
        setFoundUser(result)
        setShowUserDialog(true)
      } else {
        toast({
          title: "User Not Found",
          description: `No user found with email: ${email}`,
          variant: "destructive",
        })
        setFoundUser(null)
      }
    } catch (error) {
      console.error("Error searching user:", error)
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive",
      })
    } finally {
      setSearchingUser(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !foundUser) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and select an assignee",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority as "Low" | "Medium" | "High" | "Critical",
        assignTo: foundUser.user_id,
        assignFor: formData.assignForEmail || undefined,
        dueDate: formData.dueDate || undefined,
        estimatedHours: formData.estimatedHours,
      }

      const result = await taskApi.create(userId, payload)

      if (result.success) {
        toast({
          title: "Success",
          description: "Task created successfully",
        })

        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "Maintenance",
          priority: "Medium",
          assignToEmail: "",
          assignForEmail: "",
          dueDate: "",
          estimatedHours: 8,
        })
        setFoundUser(null)
        setShowUserDialog(false)

        onTaskCreated?.()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
        <CardDescription>Assign a task to team members or other roles</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed task description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Installation">Installation</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assign To - Email Based */}
          <div className="space-y-2">
            <Label htmlFor="assignToEmail">Assign To (Email) *</Label>
            <div className="flex gap-2">
              <Input
                id="assignToEmail"
                type="email"
                placeholder="Enter email to search user"
                value={formData.assignToEmail}
                onChange={(e) => setFormData({ ...formData, assignToEmail: e.target.value })}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSearchUser(formData.assignToEmail)}
                disabled={searchingUser || !formData.assignToEmail}
              >
                {searchingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            {/* Show found user */}
            {foundUser && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    {foundUser.profileDetail?.name || foundUser.email}
                  </p>
                  <p className="text-xs text-green-700">{foundUser.role}</p>
                </div>
              </div>
            )}
          </div>

          {/* Assign For - Optional */}
          <div className="space-y-2">
            <Label htmlFor="assignForEmail">Assign For (Optional)</Label>
            <Input
              id="assignForEmail"
              type="email"
              placeholder="Customer or reference email"
              value={formData.assignForEmail}
              onChange={(e) => setFormData({ ...formData, assignForEmail: e.target.value })}
            />
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                max="100"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || !foundUser} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
