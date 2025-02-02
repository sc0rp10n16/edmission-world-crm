// components/roles/TelecallerDashboard.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import {
  Phone,
  UserCheck,
  Clock,
  BarChart3,
  Calendar,
  PhoneMissed,
  PhoneOff,
  Timer,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useToast } from "@/hooks/use-toast"

const COLORS = {
  'INTERESTED': '#10B981',
  'NOT_INTERESTED': '#EF4444',
  'FOLLOW_UP': '#F59E0B',
  'NEW': '#3B82F6',
  'CONTACTED': '#8B5CF6',
}

export function TelecallerDashboard() {
  const { toast } = useToast()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['telecaller-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/telecaller/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return response.json()
    },
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {stats?.userName}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your leads today
          </p>
        </div>
        <a href="/dashboard/telecaller/leads">
        <Button size="lg" className="gap-2">
          
          <Phone className="h-5 w-5" />
          Start Making Calls
          
        </Button>
        </a>
          
          
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center justify-center">
        <StatsCard
          title="Today's Calls"
          value={stats?.todaysCalls || 0}
          icon={Phone}
          description={`${stats?.callTargetProgress || 0}% of daily target`}
          trend={stats?.callTrend}
        />
        <StatsCard
          title="Pending Follow-ups"
          value={stats?.pendingFollowUps || 0}
          icon={Clock}
          description="Requires attention"
          variant="warning"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          icon={Target}
          description="Last 30 days"
          variant="success"
        />
        
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Call Performance Chart */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Call Performance</h2>
            <Button variant="outline" size="sm">
              Last 7 Days
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.callHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#3B82F6" 
                  name="Calls Made"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#10B981" 
                  name="Conversions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lead Status Distribution */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Lead Distribution</h2>
            <Button variant="outline" size="sm">
              View All Leads
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.leadsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.leadsByStatus.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.status as keyof typeof COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activities and Upcoming Tasks */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <RecentActivities activities={stats?.recentActivities} />
        <UpcomingTasks tasks={stats?.upcomingTasks} />
      </div>
    </div>
  )
}

// Create additional components for better organization:

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  variant = "default" 
}: {
  title: string
  value: string | number
  icon: any
  description: string
  trend?: number
  variant?: "default" | "success" | "warning" | "danger"
}) {
  const variantStyles = {
    default: "bg-card",
    success: "bg-green-50 border-green-100",
    warning: "bg-yellow-50 border-yellow-100",
    danger: "bg-red-50 border-red-100"
  }

  return (
    <Card className={`p-6 ${variantStyles[variant]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`rounded-full p-2 bg-primary/10`}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <Progress value={trend} className="h-2" />
        </div>
      )}
    </Card>
  )
}

function RecentActivities({ activities = [] }: { activities: any[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="rounded-full p-2 bg-primary/10">
              <activity.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function UpcomingTasks({ tasks = [] }: { tasks: any[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Upcoming Follow-ups</h2>
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">{task.time}</p>
              </div>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

function DashboardSkeleton() {
  // Add skeleton loading state
  return <div>Loading...</div>
} 