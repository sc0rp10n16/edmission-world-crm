// app/api/manager/team/performance/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all telecallers for this manager
    const telecallers = await prisma.user.findMany({
      where: {
        managerId: session.user.id,
        role: 'TELECALLER',
      },
      include: {
        performance: true,
        assignedLeads: true,
        calls: {
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
            },
          },
        },
      },
    })

    const performanceData = telecallers.map(telecaller => ({
      id: telecaller.id,
      name: telecaller.name,
      callsMade: telecaller.calls.length,
      leadsConverted: telecaller.assignedLeads.filter(lead => lead.status === 'CONVERTED').length,
      conversionRate: telecaller.performance?.conversionRate || 0,
      trend: 'up', // You can calculate this based on historical data
      performance: telecaller.performance?.monthlyTarget || 0
    }))

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}