import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ success: false, error: 'Missing env vars' }, { status: 500 })
  }
  const url = `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${NEXT_PUBLIC_SUPABASE_ANON_KEY}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
    clearTimeout(timeoutId)
    return NextResponse.json({ success: true, status: res.status })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? 'unknown' }, { status: 500 })
  }
} 