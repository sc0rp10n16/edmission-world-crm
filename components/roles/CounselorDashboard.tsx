// components/roles/CounselorDashboard.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Phone, Users, Calendar, Clock, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export function CounselorDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['counselor-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/counselor/dashboard/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    refetchInterval: 30000,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6 p-8">
      {/* Overview Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Follow-ups Card */}
        <Card className="col-span-1">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Follow-up Calls</h2>
                <p className="text-sm text-muted-foreground">Today's scheduled follow-ups</p>
              </div>
              <Badge variant="secondary" className="px-2 py-1">
                {stats?.todayFollowUps} scheduled
              </Badge>
            </div>

            <div className="space-y-4">
              {stats?.todayFollowUpsList?.map((followUp: any) => (
                <div key={followUp.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{followUp.studentName}</h3>
                      <Badge>{followUp.preferredCourse}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{followUp.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{format(new Date(followUp.scheduledTime), "h:mm a")}</span>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </div>
              ))}
              {stats?.todayFollowUpsList?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No follow-ups scheduled for today
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Interested Students Card */}
        <Card className="col-span-1">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Interested Students</h2>
                <p className="text-sm text-muted-foreground">Students requiring counseling</p>
              </div>
              <Badge variant="secondary" className="px-2 py-1">
                {stats?.newInterestedStudents} new
              </Badge>
            </div>

            <div className="space-y-4">
              {stats?.interestedStudents?.map((student: any) => (
                <div key={student.id} className="p-4 border rounded-lg hover:bg-accent/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{student.name}</h3>
                        <Badge variant="outline">New Lead</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{student.phone}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">{student.preferredCourse}</Badge>
                        <Badge variant="secondary">{student.preferredCountry}</Badge>
                      </div>
                      {student.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{student.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {stats?.interestedStudents?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No new interested students
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Follow-ups */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">Upcoming Follow-ups</h2>
              <p className="text-sm text-muted-foreground">Next scheduled calls</p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {stats?.upcomingFollowUps?.map((followUp: any) => (
              <div key={followUp.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{followUp.studentName}</h3>
                    <p className="text-sm text-muted-foreground">{followUp.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{format(new Date(followUp.scheduledTime), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}