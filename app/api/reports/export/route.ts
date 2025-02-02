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
    const reportType = searchParams.get('type') // 'performance' or 'conversion'

    let data

    if (reportType === 'performance') {
      data = await prisma.user.findMany({
        where: {
          OR: [{ role: 'MANAGER' }, { role: 'TELECALLER' }],
          status: 'ACTIVE'
        },
        select: {
          name: true,
          role: true,
          performance: true,
          assignedLeads: {
            where: {
              createdAt: {
                gte: fromDate,
                lte: toDate
              }
            }
          }
        }
      })
    } else {
      // Conversion report data
      data = await prisma.lead.groupBy({
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
    }

    // Convert data to CSV format
    // Implementation depends on your CSV generation library
    // You might want to use 'papaparse' or similar

    return new NextResponse(data, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${reportType}-report.csv"`
      }
    })
  } catch (error) {
    console.error("[REPORT_EXPORT_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}