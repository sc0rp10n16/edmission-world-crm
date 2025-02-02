import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = registerSchema.parse(json)

    // Check if employee ID exists
    const existingEmployeeId = await prisma.user.findFirst({
      where: { employeeId: body.employeeId }
    })

    if (existingEmployeeId) {
      return NextResponse.json(
        { message: "Employee ID already exists" },
        { status: 409 }
      )
    }

    // Check if email exists
    const existingEmail = await prisma.user.findFirst({
      where: { email: body.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const user = await prisma.user.create({
      data: {
        employeeId: body.employeeId,
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
      },
    })

    const { password: _, ...result } = user

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}