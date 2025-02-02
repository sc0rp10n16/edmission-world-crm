// app/api/manager/team/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session:", session) // Debug log

    if (!session || session.user?.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all telecallers assigned to this manager
    const telecallers = await prisma.user.findMany({
      where: {
        managerId: session.user.id,
        role: 'TELECALLER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        status: true,
        performance: {
          select: {
            leads: true,
            conversions: true,
            conversionRate: true,
            callsMade: true,
            monthlyTarget: true,
          }
        },
        assignedLeads: {
          where: {
            status: {
              not: 'LOST',
            },
          },
          select: {
            id: true,
          }
        },
      },
    })

    console.log("Telecallers found:", telecallers.length) // Debug log

    // Calculate team metrics
    const metrics = {
      totalTelecallers: telecallers.length,
      activeTelecallers: telecallers.filter(t => t.status === 'ACTIVE').length,
      totalLeads: telecallers.reduce((sum, t) => sum + t.assignedLeads.length, 0),
      averageConversion: telecallers.length ? 
        (telecallers.reduce((sum, t) => sum + (t.performance?.conversionRate || 0), 0) / telecallers.length).toFixed(1) : 0,
      targetAchievement: calculateTargetAchievement(telecallers)
    }

    console.log("Metrics calculated:", metrics) // Debug log

    return NextResponse.json({
      telecallers: formatTelecallers(telecallers),
      metrics
    })

  } catch (error) {
    console.error('API Error:', error) // Debug log
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}

function formatTelecallers(telecallers: any[]) {
  return telecallers.map(t => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.employeeId,
    status: t.status,
    performance: {
      leads: t.assignedLeads.length,
      conversions: t.performance?.conversions || 0,
      conversionRate: t.performance?.conversionRate || 0,
      callsMade: t.performance?.callsMade || 0,
      monthlyTarget: t.performance?.monthlyTarget || 0,
    }
  }))
}

function calculateTargetAchievement(telecallers: any[]) {
  const totalTarget = telecallers.reduce((sum, t) => 
    sum + (t.performance?.monthlyTarget || 0), 0)
  const totalAchieved = telecallers.reduce((sum, t) => 
    sum + (t.performance?.conversions || 0), 0)
  return totalTarget ? 
    ((totalAchieved / totalTarget) * 100).toFixed(1) : 0
}