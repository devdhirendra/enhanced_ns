"use client"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ClipboardList, TriangleAlert } from "lucide-react"

export default function StaffQualityPage() {
  const audits = [
    { id: "QA-1001", subject: "Ticket Handling QA", owner: "Support Team", status: "Pending", issues: 2 },
    { id: "QA-1002", subject: "Onboarding Calls Review", owner: "Onboarding Team", status: "In Review", issues: 1 },
    { id: "QA-1003", subject: "Vendor SLA Check", owner: "Marketplace Team", status: "Completed", issues: 0 },
  ] as const

  return (
    <DashboardLayout title="Quality Control" description="Initial quality tracking overview for staff.">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">Audits Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">4</div>
              <div className="mt-2 text-xs text-gray-600">Awaiting review</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">Failed QA Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">1</div>
              <div className="mt-2 text-xs text-gray-600">Last 7 days</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">Pass Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">96%</div>
              <div className="mt-2 text-xs text-gray-600">This month</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                  Recent Audits
                </CardTitle>
                <CardDescription>Initial snapshot of quality audits</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>{a.subject}</TableCell>
                    <TableCell>{a.owner}</TableCell>
                    <TableCell>
                      {a.status === "Completed" ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Completed
                        </Badge>
                      ) : a.status === "Pending" ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">In Review</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.issues > 0 ? (
                        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                          <TriangleAlert className="h-3 w-3" /> {a.issues}
                        </Badge>
                      ) : (
                        <span className="text-gray-600">0</span>
                      )}
                    </TableCell>
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
