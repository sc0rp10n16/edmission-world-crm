import * as z from "zod"
import { UserRole } from "@prisma/client"

export const loginSchema = z.object({
  employeeId: z.string().min(1, {
    message: "Employee ID is required",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  employeeId: z.string().min(1, {
    message: "Employee ID is required",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  role: z.enum(['HEAD', 'MANAGER', 'TELECALLER', 'COUNSELOR', 'STUDENT']),
})

export type RegisterInput = z.infer<typeof registerSchema>