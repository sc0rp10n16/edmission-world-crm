import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { RegisterUserInput } from "@/types/auth";

export async function registerUser({
  name,
  email,
  password,
  role
}: RegisterUserInput) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}