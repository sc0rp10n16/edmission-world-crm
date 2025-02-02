import { UserRole } from "@prisma/client"

export const getRedirectPath = (role: string) => {
  const redirectPaths: Record<string, string> = {
    HEAD: '/dashboard/head',
    MANAGER: '/dashboard/manager',
    TELECALLER: '/dashboard/telecaller',
    COUNSELOR: '/dashboard/counselor',
    STUDENT: '/dashboard/student'
  }
  
  return redirectPaths[role] || '/dashboard'
}