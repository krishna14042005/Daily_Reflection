import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// Hardcoded JWT secret for localhost development
const JWT_SECRET = "daily-reflection-localhost-secret-key-2024"

export interface User {
  _id: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): { userId: string } | null {
  const token = request.cookies.get("token")?.value
  if (!token) return null

  return verifyToken(token)
}
