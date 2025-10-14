"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Headphones, MessageCircle, Phone, Mail, FileText, Send, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SupportTicket {
  id: string
  title: string
  description: string
  category: "technical" | "billing" | "account" | "product" | "general"
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "resolved" | "closed"
  createdAt: string
  updatedAt: string
  responses: Array<{
    id: string
    message: string
    sender: "vendor" | "support"
    timestamp: string
  }>
}

export default function VendorSupportPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    category: "general" as const,
    priority: "medium" as const,
  })
  const [newResponse, setNewResponse] = useState("")

  useEffect(() => {
    fetchSupportTickets()
  }, [])

  const fetchSupportTickets = async () => {
    try {
      setLoading(true)

      // Mock support tickets for demo
      const mockTickets: SupportTicket[] = [
        {
          id: "TKT-001",
          title: "Payment settlement delay",
          description: "My payment for last month's orders hasn't been settled yet. Can you please check the status?",
          category: "billing",
          priority: "high",
          status: "in-progress",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          responses: [
            {
              id: "1",
              message: "Thank you for contacting us. We're looking into your payment settlement issue.",
              sender: "support",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            },
          ],
        },
        {
          id: "TKT-002",
          title: "Product catalog upload issue",
          description: "I'm unable to upload product images. The system shows an error message.",
          category: "technical",
          priority: "medium",
          status: "resolved",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          responses: [
            {
              id: "2",
              message: "We've identified the issue and deployed a fix. Please try uploading again.",
              sender: "support",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            },
          ],
        },
        {
          id: "TKT-003",
          title: "KYC document verification",
          description:
            "My KYC documents were rejected. Can you please provide more details on what needs to be corrected?",
          category: "account",
          priority: "high",
          status: "open",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          responses: [],
        },
      ]

      setTickets(mockTickets)
    } catch (error) {
      console.error("Error fetching support tickets:", error)
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async () => {
    try {
      const newTicket: SupportTicket = {
        id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
        title: newTicketForm.title,
        description: newTicketForm.description,
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      }

      setTickets((prev) => [newTicket, ...prev])
      setNewTicketForm({
        title: "",
        description: "",
        category: "general",
        priority: "medium",
      })
      setShowNewTicket(false)

      toast({
        title: "Success",
        description: "Support ticket created successfully",
      })
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive",
      })
    }
  }

  const addResponse = async (ticketId: string) => {
    if (!newResponse.trim()) return

    try {
      const response = {
        id: String(Date.now()),
        message: newResponse,
        sender: "vendor" as const,
        timestamp: new Date().toISOString(),
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, responses: [...ticket.responses, response], updatedAt: new Date().toISOString() }
            : ticket,
        ),
      )

      setNewResponse("")

      toast({
        title: "Success",
        description: "Response added successfully",
      })
    } catch (error) {
      console.error("Error adding response:", error)
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
        <DashboardLayout title="Vendor Dashboard" description="Overview of your network operations">

    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Headphones className="w-8 h-8" />
            Support Center
          </h1>
          <p className="text-gray-600 mt-1">Get help with your vendor account and business operations</p>
        </div>
        <Button onClick={() => setShowNewTicket(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Contact Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Contact</CardTitle>
            <CardDescription>Get immediate assistance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Phone Support</p>
                <p className="text-sm text-gray-600">+91 1800-123-4567</p>
                <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Email Support</p>
                <p className="text-sm text-gray-600">vendor@networksolutions.com</p>
                <p className="text-xs text-gray-500">24/7 Response</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Live Chat</p>
                <p className="text-sm text-gray-600">Available Now</p>
                <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                  Start Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <div className="lg:col-span-3 space-y-6">
          {/* New Ticket Form */}
          {showNewTicket && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Support Ticket</CardTitle>
                <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newTicketForm.category}
                      onChange={(e) =>
                        setNewTicketForm({
                          ...newTicketForm,
                          category: e.target.value as any,
                        })
                      }
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="account">Account</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newTicketForm.priority}
                      onChange={(e) =>
                        setNewTicketForm({
                          ...newTicketForm,
                          priority: e.target.value as any,
                        })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Subject</Label>
                  <Input
                    id="title"
                    value={newTicketForm.title}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                    placeholder="Provide detailed information about your issue"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={createTicket} className="bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4 mr-2" />
                    Create Ticket
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
              <CardDescription>Track and manage your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No support tickets</h3>
                  <p className="text-gray-500">You haven't created any support tickets yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">#{ticket.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{ticket.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                        <span>Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                      </div>

                      {/* Expanded Ticket Details */}
                      {selectedTicket?.id === ticket.id && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="space-y-4">
                            {ticket.responses.map((response) => (
                              <div
                                key={response.id}
                                className={`p-3 rounded-lg ${
                                  response.sender === "vendor" ? "bg-blue-50 ml-8" : "bg-gray-50 mr-8"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">
                                    {response.sender === "vendor" ? "You" : "Support Team"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(response.timestamp), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{response.message}</p>
                              </div>
                            ))}

                            {ticket.status !== "closed" && (
                              <div className="flex gap-2">
                                <Textarea
                                  value={newResponse}
                                  onChange={(e) => setNewResponse(e.target.value)}
                                  placeholder="Type your response..."
                                  rows={3}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => addResponse(ticket.id)}
                                  disabled={!newResponse.trim()}
                                  className="self-end"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
