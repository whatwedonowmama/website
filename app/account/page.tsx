import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Account Settings' }

export default async function AccountPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/account')

  const isPlus  = user.tier === 'plus'
  const isTrial = user.subscription_status === 'trialing'

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-8">Account Settings</h1>

      {/* Profile */}
      <section className="card mb-6">
        <h2 className="font-semibold text-brand-navy mb-4">Profile</h2>
        <form action="/api/account/update" method="POST" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-navy">First name</label>
            <input
              name="first_name" type="text" defaultValue={user.first_name ?? ''}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-purple min-h-[44px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-navy">Email</label>
            <input
              type="email" value={user.email} disabled
              className="border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 min-h-[44px]"
            />
            <p className="text-xs text-gray-400">Email changes coming soon — contact hello@whatwedonowmama.com</p>
          </div>
          <button type="submit" className="btn-secondary self-start">Save changes</button>
        </form>
      </section>

      {/* Membership */}
      <section className="card mb-6">
        <h2 className="font-semibold text-brand-navy mb-4">Membership</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-brand-navy">
              {isPlus ? (isTrial ? 'Plus — Free Trial' : 'Plus') : 'Free'}
            </p>
            {isPlus && !isTrial && (
              <p className="text-sm text-gray-500">$7/month · renews automatically</p>
            )}
            {isTrial && (
              <p className="text-sm text-brand-coral">Trial active · Discord unlocks on day 8</p>
            )}
          </div>
          {isPlus
            ? <span className="badge-plus">⭐ Plus</span>
            : <span className="badge-free">Free</span>}
        </div>

        {isPlus ? (
          <div className="flex flex-col gap-3">
            {user.stripe_customer_id && (
              <form action="/api/billing-portal" method="POST">
                <button type="submit" className="btn-secondary w-full justify-center">
                  Manage billing &amp; subscription →
                </button>
              </form>
            )}
            <p className="text-xs text-gray-400">
              Cancelling through the billing portal keeps Plus access until the end of your current billing period.
              Discord access is revoked within 30 days of cancellation.
            </p>
          </div>
        ) : (
          <Link href="/signup?plan=plus" className="btn-primary w-full justify-center text-center block">
            Upgrade to Plus · 7-day free trial
          </Link>
        )}
      </section>

      {/* Email preferences */}
      <section className="card mb-6">
        <h2 className="font-semibold text-brand-navy mb-4">Email preferences</h2>
        <p className="text-sm text-gray-500 mb-3">
          Manage your newsletter subscriptions in{' '}
          <a href="https://beehiiv.com" target="_blank" rel="noopener noreferrer" className="text-brand-purple underline">
            Beehiiv
          </a>{' '}
          using the unsubscribe link in any email.
        </p>
      </section>

      {/* Delete account */}
      <section className="card border border-red-100">
        <h2 className="font-semibold text-red-700 mb-2">Delete account</h2>
        <p className="text-sm text-gray-500 mb-4">
          This will permanently anonymize your account data and cancel any active subscription. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' &&
                window.confirm('Type DELETE to confirm') === true) {
              fetch('/api/account/delete', { method: 'POST' })
                .then(() => window.location.href = '/')
            }
          }}
          className="text-sm font-semibold text-red-600 hover:text-red-700 underline"
        >
          Delete my account
        </button>
      </section>
    </div>
  )
}
