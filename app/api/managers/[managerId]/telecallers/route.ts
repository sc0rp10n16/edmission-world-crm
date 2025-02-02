import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  req: Request,
  { params }: { params: { managerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const telecallers = await prisma.user.findMany({
      where: {
        role: 'TELECALLER',
        managerId: params.managerId
      },
      select: {
        id: true,
        name: true,
        employeeId: true,
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

    return NextResponse.json(telecallers)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Assign telecaller to manager
export async function POST(
  req: Request,
  { params }: { params: { managerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { telecallerId } = await req.json()

    // Check if telecaller exists and is not already assigned
    const telecaller = await prisma.user.findFirst({
      where: {
        id: telecallerId,
        role: 'TELECALLER',
        managerId: null
      }
    })

    if (!telecaller) {
      return NextResponse.json(
        { error: "Telecaller not found or already assigned" },
        { status: 400 }
      )
    }

    // Assign telecaller to manager
    const updatedTelecaller = await prisma.user.update({
      where: { id: telecallerId },
      data: { managerId: params.managerId }
    })

    return NextResponse.json(updatedTelecaller)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Remove telecaller from manager
export async function DELETE(
  req: Request,
  { params }: { params: { managerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { telecallerId } = await req.json()

    // Check if telecaller is assigned to this manager
    const telecaller = await prisma.user.findFirst({
      where: {
        id: telecallerId,
        role: 'TELECALLER',
        managerId: params.managerId
      }
    })

    if (!telecaller) {
      return NextResponse.json(
        { error: "Telecaller not found or not assigned to this manager" },
        { status: 400 }
      )
    }

    // Remove telecaller assignment
    const updatedTelecaller = await prisma.user.update({
      where: { id: telecallerId },
      data: { managerId: null }
    })

    return NextResponse.json(updatedTelecaller)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}