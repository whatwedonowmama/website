import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  // 1. Verify the user is authenticated via their session cookie (anon client)
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Look up their role using the service client (bypasses RLS on users table)
  const service = createServiceClient()
  const { data: profile } = await service
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Fetch pending content using service client (bypasses RLS on pending_content)
  const { data, error } = await service
    .from('pending_content')
    .select('*')
    .eq('status', 'pending')
    .order('scraped_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data ?? [] })
}
