// app/api/counselor/dashboard/stats/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "COUNSELOR") {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 403 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      todayFollowUps,
      upcomingFollowUps,
      interestedStudents,
      consultations,
      completedFollowUps
    ] = await Promise.all([
      // Today's follow-ups
      prisma.followUp.findMany({
        where: {
          assignedToId: session.user.id,
          scheduledFor: {
            gte: today,
            lt: tomorrow
          },
          status: "PENDING"
        },
        include: {
          call: {
            include: {
              lead: {
                select: {
                  name: true,
                  preferredCourses: true,
                  preferredCountries: true,
                  phone: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          scheduledFor: 'asc'
        }
      }),

      // Upcoming follow-ups
      prisma.followUp.findMany({
        where: {
          assignedToId: session.user.id,
          scheduledFor: {
            gte: tomorrow
          },
          status: "PENDING"
        },
        include: {
          call: {
            include: {
              lead: {
                select: {
                  name: true,
                  phone: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          scheduledFor: 'asc'
        },
        take: 5
      }),

      // Interested students assigned to counselor through follow-ups
      prisma.lead.findMany({
        where: {
          status: "INTERESTED",
          followUps: {
            some: {
              assignedToId: session.user.id
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          preferredCourses: true,
          preferredCountries: true,
          notes: true,
          createdAt: true,
          followUps: {
            where: {
              assignedToId: session.user.id
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Today's consultations
      prisma.counselingSession.count({
        where: {
          studentId: session.user.id,
          scheduledAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Completed follow-ups this week
      prisma.followUp.count({
        where: {
          assignedToId: session.user.id,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(today.setDate(today.getDate() - 7))
          }
        }
      })
    ])

    const formattedData = {
      todayFollowUps: todayFollowUps.length,
      newInterestedStudents: interestedStudents.length,
      todayConsultations: consultations,
      completedFollowUps,

      todayFollowUpsList: todayFollowUps.map(followUp => ({
        id: followUp.id,
        studentName: followUp.call.lead.name,
        scheduledTime: followUp.scheduledFor,
        preferredCourse: followUp.call.lead.preferredCourses[0],
        preferredCountry: followUp.call.lead.preferredCountries[0],
        phone: followUp.call.lead.phone,
        email: followUp.call.lead.email
      })),

      upcomingFollowUps: upcomingFollowUps.map(followUp => ({
        id: followUp.id,
        studentName: followUp.call.lead.name,
        scheduledTime: followUp.scheduledFor,
        phone: followUp.call.lead.phone,
        email: followUp.call.lead.email
      })),

      interestedStudents: interestedStudents.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        preferredCourse: student.preferredCourses[0],
        preferredCountry: student.preferredCountries[0],
        notes: student.notes,
        createdAt: student.createdAt,
        lastFollowUp: student.followUps[0]?.scheduledFor || null
      }))
    }

    return NextResponse.json(formattedData)

  } catch (error) {
    console.error("[COUNSELOR_DASHBOARD_STATS]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}