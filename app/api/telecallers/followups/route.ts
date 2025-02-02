// app/api/telecaller/follow-ups/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "PENDING"

    if (!session || session.user.role !== "TELECALLER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const followUps = await prisma.followUp.findMany({
      where: {
        call: {
          userId: session.user.id
        },
        status: status as "PENDING" | "COMPLETED" | "CANCELLED"
      },
      include: {
        call: {
          include: {
            lead: {
              select: {
                name: true,
                phone: true,
                email: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    })

    return NextResponse.json(followUps)

  } catch (error) {
    console.error("[FOLLOW_UPS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { id, status, notes } = body

    if (!session || session.user.role !== "TELECALLER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedFollowUp = await prisma.followUp.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined
      }
    })

    return NextResponse.json(updatedFollowUp)

  } catch (error) {
    console.error("[FOLLOW_UP_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}