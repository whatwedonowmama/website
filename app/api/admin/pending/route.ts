import { NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'

export async function GET() {
  const user = await getUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
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
