import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const telecallers = await prisma.user.findMany({
      where: {
        role: 'TELECALLER',
        managerId: null, // Only get unassigned telecallers
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        status: true,
        performance: {
          select: {
            leads: true,
            conversions: true,
            conversionRate: true,
          }
        }
      }
    })

    // Format the response with default values for null performance
    const formattedTelecallers = telecallers.map(telecaller => ({
      ...telecaller,
      performance: telecaller.performance || {
        leads: 0,
        conversions: 0,
        conversionRate: 0
      }
    }))

    return NextResponse.json(formattedTelecallers)
  } catch (error) {
    console.error("[TELECALLERS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}