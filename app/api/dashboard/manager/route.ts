import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const managerId = session.user.id

    // Get current month dates
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Fetch all required data in parallel
    const [
      totalLeads,
      assignedLeads,
      activeTelecallers,
      monthlyPerformance
    ] = await Promise.all([
      // Total leads under this manager
      prisma.lead.count({
        where: {
          managedById: managerId
        }
      }),

      // Assigned leads count
      prisma.lead.count({
        where: {
          managedById: managerId,
          assignedToId: { not: null }
        }
      }),

      // Active telecallers count
      prisma.user.count({
        where: {
          managerId: managerId,
          role: 'TELECALLER',
          status: 'ACTIVE'
        }
      }),

      // Monthly performance data
      prisma.lead.groupBy({
        by: ['createdAt', 'status'],
        where: {
          managedById: managerId,
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        },
        _count: {
          id: true
        }
      })
    ])

    // Calculate conversion rate
    const convertedLeads = monthlyPerformance
      .filter(p => p.status === 'CONVERTED')
      .reduce((sum, p) => sum + p._count.id, 0)
    
    const totalMonthlyLeads = monthlyPerformance
      .reduce((sum, p) => sum + p._count.id, 0)

    const conversionRate = totalMonthlyLeads > 0
      ? (convertedLeads / totalMonthlyLeads) * 100
      : 0

    // Process performance data by date
    const performanceByDate = monthlyPerformance.reduce<Record<string, any>>((acc, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0]
      
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          converted: 0
        }
      }

      acc[date].total += curr._count.id
      if (curr.status === 'CONVERTED') {
        acc[date].converted += curr._count.id
      }

      return acc
    }, {})

    return NextResponse.json({
      totalLeads,
      assignedLeads,
      activeTelecallers,
      conversionRate: Number(conversionRate.toFixed(2)),
      leadsPerformance: Object.values(performanceByDate)
    })
  } catch (error) {
    console.error("[MANAGER_DASHBOARD_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}