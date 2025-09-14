"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Share2,
  Copy,
  Gift,
  Users,
  DollarSign,
  Trophy,
  Send,
  CheckCircle,
  Clock,
  Star,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  CreditCard,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function CustomerReferralsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [referralEmail, setReferralEmail] = useState("")

  // Mock data
  const referralStats = {
    totalReferrals: 8,
    successfulReferrals: 5,
    pendingReferrals: 2,
    totalEarnings: 2500,
    availableRewards: 1500,
    redeemedRewards: 1000,
  }

  const referralCode = "NET2024REF123"
  const referralLink = `https://networksolutions.com/signup?ref=${referralCode}`

  const referralHistory = [
    {
      id: "REF-001",
      friendName: "John Doe",
      friendEmail: "john@example.com",
      status: "completed",
      referredDate: "2024-01-15T10:30:00Z",
      activatedDate: "2024-01-20T14:15:00Z",
      reward: 500,
      planChosen: "Premium Fiber 100 Mbps",
    },
    {
      id: "REF-002",
      friendName: "Jane Smith",
      friendEmail: "jane@example.com",
      status: "completed",
      referredDate: "2024-01-10T09:00:00Z",
      activatedDate: "2024-01-12T16:30:00Z",
      reward: 500,
      planChosen: "Basic Fiber 50 Mbps",
    },
    {
      id: "REF-003",
      friendName: "Mike Johnson",
      friendEmail: "mike@example.com",
      status: "pending",
      referredDate: "2024-01-25T11:45:00Z",
      activatedDate: null,
      reward: 500,
      planChosen: null,
    },
    {
      id: "REF-004",
      friendName: "Sarah Wilson",
      friendEmail: "sarah@example.com",
      status: "expired",
      referredDate: "2023-12-01T08:00:00Z",
      activatedDate: null,
      reward: 0,
      planChosen: null,
    },
  ]

  const rewardTiers = [
    { referrals: 1, reward: 500, title: "First Referral", achieved: true },
    { referrals: 3, reward: 1500, title: "Triple Threat", achieved: true },
    { referrals: 5, reward: 2500, title: "High Five", achieved: true },
    { referrals: 10, reward: 5000, title: "Perfect Ten", achieved: false },
    { referrals: 20, reward: 10000, title: "Super Referrer", achieved: false },
  ]

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    })
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast({
      title: "Code Copied!",
      description: "Your referral code has been copied to clipboard.",
    })
  }

  const sendReferralEmail = () => {
    if (!referralEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your friend's email address.",
        variant: "destructive",
      })
      return
    }

    // Simulate sending referral email
    toast({
      title: "Referral Sent!",
      description: `Referral invitation has been sent to ${referralEmail}.`,
    })
    setReferralEmail("")
  }

  const shareOnSocial = (platform: string) => {
    const message = `Join me on Network Solutions and get amazing internet speeds! Use my referral link: ${referralLink}`

    let shareUrl = ""
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "expired":
        return <Clock className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout title="Referral Program" description="Refer friends and earn rewards">
      <div className="space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{referralStats.totalReferrals}</div>
              <p className="text-xs text-gray-500 mt-1">{referralStats.successfulReferrals} successful</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(referralStats.totalEarnings)}</div>
              <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Available Rewards</CardTitle>
              <Gift className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(referralStats.availableRewards)}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to redeem</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{referralStats.pendingReferrals}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting activation</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="refer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="refer">Refer Friends</TabsTrigger>
            <TabsTrigger value="history">Referral History</TabsTrigger>
            <TabsTrigger value="rewards">Reward Tiers</TabsTrigger>
            <TabsTrigger value="redeem">Redeem Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="refer" className="space-y-6">
            {/* Referral Link & Code */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Your Referral Details
                </CardTitle>
                <CardDescription>Share your unique referral link or code with friends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Referral Link</label>
                  <div className="flex space-x-2">
                    <Input value={referralLink} readOnly className="flex-1" />
                    <Button onClick={copyReferralLink} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Referral Code</label>
                  <div className="flex space-x-2">
                    <Input value={referralCode} readOnly className="flex-1" />
                    <Button onClick={copyReferralCode} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Referral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Send Referral Invitation
                </CardTitle>
                <CardDescription>Invite friends directly via email</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter your friend's email address"
                    value={referralEmail}
                    onChange={(e) => setReferralEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={sendReferralEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invite
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Share on Social Media</CardTitle>
                <CardDescription>Spread the word on your favorite platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button onClick={() => shareOnSocial("facebook")} className="bg-blue-600 hover:bg-blue-700">
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button onClick={() => shareOnSocial("twitter")} className="bg-sky-500 hover:bg-sky-600">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button onClick={() => shareOnSocial("whatsapp")} className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How Referrals Work</CardTitle>
                <CardDescription>Simple steps to earn rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Share2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Share Your Link</h4>
                    <p className="text-sm text-gray-600">Share your unique referral link with friends and family</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">2. Friend Signs Up</h4>
                    <p className="text-sm text-gray-600">Your friend signs up using your referral link</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gift className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Earn Rewards</h4>
                    <p className="text-sm text-gray-600">Get ₹500 reward when they activate their plan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
                <CardDescription>Track all your referrals and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Friend</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Referred Date</TableHead>
                      <TableHead>Activated Date</TableHead>
                      <TableHead>Plan Chosen</TableHead>
                      <TableHead>Reward</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralHistory.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{referral.friendName}</div>
                            <div className="text-sm text-gray-500">{referral.friendEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(referral.status)}
                            <Badge className={getStatusColor(referral.status)}>
                              {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(referral.referredDate)}</TableCell>
                        <TableCell>{referral.activatedDate ? formatDate(referral.activatedDate) : "-"}</TableCell>
                        <TableCell>{referral.planChosen || "-"}</TableCell>
                        <TableCell>
                          {referral.reward > 0 ? (
                            <span className="font-medium text-green-600">{formatCurrency(referral.reward)}</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Reward Tiers
                </CardTitle>
                <CardDescription>Unlock higher rewards as you refer more friends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewardTiers.map((tier, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        tier.achieved ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tier.achieved ? "bg-green-500" : "bg-gray-400"
                          }`}
                        >
                          {tier.achieved ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : (
                            <Star className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{tier.title}</h4>
                          <p className="text-sm text-gray-600">{tier.referrals} successful referrals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(tier.reward)}</div>
                        {tier.achieved ? (
                          <Badge className="bg-green-100 text-green-800">Achieved</Badge>
                        ) : (
                          <Badge variant="outline">Locked</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redeem" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Available Rewards
                </CardTitle>
                <CardDescription>Redeem your earned rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-green-600">
                    {formatCurrency(referralStats.availableRewards)}
                  </div>
                  <p className="text-gray-600">Ready to redeem</p>
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Redeem to Account Credit
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" size="lg">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Transfer to Bank Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redemption History</CardTitle>
                <CardDescription>Your previous reward redemptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Account Credit</h4>
                      <p className="text-sm text-gray-600">Redeemed on Jan 15, 2024</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(500)}</div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                      <p className="text-sm text-gray-600">Redeemed on Dec 20, 2023</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(500)}</div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
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
