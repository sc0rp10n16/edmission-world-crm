"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  ClipboardList,
  GraduationCap,
  BarChart3,
  Settings,
  FileSpreadsheet,
  CalendarDays,
  UserPlus,
  MessageSquare,
  BookOpen,
  FileCheck,
  Plane,
  School,
  Contact
} from "lucide-react"

const roleNavItems = {
  HEAD: [
    { 
      title: "Dashboard", 
      href: "/dashboard/head", 
      icon: LayoutDashboard 
    },
    { 
      title: "Manage Team", 
      href: "/dashboard/head/manage-managers", 
      icon: Users,
      subItems: [
        {
          title: "Managers & Telecallers",
          description: "Manage managers and assign telecallers",
          href: "/dashboard/head/manage-managers",
          icon: Users
        }
      ]
    },
    { 
      title: "Reports", 
      href: "/dashboard/head/reports", 
      icon: BarChart3,
      subItems: [
        {
          title: "Performance Reports",
          description: "View team performance metrics",
          href: "/dashboard/head/reports/performance",
          icon: BarChart3
        },
        {
          title: "Conversion Reports",
          description: "View lead conversion data",
          href: "/dashboard/head/reports/conversions",
          icon: BarChart3
        }
      ]
    },
    {
      title: "Students",
      href: "/dashboard/head/students",
      icon: GraduationCap,
      subItems: [
        {
          title: "Applications",
          description: "View all student applications",
          href: "/dashboard/head/students/applications",
          icon: ClipboardList
        },
        {
          title: "Visa Status",
          description: "Track visa applications",
          href: "/dashboard/head/students/visa-status",
          icon: Plane
        }
      ]
    },
  ],
  MANAGER: [
    {
      title: "Dashboard",
      href: "/dashboard/manager",
      icon: LayoutDashboard
    },
    {
      title: "Team",
      href: "/dashboard/manager/team",
      icon: Users,
      subItems: [
        {
          title: "Telecallers",
          description: "Manage your telecaller team",
          href: "/dashboard/manager/team/telecallers",
          icon: PhoneCall
        },
        {
          title: "Performance",
          description: "View team performance",
          href: "/dashboard/manager/team/performance",
          icon: BarChart3
        }
      ]
    },
    {
      title: "Leads",
      href: "/dashboard/manager/leads",
      icon: FileSpreadsheet,
      subItems: [
        {
          title: "Upload Leads",
          description: "Import new leads",
          href: "/dashboard/manager/leads/upload",
          icon: UserPlus
        },
        {
          title: "Assign Leads",
          description: "Distribute leads to telecallers",
          href: "/dashboard/manager/leads/assign",
          icon: ClipboardList
        }
      ]
    },
    
  ],
  TELECALLER: [
    {
      title: "Dashboard",
      href: "/dashboard/telecaller",
      icon: LayoutDashboard
    },
    {
      title: "Leads",
      href: "/dashboard/telecaller/leads/my-leads",
      icon: Users,
      subItems: [
        {
          title: "My Leads",
          description: "View assigned leads",
          href: "/dashboard/telecaller/leads/my-leads",
          icon: FileSpreadsheet
        },
        
      ]
    },
    {
      title: "Follow-ups",
      href: "/dashboard/telecaller/followups",
      icon: PhoneCall,
      subItems: [
        {
          title: "Pending",
          description: "View pending follow-ups",
          href: "/dashboard/telecaller/followups/pending",
          icon: ClipboardList
        },
        {
          title: "Completed",
          description: "View completed follow-ups",
          href: "/dashboard/telecaller/followups/completed",
          icon: FileCheck
        }
      ]
    },
    {
      title: "Performance",
      href: "/dashboard/telecaller/performance",
      icon: BarChart3
    }
  ],
  COUNSELOR: [
    {
      title: "Dashboard",
      href: "/dashboard/counselor",
      icon: LayoutDashboard
    },
    {
      title: "Students",
      href: "/dashboard/counselor/students",
      icon: GraduationCap,
      subItems: [
        {
          title: "All Students",
          description: "View all students",
          href: "/dashboard/counselor/students/all",
          icon: Users
        },
        {
          title: "Appointments",
          description: "Scheduled counseling sessions",
          href: "/dashboard/counselor/students/appointments",
          icon: CalendarDays
        }
      ]
    },
    {
      title: "Applications",
      href: "/dashboard/counselor/applications",
      icon: FileCheck,
      subItems: [
        {
          title: "Process Applications",
          description: "Handle student applications",
          href: "/dashboard/counselor/applications/process",
          icon: ClipboardList
        },
        {
          title: "Visa Processing",
          description: "Manage visa applications",
          href: "/dashboard/counselor/applications/visa",
          icon: Plane
        }
      ]
    },
    {
      title: "Universities",
      href: "/dashboard/counselor/universities",
      icon: School
    }
  ],
  STUDENT: [
    {
      title: "Dashboard",
      href: "/dashboard/student",
      icon: LayoutDashboard
    },
    {
      title: "My Applications",
      href: "/dashboard/student/applications",
      icon: FileCheck,
      subItems: [
        {
          title: "Application Status",
          description: "Track your applications",
          href: "/dashboard/student/applications/status",
          icon: ClipboardList
        },
        {
          title: "Required Documents",
          description: "View document requirements",
          href: "/dashboard/student/applications/documents",
          icon: FileSpreadsheet
        }
      ]
    },
    {
      title: "Counseling",
      href: "/dashboard/student/counseling",
      icon: MessageSquare,
      subItems: [
        {
          title: "Book Session",
          description: "Schedule counseling session",
          href: "/dashboard/student/counseling/book",
          icon: CalendarDays
        },
        {
          title: "Past Sessions",
          description: "View previous sessions",
          href: "/dashboard/student/counseling/history",
          icon: ClipboardList
        }
      ]
    },
    {
      title: "Resources",
      href: "/dashboard/student/resources",
      icon: BookOpen,
      subItems: [
        {
          title: "Universities",
          description: "Browse universities",
          href: "/dashboard/student/resources/universities",
          icon: School
        },
        {
          title: "Visa Guide",
          description: "Visa application guide",
          href: "/dashboard/student/resources/visa-guide",
          icon: Plane
        }
      ]
    }
  ]
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role as keyof typeof roleNavItems
  const routes = roleNavItems[role] || []

  if (!routes.length) return null

  return (
    <aside className={cn("w-64 bg-white border-r h-screen", className)}>
      <div className="flex flex-col h-full">

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {routes.map((route) => (
              <div key={route.href} className="space-y-1">
                {/* Main Menu Item */}
                <Link
                  href={route.href}
                  className={cn(
                    "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === route.href
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <route.icon className={cn(
                    "h-5 w-5 shrink-0",
                    pathname === route.href
                      ? "text-primary-foreground"
                      : "text-gray-500 group-hover:text-gray-900"
                  )} />
                  {route.title}
                </Link>

                {/* Sub Items */}
                {route.subItems?.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex flex-col gap-y-1 rounded-md px-3 py-2 text-sm ml-4",
                      pathname === item.href
                        ? "bg-gray-100"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-x-3">
                      <item.icon className={cn(
                        "h-4 w-4",
                        pathname === item.href
                          ? "text-primary"
                          : "text-gray-500 group-hover:text-gray-900"
                      )} />
                      <span className={cn(
                        pathname === item.href
                          ? "text-gray-900 font-medium"
                          : "text-gray-700 group-hover:text-gray-900"
                      )}>
                        {item.title}
                      </span>
                    </div>
                    {item.description && (
                      <span className="text-xs text-gray-500 ml-7">
                        {item.description}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </nav>

        {/* Settings Link */}
        <div className="border-t p-4">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium",
              pathname === "/dashboard/settings"
                ? "bg-primary text-primary-foreground"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Settings className={cn(
              "h-5 w-5",
              pathname === "/dashboard/settings"
                ? "text-primary-foreground"
                : "text-gray-500"
            )} />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  )
}