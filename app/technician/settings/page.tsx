"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, Palette, Globe, Key, Smartphone, Save, MapPin, Clock } from "lucide-react"
import { useState } from "react"

export default function TechnicianSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    notifications: {
      taskAlerts: true,
      locationReminders: true,
      sms: true,
      push: true,
    },
    location: {
      gpsTracking: true,
      geofencing: true,
      autoCheckIn: false,
    },
    appearance: {
      theme: "light",
      language: "en",
      mapStyle: "standard",
    },
    work: {
      autoAcceptTasks: false,
      workingHours: "9-17",
      breakReminders: true,
    },
  })

  if (!user) {
    return <div>Loading...</div>
  }

  const handleSave = () => {
    console.log("Saving settings:", settings)
    // Here you would save to your backend
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your work preferences and app settings</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive work notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Task Alerts</Label>
                <p className="text-sm text-gray-500">Get notified about new tasks</p>
              </div>
              <Switch
                checked={settings.notifications.taskAlerts}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, taskAlerts: checked },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Reminders
                </Label>
                <p className="text-sm text-gray-500">Reminders when approaching task locations</p>
              </div>
              <Switch
                checked={settings.notifications.locationReminders}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, locationReminders: checked },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  SMS Notifications
                </Label>
                <p className="text-sm text-gray-500">Receive urgent notifications via SMS</p>
              </div>
              <Switch
                checked={settings.notifications.sms}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, sms: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & GPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & GPS
            </CardTitle>
            <CardDescription>Manage location tracking and GPS settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>GPS Tracking</Label>
                <p className="text-sm text-gray-500">Allow location tracking during work hours</p>
              </div>
              <Switch
                checked={settings.location.gpsTracking}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    location: { ...settings.location, gpsTracking: checked },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Geo-fencing</Label>
                <p className="text-sm text-gray-500">Enable location-based check-in/out</p>
              </div>
              <Switch
                checked={settings.location.geofencing}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    location: { ...settings.location, geofencing: checked },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Check-in</Label>
                <p className="text-sm text-gray-500">Automatically check-in when arriving at work zone</p>
              </div>
              <Switch
                checked={settings.location.autoCheckIn}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    location: { ...settings.location, autoCheckIn: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the app appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.appearance.theme}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, theme: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <Select
                value={settings.appearance.language}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, language: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Map Style</Label>
              <Select
                value={settings.appearance.mapStyle}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, mapStyle: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Work Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Work Preferences
            </CardTitle>
            <CardDescription>Configure your work settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-accept Tasks</Label>
                <p className="text-sm text-gray-500">Automatically accept assigned tasks</p>
              </div>
              <Switch
                checked={settings.work.autoAcceptTasks}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    work: { ...settings.work, autoAcceptTasks: checked },
                  })
                }
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Working Hours</Label>
              <Select
                value={settings.work.workingHours}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    work: { ...settings.work, workingHours: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8-16">8:00 AM - 4:00 PM</SelectItem>
                  <SelectItem value="9-17">9:00 AM - 5:00 PM</SelectItem>
                  <SelectItem value="10-18">10:00 AM - 6:00 PM</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Break Reminders</Label>
                <p className="text-sm text-gray-500">Get reminded to take breaks</p>
              </div>
              <Switch
                checked={settings.work.breakReminders}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    work: { ...settings.work, breakReminders: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Current account information and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <Shield className="h-8 w-8 text-orange-600" />
              <div>
                <p className="font-medium">Role</p>
                <Badge className="bg-orange-100 text-orange-800">{user.role.toUpperCase()}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <Badge className="bg-green-100 text-green-800">{user.status.toUpperCase()}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Key className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Permissions</p>
                <p className="text-sm text-gray-600">{user.permissions?.length || 0} granted</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
