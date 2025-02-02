// app/api/manager/leads/upload-history/route.ts
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

    const uploads = await prisma.leadUpload.findMany({
      where: {
        managerId: session.user.id,
      },
      include: {
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })

    return NextResponse.json(uploads)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}