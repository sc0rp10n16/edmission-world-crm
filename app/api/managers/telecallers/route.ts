// app/api/manager/telecallers/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { hash } from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const telecallers = await prisma.user.findMany({
      where: {
        managerId: session.user.id,
        role: 'TELECALLER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        status: true,
        performance: {
          select: {
            leads: true,
            conversions: true,
            conversionRate: true,
            callsMade: true,
            monthlyTarget: true,
          }
        },
      },
    })

    return NextResponse.json(telecallers)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const hashedPassword = await hash(data.password, 12)

    const telecaller = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        employeeId: data.employeeId,
        role: 'TELECALLER',
        managerId: session.user.id,
        performance: {
          create: {
            leads: 0,
            conversions: 0,
            conversionRate: 0,
            callsMade: 0,
            monthlyTarget: 0,
          }
        }
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}