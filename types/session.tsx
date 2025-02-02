import { UserRole } from "@prisma/client"

export interface SessionUser {
  id: string
  employeeId: string
  name?: string | null
  email?: string | null
  role: UserRole
}