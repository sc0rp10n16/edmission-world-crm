// app/api/telecaller/leads/[leadId]/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import {prisma} from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { leadId } = params
    const body = await req.json()

    if (!session || session.user.role !== "TELECALLER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { assignedToId: true }
    })

    if (!lead || lead.assignedToId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: body.status,
        notes: body.notes,
      }
    })

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("[TELECALLER_LEAD_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}