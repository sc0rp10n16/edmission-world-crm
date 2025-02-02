// lib/queries/leads.ts
import {prisma} from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LeadStatus, CallStatus } from "@prisma/client"
import { LogCallInput } from "@/types/calls"

export async function getLeadsForTelecaller() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TELECALLER") {
      throw new Error("Unauthorized")
    }

    const leads = await prisma.lead.findMany({
      where: {
        assignedToId: session.user.id,
        status: {
          not: "CONVERTED"
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        status: true,
        lastContactedAt: true,
        nextFollowUpDate: true,
        totalCallAttempts: true,
        preferredCourses: true,
        preferredCountries: true,
        calls: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            status: true,
            createdAt: true,
            notes: true
          }
        }
      },
      orderBy: [
        {
          priority: 'desc'
        },
        {
          nextFollowUpDate: 'asc'
        }
      ]
    })

    return leads
  } catch (error) {
    console.error("[GET_TELECALLER_LEADS]", error)
    throw new Error("Failed to fetch leads")
  }
}

export async function getTodaysFollowUps() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TELECALLER") {
      throw new Error("Unauthorized")
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const followUps = await prisma.lead.findMany({
      where: {
        assignedToId: session.user.id,
        nextFollowUpDate: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        nextFollowUpDate: true,
        calls: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            notes: true
          }
        }
      }
    })

    return followUps
  } catch (error) {
    console.error("[GET_TODAYS_FOLLOWUPS]", error)
    throw new Error("Failed to fetch follow-ups")
  }
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  notes?: string
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TELECALLER") {
      throw new Error("Unauthorized")
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { assignedToId: true }
    })

    if (!lead || lead.assignedToId !== session.user.id) {
      throw new Error("Unauthorized")
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        notes,
        updatedAt: new Date()
      }
    })

    return updatedLead
  } catch (error) {
    console.error("[UPDATE_LEAD_STATUS]", error)
    throw new Error("Failed to update lead status")
  }
}

export async function logCall({
  leadId,
  status,
  notes,
  followUpDate,
  outcome
}: LogCallInput) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TELECALLER") {
      throw new Error("Unauthorized")
    }

    const call = await prisma.$transaction(async (tx) => {
      // Create the call log
      const call = await tx.call.create({
        data: {
          leadId,
          userId: session.user.id,
          status,
          notes,
          outcome,  // Include outcome in call creation
          duration: 0 // You might want to calculate actual duration
        }
      })

      // Update lead status and follow-up
      await tx.lead.update({
        where: { id: leadId },
        data: {
          lastContactedAt: new Date(),
          nextFollowUpDate: followUpDate,
          totalCallAttempts: {
            increment: 1
          }
        }
      })

      // If follow-up date is provided, create a follow-up
      if (followUpDate) {
        await tx.followUp.create({
          data: {
            callId: call.id,
            scheduledFor: followUpDate,
            notes: `Follow-up scheduled from call on ${new Date().toLocaleDateString()}`
          }
        })
      }

      return call
    })

    return call
  } catch (error) {
    console.error("[LOG_CALL]", error)
    throw new Error("Failed to log call")
  }
}

export async function getLeadDetails(leadId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TELECALLER") {
      throw new Error("Unauthorized")
    }

    const lead = await prisma.lead.findUnique({
      where: { 
        id: leadId,
        assignedToId: session.user.id
      },
      include: {
        calls: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            followUp: true
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!lead) {
      throw new Error("Lead not found")
    }

    return lead
  } catch (error) {
    console.error("[GET_LEAD_DETAILS]", error)
    throw new Error("Failed to fetch lead details")
  }
}

export async function getLeadStats() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TELECALLER") {
      throw new Error("Unauthorized")
    }

    const stats = await prisma.lead.groupBy({
      by: ['status'],
      where: {
        assignedToId: session.user.id
      },
      _count: {
        status: true
      }
    })

    const totalCalls = await prisma.call.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const pendingFollowUps = await prisma.followUp.count({
      where: {
        call: {
          userId: session.user.id
        },
        status: "PENDING",
        scheduledFor: {
          lte: new Date()
        }
      }
    })

    return {
      leadsByStatus: stats,
      todaysCalls: totalCalls,
      pendingFollowUps
    }
  } catch (error) {
    console.error("[GET_LEAD_STATS]", error)
    throw new Error("Failed to fetch lead statistics")
  }
}