// app/api/manager/leads/upload/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { LeadStatus } from '@prisma/client' // Import the LeadStatus enum
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const telecallerId = formData.get('telecallerId') as string
    
    if (!file || !telecallerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify telecaller belongs to manager
    const telecaller = await prisma.user.findFirst({
      where: {
        id: telecallerId,
        managerId: session.user.id,
      },
    })

    if (!telecaller) {
      return NextResponse.json({ error: "Invalid telecaller" }, { status: 400 })
    }

    // Process CSV file
    const text = await file.text()
    const rows = text.split('\n').slice(1) // Skip header row
    
    // Process leads
    const leads: Array<{
      name: string
      email: string | null
      phone: string
      source: string | null
      status: LeadStatus
      managedById: string
      assignedToId: string
    }> = []
    
    const errors = []

    for (const row of rows) {
      try {
        const [name, email, phone, source] = row.split(',').map(field => field.trim())
        
        if (!name || !phone) {
          errors.push(`Invalid data: ${row}`)
          continue
        }

        leads.push({
          name,
          email: email || null,
          phone,
          source: source || null,
          status: LeadStatus.NEW, // Use the enum value
          managedById: session.user.id,
          assignedToId: telecallerId,
        })
      } catch (error) {
        errors.push(`Failed to process row: ${row}`)
      }
    }

    // Create leads in database
    const createdLeads = await prisma.lead.createMany({
      data: leads,
      skipDuplicates: true, // Skip if phone number already exists
    })

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'LEADS_IMPORTED',
        description: `Imported ${createdLeads.count} leads from ${file.name}`,
        userId: session.user.id,
        metadata: {
          totalRows: rows.length,
          successfulLeads: createdLeads.count,
          errors: errors,
        },
      },
    })

    return NextResponse.json({
      success: true,
      imported: createdLeads.count,
      errors: errors.length ? errors : undefined,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}