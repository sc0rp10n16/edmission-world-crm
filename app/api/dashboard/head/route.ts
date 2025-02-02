import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the current date and last month's date
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all metrics in parallel
    const [
      currentManagerStats,
      lastMonthManagerStats,
      currentTelecallerStats,
      lastMonthTelecallerStats,
      currentApplicationStats,
      lastMonthApplicationStats,
      pendingTasks,
      recentLeadsCount,
      performanceStats,
      visaStats
    ] = await Promise.all([
      // Current active managers
      prisma.user.count({
        where: {
          role: 'MANAGER',
          status: 'ACTIVE',
        }
      }),

      // Last month active managers
      prisma.user.count({
        where: {
          role: 'MANAGER',
          status: 'ACTIVE',
          createdAt: { lt: lastMonth }
        }
      }),

      // Current active telecallers
      prisma.user.count({
        where: {
          role: 'TELECALLER',
          status: 'ACTIVE'
        }
      }),

      // Last month active telecallers
      prisma.user.count({
        where: {
          role: 'TELECALLER',
          status: 'ACTIVE',
          createdAt: { lt: lastMonth }
        }
      }),

      // Current month applications
      prisma.application.count({
        where: {
          createdAt: { gte: firstDayOfMonth }
        }
      }),

      // Last month applications
      prisma.application.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: firstDayOfMonth
          }
        }
      }),

      // Pending tasks
      prisma.task.count({
        where: {
          status: 'PENDING'
        }
      }),

      // Recent leads (last 7 days)
      prisma.lead.count({
        where: {
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          }
        }
      }),

      // Performance statistics
      prisma.performance.aggregate({
        _avg: {
          conversionRate: true
        },
        _sum: {
          monthlyTarget: true,
          conversions: true
        }
      }),

      // Visa statistics for current month
      prisma.application.groupBy({
        by: ['status'],
        where: {
          status: {
            in: ['VISA_APPROVED', 'VISA_REJECTED', 'VISA_PROCESSING']
          },
          updatedAt: {
            gte: firstDayOfMonth
          }
        },
        _count: true
      })
    ])

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    // Process visa statistics
    const visaApproved = visaStats.find(stat => stat.status === 'VISA_APPROVED')?._count ?? 0
    const visaRejected = visaStats.find(stat => stat.status === 'VISA_REJECTED')?._count ?? 0
    const visaProcessing = visaStats.find(stat => stat.status === 'VISA_PROCESSING')?._count ?? 0

    const metrics = {
      // Staff metrics
      totalManagers: currentManagerStats,
      activeTelecallers: currentTelecallerStats,
      managerGrowth: calculateGrowth(currentManagerStats, lastMonthManagerStats),
      telecallerGrowth: calculateGrowth(currentTelecallerStats, lastMonthTelecallerStats),
      
      // Application metrics
      totalApplications: currentApplicationStats,
      applicationGrowth: calculateGrowth(currentApplicationStats, lastMonthApplicationStats),
      
      // Task metrics
      pendingTasks,
      
      // Lead metrics
      recentLeads: recentLeadsCount,
      
      // Performance metrics
      averageConversionRate: performanceStats._avg.conversionRate || 0,
      currentMonthTarget: performanceStats._sum.monthlyTarget || 0,
      currentMonthAchieved: performanceStats._sum.conversions || 0,
      
      // Visa metrics
      visaMetrics: {
        approved: visaApproved,
        rejected: visaRejected,
        processing: visaProcessing,
        successRate: visaApproved + visaRejected > 0 
          ? (visaApproved / (visaApproved + visaRejected)) * 100 
          : 0
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[DASHBOARD_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}