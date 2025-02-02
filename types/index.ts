import { UserStatus, TaskStatus } from '@prisma/client'

export interface Performance {
  leads: number
  conversions: number
  conversionRate: number
}

export interface Telecaller {
  id: string
  name: string
  employeeId: string
  status: UserStatus
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  dueDate: string | null
}

export interface Manager {
  id: string
  employeeId: string
  name: string
  email: string
  status: UserStatus
  performance: Performance
  telecallers: Telecaller[]
  tasks: Task[]
}

export { TaskStatus }
