import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { v5 as uuidv5 } from 'uuid'

// Autorisierte Familienmitglieder
const AUTHORIZED_EMAILS = [
  'chr.bernecker@gmail.com',
  'amandabernecker@gmail.com'
];

// Fester Namespace für deterministische UUID-Generierung
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Netlify-spezifische URL-Erkennung
  if (process.env.URL) {
    return process.env.URL;
  }
  
  return 'http://localhost:3000';
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Netlify-spezifische Konfiguration
  useSecureCookies: process.env.NODE_ENV === 'production',
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('NextAuth signIn callback triggered');
      if (!profile?.email) {
        console.error('No profile email found');
        throw new Error('No profile email found');
      }
      
      if (AUTHORIZED_EMAILS.includes(profile.email)) {
        console.log('User authorized:', profile.email);
        // Deterministische UUID aus Google-ID generieren (bleibt immer gleich für denselben User)
        const googleId = (profile as any).sub || (profile as any).id || profile.email;
        const deterministicUuid = uuidv5(googleId, UUID_NAMESPACE);
        console.log('Generated UUID for user:', { googleId, uuid: deterministicUuid });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.id = deterministicUuid;
        return true;
      } else {
        console.log('User not authorized:', profile.email);
        return '/auth/unauthorized';
      }
    },
    async jwt({ token, user, account }) {
      console.log('NextAuth JWT callback triggered');
      if (user && user.id) {
        token.sub = user.id;
      }
      // Fallback: falls keine ID vorhanden ist, verwende die E-Mail als eindeutigen Identifier
      if (!token.sub && token.email) {
        token.sub = token.email;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // Für Netlify: Verwende NEXTAUTH_URL falls gesetzt, sonst baseUrl
      const redirectUrl = process.env.NEXTAUTH_URL || baseUrl;
      console.log('NextAuth redirect to:', redirectUrl);
      
      return redirectUrl;
    },
    async session({ session, token }) {
      console.log('NextAuth session callback triggered');
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}; 