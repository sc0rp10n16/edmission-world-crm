import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserRole } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const fromDate = new Date(searchParams.get('from') || '')
    const toDate = new Date(searchParams.get('to') || '')
    const role = searchParams.get('role')

    // Define the role filter with proper types
    const whereClause = {
      status: 'ACTIVE' as const,
      createdAt: {
        lte: toDate
      },
      ...(role === 'ALL' 
        ? {
            OR: [
              { role: 'MANAGER' as UserRole },
              { role: 'TELECALLER' as UserRole }
            ]
          }
        : { role: role as UserRole }
      )
    }

    // Get performance data
    const performanceData = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        role: true,
        performance: {
          select: {
            leads: true,
            conversions: true,
            conversionRate: true,
          }
        },
        assignedLeads: {
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate
            }
          },
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    // Format the data
    const formattedData = performanceData.map(user => {
      const totalLeads = user.assignedLeads.length
      const conversions = user.assignedLeads.filter(lead => lead.status === 'CONVERTED').length
      const conversionRate = totalLeads > 0 ? (conversions / totalLeads) * 100 : 0

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        leads: totalLeads,
        conversions: conversions,
        conversionRate: conversionRate,
        performance: user.performance || {
          leads: 0,
          conversions: 0,
          conversionRate: 0
        }
      }
    })

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("[PERFORMANCE_REPORT_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}