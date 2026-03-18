import { NextResponse, type NextRequest } from 'next/server'
import { createCheckoutSession, createOCInsiderCheckoutSession } from '@/lib/stripe'
import { getUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const user = await getUser()

  // Get params from body or authenticated user
  const body      = await request.json().catch(() => ({}))
  const email     = user?.email ?? body.email
  const userId    = user?.id    ?? body.userId ?? 'pending'
  const plan      = body.plan   ?? 'plus'   // 'plus' | 'oc-insider'
  const returnUrl = body.returnUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/signup?plan=${plan}`

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const session = plan === 'oc-insider'
    ? await createOCInsiderCheckoutSession({ userId, email, returnUrl })
    : await createCheckoutSession({ userId, email, returnUrl })

  return NextResponse.json({ url: session.url })
}
