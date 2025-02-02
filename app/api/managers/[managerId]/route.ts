import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function DELETE(
  req: Request,
  { params }: { params: { managerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'HEAD') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // Delete manager's related data first
    await prisma.$transaction([
      // Delete performance records
      prisma.performance.deleteMany({
        where: { userId: params.managerId }
      }),
      // Delete tasks
      prisma.task.deleteMany({
        where: { 
          OR: [
            { assignedToId: params.managerId },
            { createdById: params.managerId }
          ]
        }
      }),
      // Delete activities
      prisma.activity.deleteMany({
        where: { userId: params.managerId }
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: params.managerId }
      })
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[MANAGER_DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}