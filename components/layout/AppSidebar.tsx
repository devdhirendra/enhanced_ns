"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import type { User } from "@/contexts/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Building2,
  HardHat,
  Package,
  ShoppingCart,
  Bell,
  BarChart3,
  Settings,
  CreditCard,
  FileText,
  Headphones,
  MapPin,
  Calculator,
  UserCog,
  Database,
  Wifi,
  ChevronUp,
  LogOut,
  UserIcon,
  ClipboardList,
  UserCheck,
  Calendar,
  Receipt,
  Phone,
  CheckCircle,
  ArrowUpRight,
  Gift,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AppSidebarProps {
  user: User
}

// Admin navigation items
const adminNavItems = [
  {
    title: "Dashboard & Analytics",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Operations Management",
    items: [
      { title: "Operators", url: "/admin/operators", icon: Building2 },
      { title: "Staff Management", url: "/admin/staff", icon: UserCog },
      { title: "Inventory", url: "/admin/inventory", icon: Package },
      { title: "Marketplace", url: "/admin/marketplace", icon: ShoppingCart },
      { title: "Leave Management", url: "/admin/leave", icon: Calendar },
    ],
  },
  {
    title: "Finance & Billing",
    items: [
      { title: "Billing", url: "/admin/billing", icon: CreditCard },
      { title: "Subscriptions", url: "/admin/subscriptions", icon: FileText },
      { title: "Plans", url: "/admin/plans", icon: Calculator },
    ],
  },
  {
    title: "Communication & Support",
    items: [
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
      { title: "Support", url: "/admin/support", icon: Headphones },
    ],
  },
  {
    title: "System",
    items: [{ title: "Settings", url: "/admin/settings", icon: Settings }],
  },
]

