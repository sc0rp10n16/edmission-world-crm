// app/api/counsellors/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const counsellors = await prisma.user.findMany({
      where: {
        role: "COUNSELOR",
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(counsellors)

  } catch (error) {
    console.error("[COUNSELLORS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}