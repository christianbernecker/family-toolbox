import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { NextRequest } from 'next/server';

export interface SessionResult {
  session: any | null;
  error: string | null;
  source: 'nextauth' | 'fallback' | 'none';
  userId: string | null;
}

export class RobustSessionHandler {
  private static instance: RobustSessionHandler;
  private sessionCache = new Map<string, { session: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  public static getInstance(): RobustSessionHandler {
    if (!RobustSessionHandler.instance) {
      RobustSessionHandler.instance = new RobustSessionHandler();
    }
    return RobustSessionHandler.instance;
  }

  /**
   * Robuste Session-Ermittlung mit mehreren Fallback-Strategien
   */
  async getSession(request?: NextRequest): Promise<SessionResult> {
    console.log('🔐 RobustSessionHandler: Starting session resolution');
    
    try {
      // Strategie 1: NextAuth getServerSession
      const session = await this.tryNextAuthSession();
      if (session) {
        console.log('🔐 Session resolved via NextAuth');
        return {
          session,
          error: null,
          source: 'nextauth',
          userId: session.user?.id || null
        };
      }

      // Strategie 2: Cookie-basierte Fallback-Validierung
      if (request) {
        const cookieSession = await this.tryCookieSession(request);
        if (cookieSession) {
          console.log('🔐 Session resolved via cookie fallback');
          return {
            session: cookieSession,
            error: null,
            source: 'fallback',
            userId: cookieSession.user?.id || null
          };
        }
      }

      // Strategie 3: Cached Session (falls verfügbar)
      const cachedSession = this.getCachedSession();
      if (cachedSession) {
        console.log('🔐 Session resolved via cache');
        return {
          session: cachedSession,
          error: null,
          source: 'nextauth',
          userId: cachedSession.user?.id || null
        };
      }

      console.log('🔐 No valid session found');
      return {
        session: null,
        error: null,
        source: 'none',
        userId: null
      };

    } catch (error) {
      console.error('🔐 Session resolution error:', error);
      return {
        session: null,
        error: error instanceof Error ? error.message : 'Unknown session error',
        source: 'none',
        userId: null
      };
    }
  }

  /**
   * Strategie 1: Standard NextAuth Session
   */
  private async tryNextAuthSession(): Promise<any | null> {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        this.cacheSession(session);
        return session;
      }
      return null;
    } catch (error) {
      console.error('🔐 NextAuth session error:', error);
      return null;
    }
  }

  /**
   * Strategie 2: Cookie-basierte Fallback-Validierung
   */
  private async tryCookieSession(request: NextRequest): Promise<any | null> {
    try {
      // Prüfe verschiedene Cookie-Namen (NextAuth v4 Kompatibilität)
      const cookieNames = [
        'next-auth.session-token',
        'authjs.session-token',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.session-token'
      ];

      for (const cookieName of cookieNames) {
        const cookie = request.cookies.get(cookieName);
        if (cookie?.value) {
          console.log(`🔐 Found cookie: ${cookieName}`);
          
          // Basis-Validierung des JWT-Tokens
          const tokenData = this.parseJwtToken(cookie.value);
          if (tokenData && tokenData.sub) {
            return {
              user: {
                id: tokenData.sub,
                email: tokenData.email || null,
                name: tokenData.name || null
              },
              expires: new Date(tokenData.exp * 1000).toISOString()
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('🔐 Cookie session error:', error);
      return null;
    }
  }

  /**
   * JWT Token parsen (nur für Fallback-Validierung)
   */
  private parseJwtToken(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8')
      );

      // Basis-Validierung
      if (!payload.sub || !payload.exp) return null;
      if (Date.now() >= payload.exp * 1000) return null;

      return payload;
    } catch (error) {
      console.error('🔐 JWT parsing error:', error);
      return null;
    }
  }

  /**
   * Session-Caching
   */
  private cacheSession(session: any): void {
    if (session?.user?.id) {
      this.sessionCache.set(session.user.id, {
        session,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Cached Session abrufen
   */
  private getCachedSession(): any | null {
    const now = Date.now();
    for (const [userId, cached] of this.sessionCache.entries()) {
      if (now - cached.timestamp < this.CACHE_DURATION) {
        return cached.session;
      } else {
        this.sessionCache.delete(userId);
      }
    }
    return null;
  }

  /**
   * Session-Validierung für API-Routen
   */
  async validateApiSession(request?: NextRequest): Promise<SessionResult> {
    const result = await this.getSession(request);
    
    if (!result.session) {
      console.log('🔐 API session validation failed');
      return {
        session: null,
        error: 'Unauthorized',
        source: 'none',
        userId: null
      };
    }

    console.log('🔐 API session validation successful');
    return result;
  }

  /**
   * Cache leeren
   */
  clearCache(): void {
    this.sessionCache.clear();
  }
} 