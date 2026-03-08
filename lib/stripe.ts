import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLUS_PRICE_ID = process.env.STRIPE_PLUS_PRICE_ID!

// Create a Stripe Checkout session for the Plus plan
export async function createCheckoutSession({
  userId,
  email,
  returnUrl,
}: {
  userId: string
  email: string
  returnUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: PLUS_PRICE_ID, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId },
    },
    metadata: { userId },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=1`,
    cancel_url: returnUrl,
    allow_promotion_codes: true,
  })
  return session
}

// Create a Stripe Billing Portal session for managing subscription
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session
}
