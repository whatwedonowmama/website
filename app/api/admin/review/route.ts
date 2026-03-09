import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// POST /api/admin/review
// Body: { id, action: 'approve' | 'reject' | 'edit', updates?: Partial<PendingContent> }
export async function POST(req: NextRequest) {
  // Verify authentication via session cookie
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service client to bypass RLS for role check and mutations
  const service = createServiceClient()
  const { data: profile } = await service
    .from('users')
    .select('role, id')
    .eq('id', authUser.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, action, updates } = body

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
  }

  // Use service client for all DB operations (bypasses RLS)
  const supabaseService = service

  // ── Fetch the pending item ──
  const { data: item, error: fetchError } = await supabaseService
    .from('pending_content')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  // ── REJECT / SKIP ──
  if (action === 'reject') {
    await supabaseService
      .from('pending_content')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: profile.id })
      .eq('id', id)

    return NextResponse.json({ ok: true, action: 'rejected' })
  }

  // ── APPROVE ──
  if (action === 'approve') {
    // Merge any inline edits the user made before approving
    const merged = { ...item, ...(updates ?? {}) }

    if (item.content_type === 'event') {
      // Slugify title for the events table
      const slug = merged.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { error: upsertError } = await supabaseService.from('events').upsert({
        title:         merged.title,
        description:   merged.description,
        event_date:    merged.event_date,
        event_time:    merged.event_time,
        location_name: merged.location_name,
        city:          merged.city,
        price:         merged.price ?? 'Free',
        is_free:       merged.is_free ?? true,
        source_url:    merged.source_url,
        is_pinned:     false,
        slug,
      }, { onConflict: 'slug' })

      if (upsertError) {
        console.error('[review/approve] events upsert failed:', upsertError)
        return NextResponse.json(
          { error: `Failed to publish event: ${upsertError.message}` },
          { status: 500 }
        )
      }
    }

    if (item.content_type === 'resource') {
      const slug = merged.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      await supabaseService.from('resources').upsert({
        slug,
        title:          merged.title,
        excerpt:        merged.description,
        category:       merged.category ?? 'oc-guides',
        access_level:   'free',
        status:         'published',
        featured:       false,
        read_time_minutes: 3,
        published_at:   new Date().toISOString(),
      })
    }

    // Mark as approved
    await supabaseService
      .from('pending_content')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: profile.id })
      .eq('id', id)

    return NextResponse.json({ ok: true, action: 'approved' })
  }

  // ── EDIT (save field changes without approving yet) ──
  if (action === 'edit') {
    const allowedFields = [
      'title', 'description', 'event_date', 'event_time',
      'location_name', 'city', 'price', 'is_free', 'category', 'tags', 'source_url',
    ]
    const safeUpdates = Object.fromEntries(
      Object.entries(updates ?? {}).filter(([k]) => allowedFields.includes(k))
    )

    await supabaseService
      .from('pending_content')
      .update(safeUpdates)
      .eq('id', id)

    return NextResponse.json({ ok: true, action: 'edited' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
