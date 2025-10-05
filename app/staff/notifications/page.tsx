"use client"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bell, ShieldAlert, Wrench } from "lucide-react"

export default function StaffNotificationsPage() {
  const notifications = [
    {
      id: "NTF-001",
      icon: "bell",
      title: "New ticket assigned",
      detail: "Ticket TKT-2034 is assigned to you",
      priority: "normal",
      time: "2m ago",
    },
    {
      id: "NTF-002",
      icon: "shield",
      title: "System Alert",
      detail: "Unusual login detected, please verify",
      priority: "high",
      time: "10m ago",
    },
    {
      id: "NTF-003",
      icon: "wrench",
      title: "Maintenance Window",
      detail: "Scheduled network maintenance at 11:00 PM",
      priority: "normal",
      time: "1h ago",
    },
  ] as const

  const renderIcon = (icon: string) => {
    switch (icon) {
      case "shield":
        return <ShieldAlert className="h-4 w-4 text-red-600" />
      case "wrench":
        return <Wrench className="h-4 w-4 text-indigo-600" />
      default:
        return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <DashboardLayout title="Notifications" description="Initial notifications hub for staff.">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">Unread</CardTitle>
              <CardDescription>New or unacknowledged</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">2</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">High Priority</CardTitle>
              <CardDescription>Critical alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">1</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">This Week</CardTitle>
              <CardDescription>All notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">12</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>System and workflow updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{renderIcon(n.icon)}</TableCell>
                    <TableCell className="font-medium text-gray-900">{n.title}</TableCell>
                    <TableCell className="text-gray-700">{n.detail}</TableCell>
                    <TableCell>
                      {n.priority === "high" ? (
                        <Badge className="bg-red-100 text-red-800">High</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">{n.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
