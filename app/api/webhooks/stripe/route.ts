import { NextResponse, type NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

// Disable body parsing — Stripe requires raw body for signature verification
export const runtime = 'nodejs'

async function updateUser(
  supabase: ReturnType<typeof createServiceClient>,
  stripeCustomerId: string,
  fields: Record<string, unknown>
) {
  await supabase.from('users').update(fields).eq('stripe_customer_id', stripeCustomerId)
}

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break
      const customerId     = session.customer as string
      const subscriptionId = session.subscription as string
      const userId         = session.metadata?.userId

      // Link customer to user
      if (userId && userId !== 'pending') {
        await supabase.from('users').update({
          stripe_customer_id:     customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status:    'trialing',
          tier:                   'plus',
        }).eq('id', userId)
      } else if (session.customer_email) {
        await supabase.from('users').update({
          stripe_customer_id:     customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status:    'trialing',
          tier:                   'plus',
        }).eq('email', session.customer_email)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const status   = sub.status
      const endsAt   = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null

      await updateUser(supabase, sub.customer as string, {
        subscription_status:  status,
        subscription_ends_at: endsAt,
        tier: ['active', 'trialing'].includes(status) ? 'plus' : 'free',
        stripe_subscription_id: sub.id,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await updateUser(supabase, sub.customer as string, {
        subscription_status:  'canceled',
        tier:                 'free',
        subscription_ends_at: new Date().toISOString(),
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await updateUser(supabase, invoice.customer as string, {
        subscription_status: 'past_due',
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
