// app/api/manager/leads/upload/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'MANAGER') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
    }

    // Process the CSV/Excel file
    const fileContent = await file.text()
    const rows = fileContent.split('\n').slice(1) // Skip header row

    // Create leads from the file data
    const leads = await Promise.all(
      rows.map(async (row) => {
        const [name, email, phone, ...rest] = row.split(',')
        
        return prisma.lead.create({
          data: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status: 'NEW',
            managedById: session.user.id,
            source: 'IMPORT',
          },
        })
      })
    )

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'LEADS_IMPORTED',
        description: `Imported ${leads.length} leads`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ 
      success: true, 
      count: leads.length 
    })
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}