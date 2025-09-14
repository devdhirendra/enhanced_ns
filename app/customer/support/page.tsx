"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  Search,
  Send,
  FileText,
  Video,
  Headphones,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CustomerSupportPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    priority: "medium",
  })

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7 Available",
      action: "Start Chat",
      color: "bg-blue-500",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our technical experts",
      availability: "Mon-Fri 9AM-6PM",
      action: "Call Now",
      color: "bg-green-500",
      phone: "+91 1800-123-4567",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed queries via email",
      availability: "Response within 24 hours",
      action: "Send Email",
      color: "bg-purple-500",
      email: "support@networksolutions.com",
    },
    {
      icon: Video,
      title: "Video Call",
      description: "Schedule a video call for complex issues",
      availability: "By Appointment",
      action: "Schedule Call",
      color: "bg-orange-500",
    },
  ]

  const faqs = [
    {
      question: "How do I check my internet speed?",
      answer:
        "You can check your internet speed using our built-in speed test tool in your dashboard, or visit speedtest.net. If you're getting speeds lower than your plan, please contact our support team.",
    },
    {
      question: "What should I do if my internet is not working?",
      answer:
        "First, try restarting your router by unplugging it for 30 seconds. Check all cable connections. If the issue persists, check our service status page or contact support.",
    },
    {
      question: "How can I upgrade my plan?",
      answer:
        "You can upgrade your plan through your customer dashboard under 'Plan Management' or contact our sales team. Upgrades are usually processed within 24 hours.",
    },
    {
      question: "How do I pay my bill?",
      answer:
        "You can pay your bill online through your dashboard, via UPI, credit card, or net banking. You can also set up auto-pay for convenience.",
    },
    {
      question: "What is your refund policy?",
      answer:
        "We offer pro-rated refunds for service interruptions longer than 24 hours. For plan downgrades, refunds are processed within 7-10 business days.",
    },
    {
      question: "How do I report a service outage?",
      answer:
        "You can report outages through your dashboard, our mobile app, or by calling our support line. We'll provide real-time updates on resolution progress.",
    },
  ]

  const quickActions = [
    { title: "Check Service Status", icon: CheckCircle, description: "View current service status in your area" },
    { title: "Speed Test", icon: FileText, description: "Test your current internet speed" },
    { title: "Restart Router", icon: HelpCircle, description: "Step-by-step router restart guide" },
    { title: "Bill Payment", icon: FileText, description: "Quick access to bill payment options" },
  ]

  const handleContactSubmit = () => {
    if (!contactForm.subject || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Simulate form submission
    toast({
      title: "Message Sent",
      description: "Your support request has been submitted. We'll get back to you soon!",
    })

    setContactForm({ subject: "", message: "", priority: "medium" })
  }

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout title="Customer Support" description="Get help and support for your services">
      <div className="space-y-6">
        {/* Support Channels */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-xl">Get Support</CardTitle>
            <CardDescription>Choose the best way to reach our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportChannels.map((channel, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 ${channel.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <channel.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{channel.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{channel.description}</p>
                    <Badge variant="outline" className="mb-3">
                      {channel.availability}
                    </Badge>
                    <Button size="sm" className="w-full">
                      {channel.action}
                    </Button>
                    {channel.phone && <p className="text-xs text-gray-500 mt-2">{channel.phone}</p>}
                    {channel.email && <p className="text-xs text-gray-500 mt-2">{channel.email}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Form</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {/* Search FAQ */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ List */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {filteredFaqs.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No FAQs found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Send us a message and we'll get back to you soon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <Button onClick={handleContactSubmit} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and troubleshooting steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <action.icon className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Support Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
                <CardDescription>Additional resources to help you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">User Manual</h4>
                        <p className="text-sm text-gray-600">Complete guide to using our services</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Video className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Video Tutorials</h4>
                        <p className="text-sm text-gray-600">Step-by-step video guides</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Watch
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Headphones className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Remote Support</h4>
                        <p className="text-sm text-gray-600">Let our team help you remotely</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Request
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
