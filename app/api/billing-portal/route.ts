import { NextResponse, type NextRequest } from 'next/server'
import { createBillingPortalSession } from '@/lib/stripe'
import { getUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.stripe_customer_id) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/account`)
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account`
  const session = await createBillingPortalSession({
    customerId: user.stripe_customer_id,
    returnUrl,
  })

  return NextResponse.redirect(session.url)
}
