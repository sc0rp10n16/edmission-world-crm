// app/api/telecaller/leads/[leadId]/call/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { LeadStatus, CallStatus, FollowUpStatus } from "@prisma/client"

export async function POST(
  request: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "TELECALLER") {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 })
    }

    const { leadId } = params
    const body = await request.json()
    const {
      leadStatus,
      preferredCountry,
      counsellorId,
      needsCounsellor,
      followUpDate,
      notes
    } = body

    // Verify lead ownership
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        assignedToId: session.user.id
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found or not assigned" },
        { status: 404 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create call record
      const call = await tx.call.create({
        data: {
          leadId,
          userId: session.user.id,
          status: CallStatus.CONNECTED,
          duration: 0,
          notes: notes || "",
          outcome: notes || "Call completed"
        }
      })

      // 2. Update lead
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          status: leadStatus as LeadStatus,
          lastContactedAt: new Date(),
          totalCallAttempts: {
            increment: 1
          },
          notes,
          ...(preferredCountry && {
            interestedCountry: preferredCountry,
            preferredCountries: [preferredCountry]
          })
        }
      })

      // 3. Create follow-up if needed
      if (followUpDate) {
        await tx.followUp.create({
          data: {
            callId: call.id,
            scheduledFor: new Date(followUpDate),
            status: FollowUpStatus.PENDING,
            notes: notes || "Follow-up required",
            assignedToId: needsCounsellor ? counsellorId : session.user.id
          }
        })
      }

      // 4. Create activity
      await tx.activity.create({
        data: {
          userId: session.user.id,
          leadId: leadId,
          type: "CALL_MADE",
          description: `Call made to ${lead.name}`,
          metadata: {
            status: leadStatus,
            hasFollowUp: !!followUpDate
          }
        }
      })

      return { call, lead: updatedLead }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error("[CALL_LOG_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to process call" },
      { status: 500 }
    )
  }
}