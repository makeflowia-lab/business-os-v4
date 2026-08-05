import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({ password: z.string().min(1) }).safeParse(credentials)
        if (!parsed.success) return null

        const adminPassword = process.env.RAZIEL_PASSWORD
        if (!adminPassword) {
          console.error('[Auth] RAZIEL_PASSWORD no configurado en .env.local')
          return null
        }

        if (parsed.data.password !== adminPassword) return null

        return { id: '1', name: 'Maestro', email: 'raziel@local' }
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}
