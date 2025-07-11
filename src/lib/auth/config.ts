import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { SupabaseAdapter } from '@auth/supabase-adapter'

// Prüfe ob alle erforderlichen Environment-Variablen vorhanden sind
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}

// Erstelle nur Supabase-Adapter wenn alle Variablen vorhanden sind
const createAdapter = () => {
  if (requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL && requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY) {
    return SupabaseAdapter({
      url: requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
      secret: requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,
    })
  }
  return undefined
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: requiredEnvVars.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: requiredEnvVars.GOOGLE_CLIENT_SECRET || 'dummy',
    }),
         ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET ? [
      AppleProvider({
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  adapter: createAdapter(),
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session
      if (token?.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Store user ID in token
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: requiredEnvVars.NEXTAUTH_SECRET || 'dev-secret-key',
  debug: process.env.NODE_ENV === 'development',
} 