// app/dashboard/counselor/page.tsx
import { Metadata } from "next"
import { CounselorDashboard } from "@/components/roles/CounselorDashboard"

export const metadata: Metadata = {
  title: "Counselor Dashboard",
  description: "Manage your students and appointments"
}

export default function CounselorPage() {
  return <CounselorDashboard />
}