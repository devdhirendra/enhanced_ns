"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Award,
  Target,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Activity,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function StaffPerformancePage() {
  const [performanceRange, setPerformanceRange] = useState([70, 100])
  const [timeRange, setTimeRange] = useState([1, 12])

  const performanceMetrics = {
    currentMonth: {
      tasksCompleted: 28,
      tasksAssigned: 32,
      avgResponseTime: 2.3,
      customerSatisfaction: 4.6,
      resolutionRate: 87.5,
      loginHours: 168,
      feedbackRating: 4.8,
    },
    previousMonth: {
      tasksCompleted: 24,
      tasksAssigned: 28,
      avgResponseTime: 2.8,
      customerSatisfaction: 4.4,
      resolutionRate: 82.1,
      loginHours: 160,
      feedbackRating: 4.5,
    },
  }

  const monthlyData = [
    { month: "Jul 2023", tasks: 22, satisfaction: 4.2, responseTime: 3.1, resolution: 78 },
    { month: "Aug 2023", tasks: 25, satisfaction: 4.3, responseTime: 2.9, resolution: 81 },
    { month: "Sep 2023", tasks: 27, satisfaction: 4.4, responseTime: 2.7, resolution: 83 },
    { month: "Oct 2023", tasks: 24, satisfaction: 4.4, responseTime: 2.8, resolution: 82 },
    { month: "Nov 2023", tasks: 26, satisfaction: 4.5, responseTime: 2.6, resolution: 85 },
    { month: "Dec 2023", tasks: 24, satisfaction: 4.4, responseTime: 2.8, resolution: 82 },
    { month: "Jan 2024", tasks: 28, satisfaction: 4.6, responseTime: 2.3, resolution: 88 },
  ]

  const achievements = [
    {
      id: 1,
      title: "Customer Champion",
      description: "Achieved 95%+ customer satisfaction for 3 consecutive months",
      earnedDate: "2024-01-15",
      category: "Customer Service",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
    },
    {
      id: 2,
      title: "Speed Demon",
      description: "Maintained sub-2 hour average response time",
      earnedDate: "2024-01-10",
      category: "Efficiency",
      icon: <Clock className="h-6 w-6 text-blue-500" />,
    },
    {
      id: 3,
      title: "Problem Solver",
      description: "Resolved 50+ complex technical issues",
      earnedDate: "2023-12-20",
      category: "Technical",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
  ]

  const teamComparison = [
    { name: "John Smith (You)", score: 92, tasks: 28, satisfaction: 4.6, responseTime: 2.3 },
    { name: "Sarah Johnson", score: 89, tasks: 26, satisfaction: 4.5, responseTime: 2.5 },
    { name: "Mike Wilson", score: 85, tasks: 24, satisfaction: 4.3, responseTime: 2.8 },
    { name: "Lisa Chen", score: 88, tasks: 25, satisfaction: 4.4, responseTime: 2.6 },
    { name: "Team Average", score: 88.5, tasks: 25.8, satisfaction: 4.45, responseTime: 2.55 },
  ]

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const calculateGrowth = (current: number, previous: number) => {
    return (((current - previous) / previous) * 100).toFixed(1)
  }

  const currentScore = Math.round(
    ((performanceMetrics.currentMonth.tasksCompleted / performanceMetrics.currentMonth.tasksAssigned) * 100 +
      performanceMetrics.currentMonth.customerSatisfaction * 20 +
      performanceMetrics.currentMonth.resolutionRate) /
      3,
  )

  return (
    <DashboardLayout title="Performance Dashboard" description="Track your performance metrics and achievements">
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="team">Team Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Score */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">Overall Performance Score</CardTitle>
                    <CardDescription>Your current performance rating</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900">{currentScore}</div>
                    <Badge className={getPerformanceBadge(currentScore)}>
                      {currentScore >= 90 ? "Excellent" : currentScore >= 80 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        (performanceMetrics.currentMonth.tasksCompleted /
                          performanceMetrics.currentMonth.tasksAssigned) *
                          100,
                      )}
                      %
                    </div>
                    <p className="text-sm text-gray-600">Task Completion</p>
                    <div className="flex items-center justify-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        +
                        {calculateGrowth(
                          performanceMetrics.currentMonth.tasksCompleted /
                            performanceMetrics.currentMonth.tasksAssigned,
                          performanceMetrics.previousMonth.tasksCompleted /
                            performanceMetrics.previousMonth.tasksAssigned,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performanceMetrics.currentMonth.customerSatisfaction}
                    </div>
                    <p className="text-sm text-gray-600">Customer Rating</p>
                    <div className="flex items-center justify-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        +
                        {calculateGrowth(
                          performanceMetrics.currentMonth.customerSatisfaction,
                          performanceMetrics.previousMonth.customerSatisfaction,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performanceMetrics.currentMonth.avgResponseTime}h
                    </div>
                    <p className="text-sm text-gray-600">Avg Response</p>
                    <div className="flex items-center justify-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        -
                        {Math.abs(
                          calculateGrowth(
                            performanceMetrics.currentMonth.avgResponseTime,
                            performanceMetrics.previousMonth.avgResponseTime,
                          ),
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performanceMetrics.currentMonth.resolutionRate}%
                    </div>
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                    <div className="flex items-center justify-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        +
                        {calculateGrowth(
                          performanceMetrics.currentMonth.resolutionRate,
                          performanceMetrics.previousMonth.resolutionRate,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Tasks Completed</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {performanceMetrics.currentMonth.tasksCompleted}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Customer Rating</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {performanceMetrics.currentMonth.customerSatisfaction}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Out of 5 stars</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Response Time</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {performanceMetrics.currentMonth.avgResponseTime}h
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Average</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Login Hours</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{performanceMetrics.currentMonth.loginHours}</div>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest accomplishments and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(achievement.earnedDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {/* Performance Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Filters</CardTitle>
                <CardDescription>Filter performance data by score and time range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Performance Range: {performanceRange[0]}% - {performanceRange[1]}%
                    </Label>
                    <Slider
                      value={performanceRange}
                      onValueChange={setPerformanceRange}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Time Range: Last {timeRange[0]} - {timeRange[1]} months
                    </Label>
                    <Slider value={timeRange} onValueChange={setTimeRange} max={12} step={1} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trend</CardTitle>
                <CardDescription>Your performance metrics over the past 7 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monthlyData.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{month.month}</h4>
                          <p className="text-sm text-gray-600">{month.tasks} tasks completed</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm font-medium">{month.satisfaction}</div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{month.responseTime}h</div>
                          <div className="text-xs text-gray-500">Response</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{month.resolution}%</div>
                          <div className="text-xs text-gray-500">Resolution</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Achievements</CardTitle>
                <CardDescription>Your complete achievement history and badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">{achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                              <Badge variant="outline">{achievement.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-500">
                                Earned on {formatDate(achievement.earnedDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievement Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Progress</CardTitle>
                <CardDescription>Track your progress towards upcoming achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Task Master</h4>
                        <p className="text-sm text-gray-600">Complete 50 tasks in a single month</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">28/50</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "56%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Customer Favorite</h4>
                        <p className="text-sm text-gray-600">Maintain 4.8+ rating for 6 months</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">3/6</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "50%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Communication Expert</h4>
                        <p className="text-sm text-gray-600">Handle 100 customer interactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">73/100</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: "73%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Comparison</CardTitle>
                <CardDescription>See how you stack up against your teammates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamComparison.map((member, index) => (
                    <div
                      key={member.name}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        member.name.includes("(You)") ? "bg-indigo-50 border-indigo-200" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                          <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4
                            className={`font-semibold ${member.name.includes("(You)") ? "text-indigo-900" : "text-gray-900"}`}
                          >
                            {member.name}
                          </h4>
                          <p className="text-sm text-gray-600">{member.tasks} tasks completed</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className={`text-sm font-medium ${getPerformanceColor(member.score)}`}>
                            {member.score}
                          </div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{member.satisfaction}</div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{member.responseTime}h</div>
                          <div className="text-xs text-gray-500">Response</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Rankings</CardTitle>
                  <CardDescription>Your position in various categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall Performance</span>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">#1</Badge>
                        <span className="text-sm font-medium">92/100</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">#1</Badge>
                        <span className="text-sm font-medium">4.6/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">#1</Badge>
                        <span className="text-sm font-medium">2.3h</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tasks Completed</span>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">#1</Badge>
                        <span className="text-sm font-medium">28</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Statistics</CardTitle>
                  <CardDescription>Overall team performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Team Size</span>
                      <span className="font-medium">4 members</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Team Score</span>
                      <span className="font-medium">88.5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Tasks Completed</span>
                      <span className="font-medium">103</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Team Satisfaction</span>
                      <span className="font-medium">4.45/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
