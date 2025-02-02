import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const fromDate = new Date(searchParams.get('from') || '')
    const toDate = new Date(searchParams.get('to') || '')

    // Get performance data
    const performanceData = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'MANAGER' },
          { role: 'TELECALLER' }
        ],
        status: 'ACTIVE'
      },
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
        }
      }
    })

    // Get conversion trends
    const conversionData = await prisma.lead.groupBy({
      by: ['createdAt', 'status'],
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate
        }
      },
      _count: {
        id: true
      }
    })

    // Get summary stats
    const [activeManagers, activeTelecallers, totalLeads, convertedLeads] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'MANAGER',
          status: 'ACTIVE'
        }
      }),
      prisma.user.count({
        where: {
          role: 'TELECALLER',
          status: 'ACTIVE'
        }
      }),
      prisma.lead.count({
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate
          }
        }
      }),
      prisma.lead.count({
        where: {
          status: 'CONVERTED',
          createdAt: {
            gte: fromDate,
            lte: toDate
          }
        }
      })
    ])

    // Format performance data
    const formattedPerformanceData = performanceData.map(user => ({
      name: user.name,
      leads: user.performance?.leads || 0,
      conversions: user.performance?.conversions || 0,
      conversionRate: user.performance?.conversionRate || 0,
    }))

    // Format conversion data by dates
    const formattedConversionData = conversionData.reduce<{ [key: string]: any }>((acc, data) => {
      const date = data.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          converted: 0,
          rate: 0
        }
      }
      
      acc[date].total += data._count.id
      if (data.status === 'CONVERTED') {
        acc[date].converted += data._count.id
      }
      
      acc[date].rate = (acc[date].converted / acc[date].total) * 100
      
      return acc
    }, {})

    return NextResponse.json({
      performanceData: formattedPerformanceData,
      conversionData: Object.values(formattedConversionData),
      summaryStats: {
        totalLeads,
        totalConversions: convertedLeads,
        avgConversionRate: totalLeads ? (convertedLeads / totalLeads) * 100 : 0,
        activeManagers,
        activeTelecallers
      }
    })
  } catch (error) {
    console.error("[REPORTS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}