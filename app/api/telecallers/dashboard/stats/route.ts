// app/api/telecaller/dashboard/stats/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import {prisma} from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (session.user.role !== "TELECALLER") {
      return new NextResponse(JSON.stringify({ error: "Invalid role" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [leadStats, todaysCalls, pendingFollowUps, recentCalls] = await Promise.all([
      // Get leads by status
      prisma.lead.groupBy({
        by: ['status'],
        where: {
          assignedToId: session.user.id,
        },
        _count: {
          status: true,
        },
      }),

      // Get today's calls count
      prisma.call.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: today,
          },
        },
      }),

      // Get pending follow-ups count
      prisma.followUp.count({
        where: {
          call: {
            userId: session.user.id
          },
          status: "PENDING",
          scheduledFor: {
            lte: new Date(),
          },
        },
      }),

      // Get recent calls with lead info
      prisma.call.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          status: true,
          outcome: true,
          createdAt: true,
          lead: {
            select: {
              name: true,
              phone: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ])

    // Calculate total leads and conversion rate
    const totalLeads = leadStats.reduce((acc, curr) => acc + curr._count.status, 0)
    const convertedLeads = leadStats.find(stat => stat.status === "CONVERTED")?._count.status || 0
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    // Format lead statistics
    const leadsByStatus = leadStats.map(stat => ({
      status: stat.status,
      count: stat._count.status
    }))

    // Format recent calls
    const formattedRecentCalls = recentCalls.map(call => ({
      id: call.id,
      leadName: call.lead.name,
      leadPhone: call.lead.phone,
      leadEmail: call.lead.email,
      status: call.status,
      outcome: call.outcome,
      createdAt: call.createdAt
    }))

    // Calculate performance metrics
    const performanceMetrics = {
      totalLeads,
      convertedLeads,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      pendingFollowUps,
      todaysCalls
    }

    return NextResponse.json({
      stats: {
        ...performanceMetrics,
        leadsByStatus,
      },
      recentCalls: formattedRecentCalls,
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Add cache control headers if needed
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    })

  } catch (error) {
    console.error("[TELECALLER_DASHBOARD_STATS_GET]", error)
    
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Add GET options if needed
export const dynamic = 'force-dynamic' // Ensures the route is not cached
export const revalidate = 0 // Disable cache for this route