import { NextResponse, type NextRequest } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { getUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const user = await getUser()

  // Get email either from authenticated user or request body (new signup flow)
  const body = await request.json().catch(() => ({}))
  const email     = user?.email ?? body.email
  const userId    = user?.id    ?? body.userId ?? 'pending'
  const returnUrl = body.returnUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/signup?plan=plus`

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const session = await createCheckoutSession({ userId, email, returnUrl })
  return NextResponse.json({ url: session.url })
}
