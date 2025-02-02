"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.role) {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`)
    }
  }, [session, router])

  return <div>Loading...</div>
}