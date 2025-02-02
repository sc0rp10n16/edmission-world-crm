// app/dashboard/telecaller/leads/page.tsx
import { TelecallerLeadsClient } from "@/components/telecaller/leads/telecaller-leads-client"
import { Metadata } from "next"


export const metadata: Metadata = {
  title: "Leads Management",
  description: "View and manage your leads",
}

export default function TelecallerLeadsPage() {
  return <TelecallerLeadsClient />
}