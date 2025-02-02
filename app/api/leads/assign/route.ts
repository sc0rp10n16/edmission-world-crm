// app/api/manager/leads/assign/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'MANAGER') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { leadIds, telecallerId } = await req.json()

    // Verify telecaller belongs to manager
    const telecaller = await prisma.user.findFirst({
      where: {
        id: telecallerId,
        managerId: session.user.id,
      },
    })

    if (!telecaller) {
      return new NextResponse("Invalid telecaller", { status: 400 })
    }

    // Update leads
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        managedById: session.user.id,
      },
      data: {
        assignedToId: telecallerId,
        status: 'NEW',
      },
    })

    // Create activity records
    await prisma.activity.createMany({
      data: leadIds.map((leadId: string) => ({
        type: 'LEAD_ASSIGNED',
        description: `Lead assigned to ${telecaller.name}`,
        userId: session.user.id,
        leadId: leadId,
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}