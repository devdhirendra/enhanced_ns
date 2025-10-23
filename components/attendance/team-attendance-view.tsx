"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { attendanceApi } from "@/lib/attendance-api"
import { Search, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface TeamMember {
  user_id: string
  name: string
  role: string
  status: "active" | "checked-out" | "absent" | "on-leave"
  checkIn?: string
  checkOut?: string
  location?: string
  currentDuration?: number
  leaveType?: string
}

interface TeamAttendanceViewProps {
  date?: string
}

export function TeamAttendanceView({ date = new Date().toISOString().split("T")[0] }: TeamAttendanceViewProps) {
  const { toast } = useToast()
  const [teamData, setTeamData] = useState<TeamMember[]>([])
  const [filteredData, setFilteredData] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    fetchTeamAttendance()
  }, [date])

  useEffect(() => {
    applyFilters()
  }, [teamData, searchTerm, selectedStatus])

  const fetchTeamAttendance = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getTeamDashboard(date)

      if (response.success) {
        const employees = response.data?.employees || []
        setTeamData(employees)
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("[v0] Error fetching team attendance:", error)
      toast({
        title: "Error",
        description: "Failed to load team attendance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...teamData]

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.user_id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((member) => member.status === selectedStatus)
    }

    setFilteredData(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "checked-out":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Checked Out
          </Badge>
        )
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        )
      case "on-leave":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            On Leave
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const stats = {
    total: teamData.length,
    present: teamData.filter((m) => m.status === "active" || m.status === "checked-out").length,
    absent: teamData.filter((m) => m.status === "absent").length,
    onLeave: teamData.filter((m) => m.status === "on-leave").length,
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Total Team Members</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Present</p>
              <p className="text-3xl font-bold text-green-600">{stats.present}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Absent</p>
              <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">On Leave</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.onLeave}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Attendance</CardTitle>
          <CardDescription>View current attendance status of all team members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((member) => (
                    <TableRow key={member.user_id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>{member.checkIn ? new Date(member.checkIn).toLocaleTimeString() : "---"}</TableCell>
                      <TableCell className="text-sm">{member.location || "---"}</TableCell>
                      <TableCell>
                        {member.currentDuration
                          ? `${Math.floor(member.currentDuration / 60)}h ${member.currentDuration % 60}m`
                          : "---"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
