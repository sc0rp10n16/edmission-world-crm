import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    if (!session || session.user.role !== 'HEAD') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const where = {
      role: 'MANAGER',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const orderBy = sortBy === 'conversionRate' 
      ? { performance: { conversionRate: sortOrder } }
      : { [sortBy]: sortOrder }

    const [total, managers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy,
        include: {
          performance: true
        }
      })
    ])

    // Transform the data to match the expected format
    const formattedManagers = managers.map(manager => ({
      id: manager.id,
      name: manager.name,
      email: manager.email,
      employeeId: manager.employeeId,
      status: manager.status.toLowerCase(),
      performance: {
        leads: manager.performance?.leads || 0,
        conversions: manager.performance?.conversions || 0,
        conversionRate: manager.performance?.conversionRate || 0
      }
    }))

    return NextResponse.json({
      managers: formattedManagers,
      total,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("[TEAM_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}