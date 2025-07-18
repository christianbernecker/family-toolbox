import { Handler } from '@netlify/functions'

/**
 * Kleine Diagnose-Function, die einen HEAD-Request an die Supabase REST-API sendet.
 * Damit können wir feststellen, ob Netlify-Functions grundsätzlich den Supabase-Endpoint erreichen.
 *
 * Aufruf (Stage/Prod):
 *   https://<site>.netlify.app/.netlify/functions/supabase-ping
 */
export const handler: Handler = async () => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables',
      }),
    }
  }

  const url = `${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_ANON_KEY}`

  // Request mit Timeout per AbortController (8 Sekunden)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8_000)

  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
    clearTimeout(timeoutId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        status: res.status,
        statusText: res.statusText,
      }),
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err?.message ?? 'Unknown error',
        name: err?.name,
      }),
    }
  }
} 