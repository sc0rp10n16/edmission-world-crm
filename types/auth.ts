import { UserRole } from "@prisma/client";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginUserInput {
  email: string;
  password: string;
}