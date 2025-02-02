// app/api/manager/leads/csv/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const csv = await prisma.leadCSV.findFirst({
      where: {
        id: params.id,
        managerId: session.user.id,
      },
    })

    if (!csv) {
      return NextResponse.json({ error: "CSV not found" }, { status: 404 })
    }

    // Return file content with appropriate headers
    return new NextResponse(csv.fileContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${csv.fileName}`,
      },
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}