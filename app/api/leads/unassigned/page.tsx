// app/api/manager/leads/unassigned/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'MANAGER') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const leads = await prisma.lead.findMany({
      where: {
        managedById: session.user.id,
        assignedToId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        source: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}