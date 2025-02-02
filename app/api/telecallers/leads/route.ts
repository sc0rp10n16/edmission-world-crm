// app/api/telecaller/leads/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { LeadStatus } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TELECALLER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const leads = await prisma.lead.findMany({
      where: {
        assignedToId: session.user.id,
        status: {
          notIn: ["LOST", "CONVERTED"] as LeadStatus[] // Using valid LeadStatus values
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        status: true,
        lastContactedAt: true,
        nextFollowUpDate: true,
        totalCallAttempts: true,
        preferredCourses: true,
        preferredCountries: true,
        notes: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error("[TELECALLER_LEADS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}