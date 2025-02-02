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

    const managers = await prisma.user.findMany({
      where: {
        role: 'MANAGER',
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
        },
        telecallers: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            status: true,
          }
        },
        // For tasks, we need to use the correct relation name
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
          where: {
            status: {
              not: 'COMPLETED'
            }
          }
        }
      }
    })

    const formattedManagers = managers.map(manager => ({
      id: manager.id,
      employeeId: manager.employeeId,
      name: manager.name,
      email: manager.email,
      status: manager.status,
      performance: manager.performance || {
        leads: 0,
        conversions: 0,
        conversionRate: 0
      },
      telecallers: manager.telecallers || [],
      tasks: manager.assignedTasks || [] // Map assignedTasks to tasks
    }))

    return NextResponse.json(formattedManagers)
  } catch (error) {
    console.error("[MANAGERS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, employeeId, password } = body

    // Check if employee ID or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeId },
          { email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Employee ID or email already exists" },
        { status: 400 }
      )
    }

    // Create new manager
    const manager = await prisma.user.create({
      data: {
        name,
        email,
        employeeId,
        password, // Note: Ensure password is hashed before saving
        role: 'MANAGER',
        status: 'ACTIVE',
        performance: {
          create: {
            leads: 0,
            conversions: 0,
            conversionRate: 0
          }
        }
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

    return NextResponse.json(manager)
  } catch (error) {
    console.error("[MANAGERS_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}