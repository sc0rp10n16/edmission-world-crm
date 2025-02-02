import { DefaultSession, DefaultUser } from "next-auth"
import { UserRole } from "@prisma/client"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      employeeId: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: UserRole
    employeeId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    employeeId: string
  }
}