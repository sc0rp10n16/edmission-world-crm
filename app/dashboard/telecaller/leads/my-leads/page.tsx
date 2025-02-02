// app/dashboard/telecaller/leads/my-leads/page.tsx
import { MyLeadsClient } from "@/components/telecaller/leads/my-leads-client"
import { Metadata } from "next"


export const metadata: Metadata = {
  title: "My Leads",
  description: "Manage and track your assigned leads",
}

export default function MyLeadsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      
      <MyLeadsClient />
    </div>
  )
}