// app/api/telecaller/leads/[leadId]/call-logs/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import {prisma} from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { leadId } = params
    const body = await req.json()

    if (!session || session.user.role !== "TELECALLER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Create call log and follow-up if scheduled
    const callLog = await prisma.callLog.create({
      data: {
        leadId,
        telecallerId: session.user.id,
        status: body.status,
        notes: body.notes,
        // Create follow-up if date is provided
        followUp: body.followUpDate ? {
          create: {
            scheduledFor: new Date(body.followUpDate),
            notes: body.followUpNotes,
            leadId,
            telecallerId: session.user.id
          }
        } : undefined
      }
    })

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: body.status,
        lastContactedAt: new Date()
      }
    })

    return NextResponse.json(callLog)
  } catch (error) {
    console.error("[TELECALLER_CALL_LOG_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { leadId } = params

    if (!session || session.user.role !== "TELECALLER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const callLogs = await prisma.callLog.findMany({
      where: {
        leadId,
        telecallerId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        followUp: true
      }
    })

    return NextResponse.json(callLogs)
  } catch (error) {
    console.error("[TELECALLER_CALL_LOGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}