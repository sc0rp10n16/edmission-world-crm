import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PATCH(
  req: Request,
  { params }: { params: { managerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await req.json()

    // Check if status is valid
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    // Check if manager exists
    const manager = await prisma.user.findUnique({
      where: { id: params.managerId }
    })

    if (!manager) {
      return NextResponse.json(
        { error: "Manager not found" },
        { status: 404 }
      )
    }

    // Update manager status
    const updatedManager = await prisma.user.update({
      where: { id: params.managerId },
      data: { status }
    })

    return NextResponse.json(updatedManager)
  } catch (error) {
    console.error("[MANAGER_STATUS_PATCH]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}