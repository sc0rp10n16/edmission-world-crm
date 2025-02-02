// app/api/manager/leads/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all leads managed by this manager
    const leads = await prisma.lead.findMany({
      where: {
        managedById: session.user.id,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate metrics
    const metrics = {
      total: leads.length,
      new: leads.filter(lead => lead.status === 'NEW').length,
      contacted: leads.filter(lead => lead.status === 'CONTACTED').length,
      interested: leads.filter(lead => lead.status === 'INTERESTED').length,
      converted: leads.filter(lead => lead.status === 'CONVERTED').length,
      unassigned: leads.filter(lead => !lead.assignedToId).length,
    }

    return NextResponse.json({
      leads,
      metrics,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}