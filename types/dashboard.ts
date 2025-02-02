import { UserRole, UserStatus, LeadStatus, TaskStatus } from '@prisma/client'

export interface TeamMember {
  id: string
  name: string
  email: string
  employeeId: string
  role: UserRole
  status: UserStatus
  performance: TeamPerformance
}

export interface TeamPerformance {
  leads: number
  conversions: number
  conversionRate: number
  callsMade: number
  monthlyTarget: number
}

export interface DashboardMetrics {
  totalManagers: number
  activeTelecallers: number
  totalAdmissions: number
  pendingTasks: number
  managerGrowth: number
  telecallerGrowth: number
  admissionGrowth: number
  recentLeads: number
  currentMonthTarget: number
  currentMonthAchieved: number
}

export interface Activity {
  id: string
  type: string
  description: string
  metadata?: Record<string, any>
  userId: string
  user: {
    name: string
    role: UserRole
  }
  createdAt: Date
}

export interface Lead {
  id: string
  name: string
  email?: string
  phone: string
  course?: string
  status: LeadStatus
  source?: string
  assignedTo?: TeamMember
  managedBy?: TeamMember
  calls: Call[]
  createdAt: Date
  updatedAt: Date
}

export interface Call {
  id: string
  leadId: string
  userId: string
  duration: number
  notes?: string
  outcome: string
  scheduledAt?: Date
  createdAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: number
  assignedTo: TeamMember
  createdBy: TeamMember
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Achievement {
  id: string
  performanceId: string
  title: string
  description: string
  date: Date
  type: string
  reward?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  type: string
  createdAt: Date
}

export interface DashboardFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  status?: UserStatus[]
  role?: UserRole[]
  searchQuery?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DashboardResponse<T> {
  data: T
  total: number
  pages: number
}