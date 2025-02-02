// app/api/manager/telecallers/[id]/details/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const telecaller = await prisma.user.findFirst({
      where: {
        id: params.id,
        managerId: session.user.id,
      },
      include: {
        performance: true,
        assignedLeads: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
        },
        calls: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            duration: true,
            outcome: true,
            createdAt: true,
          },
        },
      },
    })

    if (!telecaller) {
      return NextResponse.json({ error: "Telecaller not found" }, { status: 404 })
    }

    // Get monthly stats for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyStats = await prisma.lead.groupBy({
      by: ['createdAt'],
      where: {
        assignedToId: telecaller.id,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    })

    return NextResponse.json({
      ...telecaller,
      recentLeads: telecaller.assignedLeads,
      recentCalls: telecaller.calls,
      monthlyStats: monthlyStats.map(stat => ({
        month: stat.createdAt.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
        leads: stat._count.id,
        conversions: 0, // You'll need to add logic to calculate conversions
      })),
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}