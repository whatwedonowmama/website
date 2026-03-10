import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

// ── auth helper ──────────────────────────────────────────────────────────────
async function getAdminOrFail() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const service = createServiceClient()
  const { data } = await service.from('users').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? service : null
}

// ── strip HTML to plain text ─────────────────────────────────────────────────
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 8000) // cap for token budget
}

// ── POST /api/admin/scrape-url ───────────────────────────────────────────────
// Body: { url: string }
// Returns: { ok: true, item: PendingContent } or { error: string }
export async function POST(req: NextRequest) {
  const service = await getAdminOrFail()
  if (!service) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  // ── 1. Fetch the page ──────────────────────────────────────────────────────
  let pageText: string
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; whatwedonowmama-bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not fetch that URL (HTTP ${res.status}). The site may block scrapers.` },
        { status: 422 }
      )
    }
    const html = await res.text()
    pageText = htmlToText(html)
    if (pageText.length < 100) {
      return NextResponse.json(
        { error: 'Page returned too little content to extract an event from.' },
        { status: 422 }
      )
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: `Failed to fetch URL: ${msg}` },
      { status: 422 }
    )
  }

  // ── 2. Extract event with Claude ───────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey })

  const prompt = `You are an event data extractor for a family events website covering Orange County, CA.

From the page text below, extract the event details and return ONLY a valid JSON object.
If multiple events are on the page, pick the most prominent/first one.

Required fields:
- title: string (event name)
- description: string (1–3 sentence summary, family-friendly)
- event_date: string (YYYY-MM-DD format — if you can infer the year from context, do so; default year is 2026)
- event_time: string or null (e.g. "10:00 AM – 2:00 PM")
- location_name: string or null (venue name)
- city: string or null (city name, ideally in Orange County, CA)
- price: string or null (e.g. "$10/person", "Free")
- is_free: boolean

Return ONLY the JSON object, no markdown, no explanation.

PAGE TEXT:
${pageText}`

  let extracted: Record<string, unknown>
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim()
    extracted = JSON.parse(jsonStr)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: `AI extraction failed: ${msg}` },
      { status: 500 }
    )
  }

  // ── 3. Insert into pending_content ────────────────────────────────────────
  const { data: inserted, error: dbError } = await service
    .from('pending_content')
    .insert({
      content_type:  'event',
      status:        'pending',
      title:         String(extracted.title ?? 'Untitled Event'),
      description:   String(extracted.description ?? ''),
      event_date:    extracted.event_date ? String(extracted.event_date) : null,
      event_time:    extracted.event_time ? String(extracted.event_time) : null,
      location_name: extracted.location_name ? String(extracted.location_name) : null,
      city:          extracted.city ? String(extracted.city) : null,
      price:         extracted.price ? String(extracted.price) : 'Free',
      is_free:       Boolean(extracted.is_free ?? true),
      source_url:    url,
      source_name:   'Manual URL Import',
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json(
      { error: `Database insert failed: ${dbError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, item: inserted })
}
