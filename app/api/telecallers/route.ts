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

    // Get unassigned telecallers or filter by query
    const { searchParams } = new URL(req.url)
    const managerId = searchParams.get('managerId')
    const search = searchParams.get('search')

    const telecallers = await prisma.user.findMany({
      where: {
        role: 'TELECALLER',
        ...(managerId ? { managerId } : { managerId: null }), // Get either assigned or unassigned
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { employeeId: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        status: true,
        managedBy: {
          select: {
            id: true,
            name: true
          }
        },
        performance: {
          select: {
            leads: true,
            conversions: true,
            conversionRate: true
          }
        }
      }
    })

    return NextResponse.json(telecallers)
  } catch (error) {
    console.error("[TELECALLERS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}