// Operator navigation items
const operatorNavItems = [
  {
    title: "Dashboard & Analytics",
    items: [
      { title: "Dashboard", url: "/operator/dashboard", icon: LayoutDashboard },
      { title: "Reports", url: "/operator/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Customer Management",
    items: [
      { title: "All Customers", url: "/operator/customers", icon: Users },
      { title: "Add Customer", url: "/operator/customers/add", icon: Users },
      { title: "Bulk Upload", url: "/operator/customers/bulk-upload", icon: Database },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Complaints", url: "/operator/complaints", icon: Headphones },
      { title: "Technicians", url: "/operator/technicians", icon: HardHat },
      { title: "Inventory", url: "/operator/inventory", icon: Package },
      { title: "Network Map", url: "/operator/network-map", icon: MapPin },
    ],
  },
  {
    title: "Finance & Billing",
    items: [
      { title: "Payments", url: "/operator/payments", icon: CreditCard },
      { title: "Invoicing", url: "/operator/invoicing", icon: Receipt },
      { title: "Plans", url: "/operator/plans", icon: Calculator },
    ],
  },
  {
    title: "Communication",
    items: [
      { title: "Notifications", url: "/operator/notifications", icon: Bell },
      { title: "Marketplace", url: "/operator/marketplace", icon: ShoppingCart },
    ],
  },
]

// Technician navigation items
const technicianNavItems = [
  {
    title: "Daily Work",
    items: [
      { title: "Dashboard", url: "/technician/dashboard", icon: LayoutDashboard },
      { title: "My Tasks", url: "/technician/tasks", icon: ClipboardList },
      { title: "Complaints", url: "/technician/complaints", icon: Headphones },
    ],
  },
  {
    title: "Attendance & Leave",
    items: [
      { title: "Attendance", url: "/technician/attendance", icon: UserCheck },
      { title: "Leave Requests", url: "/technician/leave", icon: Calendar },
    ],
  },
  {
    title: "Inventory & Collection",
    items: [
      { title: "My Inventory", url: "/technician/inventory", icon: Package },
      { title: "Cash Collection", url: "/technician/collection", icon: CreditCard },
    ],
  },
  {
    title: "Tools & Maps",
    items: [
      { title: "Network Map", url: "/technician/network-map", icon: MapPin },
      { title: "Notifications", url: "/technician/notifications", icon: Bell },
    ],
  },
]

// Customer navigation items
const customerNavItems = [
  {
    title: "Account Overview",
    items: [
      { title: "Dashboard", url: "/customer/dashboard", icon: LayoutDashboard },
      { title: "My Account", url: "/customer/account", icon: UserIcon },
      { title: "Usage Reports", url: "/customer/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Billing & Payments",
    items: [
      { title: "Bills & Invoices", url: "/customer/bills", icon: Receipt },
      { title: "Payment History", url: "/customer/payments", icon: CreditCard },
      { title: "Auto Pay", url: "/customer/autopay", icon: Calendar },
    ],
  },
  {
    title: "Support & Services",
    items: [
      { title: "My Complaints", url: "/customer/complaints", icon: Headphones },
      { title: "Service Requests", url: "/customer/requests", icon: ClipboardList },
      { title: "Contact Support", url: "/customer/support", icon: Phone },
    ],
  },
  {
    title: "Account Management",
    items: [
      { title: "Plan Details", url: "/customer/plan", icon: Package },
      { title: "Notifications", url: "/customer/notifications", icon: Bell },
      { title: "Referrals", url: "/customer/referrals", icon: Users },
    ],
  },
]

// Staff navigation items
const staffNavItems = [
  {
    title: "Daily Work",
    items: [
      { title: "Dashboard", url: "/staff/dashboard", icon: LayoutDashboard },
      { title: "My Tasks", url: "/staff/tasks", icon: ClipboardList },
      { title: "Assigned Tickets", url: "/staff/tickets", icon: Headphones },
    ],
  },
  {
    title: "Customer Management",
    items: [
      { title: "Customer Support", url: "/staff/customers", icon: Users },
      { title: "Onboarding Queue", url: "/staff/onboarding", icon: UserCheck },
      { title: "Follow-ups", url: "/staff/followups", icon: Phone },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Operator Management", url: "/staff/operators", icon: Building2 },
      { title: "Vendor Relations", url: "/staff/vendors", icon: ShoppingCart },
      { title: "Quality Control", url: "/staff/quality", icon: CheckCircle },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      { title: "Performance", url: "/staff/performance", icon: BarChart3 },
      { title: "Activity Logs", url: "/staff/logs", icon: FileText },
      { title: "Notifications", url: "/staff/notifications", icon: Bell },
    ],
  },
]

// Vendor navigation items
const vendorNavItems = [
  {
    title: "E-Commerce Panel",
    items: [
      { title: "Dashboard", url: "/vendor/dashboard", icon: LayoutDashboard },
      { title: "Product Management", url: "/vendor/products", icon: Package },
      { title: "Order Management", url: "/vendor/orders", icon: ShoppingCart },
    ],
  },
  {
    title: "Business Operations",
    items: [
      { title: "Inventory", url: "/vendor/inventory", icon: Database },
      { title: "Shipping & Delivery", url: "/vendor/shipping", icon: MapPin },
      { title: "Returns & Refunds", url: "/vendor/returns", icon: ArrowUpRight },
    ],
  },
  {
    title: "Finance & Analytics",
    items: [
      { title: "Payments & Settlement", url: "/vendor/payments", icon: CreditCard },
      { title: "Sales Analytics", url: "/vendor/analytics", icon: BarChart3 },
      { title: "Offers & Promotions", url: "/vendor/promotions", icon: Gift },
    ],
  },
  {
    title: "Account & Support",
    items: [
      { title: "Profile & KYC", url: "/vendor/profile", icon: UserIcon },
      { title: "Notifications", url: "/vendor/notifications", icon: Bell },
      { title: "Support", url: "/vendor/support", icon: Headphones },
    ],
  },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const getNavItems = () => {
    switch (user.role) {
      case "admin":
        return adminNavItems
      case "operator":
        return operatorNavItems
      case "technician":
        return technicianNavItems
      case "customer":
        return customerNavItems
      case "staff":
        return staffNavItems
      case "vendor":
        return vendorNavItems
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "operator":
        return "bg-blue-100 text-blue-800"
      case "technician":
        return "bg-orange-100 text-orange-800"
      case "vendor":
        return "bg-green-100 text-green-800"
      case "customer":
        return "bg-pink-100 text-pink-800"
      case "staff":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleProfileClick = () => {
    router.push(`/${user.role}/profile`)
  }

  const handleSettingsClick = () => {
    router.push(`/${user.role}/settings`)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${user.role}/dashboard`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sidebar-primary-foreground">
                  <Wifi className="size-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Network Solutions</span>
                  <span className="truncate text-xs capitalize">{user.role} Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.profileDetail.avater || "/placeholder.svg"} alt={user.profileDetail.name} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.profileDetail.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.profileDetail.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.profileDetail.avatar || "/placeholder.svg"}
                        alt={user.profileDetail.name}
                      />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user.profileDetail.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.profileDetail.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="secondary" className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(user.Permissions.status)}`}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
