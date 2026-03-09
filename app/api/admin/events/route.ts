import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function getAdminOrFail() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const service = createServiceClient()
  const { data } = await service.from('users').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? service : null
}

// GET /api/admin/events — list all events
export async function GET() {
  const service = await getAdminOrFail()
  if (!service) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await service
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data ?? [] })
}

// PATCH /api/admin/events — toggle is_pinned or update fields
// Body: { id, is_pinned?: boolean }
export async function PATCH(req: NextRequest) {
  const service = await getAdminOrFail()
  if (!service) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, is_pinned } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await service
    .from('events')
    .update({ is_pinned })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/events')
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/events — remove an event
export async function DELETE(req: NextRequest) {
  const service = await getAdminOrFail()
  if (!service) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await service.from('events').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/events')
  return NextResponse.json({ ok: true })
}
