import NextAuth from "next-auth"
import type { Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 5

const failedAttempts = new Map<string, number[]>()

const DUMMY_HASH = bcrypt.hashSync("timing-equalization-dummy-password", 10)

function isLockedOut(email: string): boolean {
  const attempts = failedAttempts.get(email) ?? []
  const now = Date.now()
  const recent = attempts.filter((at) => now - at < LOCKOUT_MINUTES * 60_000)
  if (recent.length >= MAX_FAILED_ATTEMPTS) {
    failedAttempts.set(email, recent)
    return true
  }
  return false
}

function registerFailedAttempt(email: string): void {
  const attempts = failedAttempts.get(email) ?? []
  attempts.push(Date.now())
  failedAttempts.set(email, attempts)
}

function clearFailedAttempts(email: string): void {
  failedAttempts.delete(email)
}

export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>>,
        _request: Request,
      ) {
        void _request
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""

        if (!email || !password) return null

        if (isLockedOut(email)) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        const passwordMatches = user
          ? await bcrypt.compare(password, user.password)
          : await bcrypt.compare(password, DUMMY_HASH)

        if (!user || !user.active || !passwordMatches) {
          registerFailedAttempt(email)
          return null
        }

        clearFailedAttempts(email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.id) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
