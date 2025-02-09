// app/api/counselor/schedule-call/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "COUNSELOR") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { studentId, scheduledTime, notes } = body

    const counselingSession = await prisma.counselingSession.create({
      data: {
        studentId,
        title: "Initial Consultation",
        scheduledAt: new Date(scheduledTime),
        notes,
        status: "SCHEDULED",
        duration: 30 // Default 30 minutes
      }
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: studentId,
        title: "Counseling Session Scheduled",
        message: `Your counseling session has been scheduled for ${format(
          new Date(scheduledTime),
          "MMM d, h:mm a"
        )}`,
        type: "COUNSELING_SESSION"
      }
    })

    return NextResponse.json(counselingSession)

  } catch (error) {
    console.error("[SCHEDULE_COUNSELING]", error)
    return NextResponse.json(
      { error: "Failed to schedule counseling session" },
      { status: 500 }
    )
  }
}