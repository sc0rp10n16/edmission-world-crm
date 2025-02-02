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

    // Get daily leads and conversions
    const dailyStats = await prisma.lead.groupBy({
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

    // Process the data by date
    const processedData = dailyStats.reduce<Record<string, any>>((acc, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0]
      
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          converted: 0,
          rate: 0
        }
      }

      acc[date].total += curr._count.id
      if (curr.status === 'CONVERTED') {
        acc[date].converted += curr._count.id
      }

      return acc
    }, {})

    // Calculate conversion rates
    const formattedData = Object.values(processedData).map(day => ({
      ...day,
      rate: day.total > 0 ? (day.converted / day.total) * 100 : 0
    }))

    // Sort by date
    const sortedData = formattedData.sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json(sortedData)
  } catch (error) {
    console.error("[CONVERSION_REPORT_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}