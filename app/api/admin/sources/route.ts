import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function getAdminOrFail() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users')
    .select('role, id')
    .eq('id', authUser.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return { service, userId: authUser.id }
}

// GET /api/admin/sources — list all scrape sources
export async function GET() {
  const auth = await getAdminOrFail()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await auth.service
    .from('scrape_sources')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sources: data ?? [] })
}

// POST /api/admin/sources — add a new source
export async function POST(req: NextRequest) {
  const auth = await getAdminOrFail()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { url, name, frequency, tags, notes } = body

  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  // Auto-derive name from URL hostname if not provided
  let sourceName = name?.trim()
  if (!sourceName) {
    try {
      sourceName = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      sourceName = url
    }
  }

  const { data, error } = await auth.service
    .from('scrape_sources')
    .insert({
      url:       url.trim(),
      name:      sourceName,
      frequency: frequency ?? 'weekly',
      enabled:   true,
      tags:      tags ?? [],
      notes:     notes ?? null,
      added_by:  auth.userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ source: data })
}

// PATCH /api/admin/sources — toggle enabled or update a source
export async function PATCH(req: NextRequest) {
  const auth = await getAdminOrFail()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const allowed = ['enabled', 'name', 'url', 'frequency', 'tags', 'notes']
  const safe = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  )

  const { error } = await auth.service
    .from('scrape_sources')
    .update(safe)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/sources — remove a source
export async function DELETE(req: NextRequest) {
  const auth = await getAdminOrFail()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await auth.service
    .from('scrape_sources')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
