import { createClient } from '@supabase/supabase-js'
import { Handler } from '@netlify/functions'

export const handler: Handler = async () => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      body: 'Missing env',
    }
  }
  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
  try {
    const { data, error } = await client.from('users').select('id').limit(1)
    if (error) {
      return { statusCode: 500, body: 'Error: ' + error.message }
    }
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (e: any) {
    return { statusCode: 500, body: 'Exception: ' + e.message }
  }
} 