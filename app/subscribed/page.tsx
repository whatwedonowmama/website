import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'You\'re in! | whatwedonowmama',
  description: 'Thanks for subscribing to whatwedonowmama.',
}

export default function SubscribedPage() {
  return (
    <div className="bg-brand-cream min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center flex flex-col items-center gap-6">

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-brand-lavender flex items-center justify-center text-4xl shadow-sm">
          💌
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <p className="font-script text-brand-purple text-2xl">you're in!</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy leading-tight">
            Welcome to the community, mama.
          </h1>
        </div>

        {/* Body */}
        <p className="text-gray-600 text-base leading-relaxed max-w-sm">
          Thanks for signing up. Here's what's coming your way:
        </p>

        {/* What to expect */}
        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 text-left">
          <div className="flex gap-4 items-start">
            <span className="text-2xl flex-shrink-0">🗓️</span>
            <div>
              <p className="font-semibold text-brand-navy text-sm">Every Friday — This Week in OC</p>
              <p className="text-gray-500 text-sm mt-0.5">A hand-picked list of the best family events happening across Orange County that weekend.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-2xl flex-shrink-0">📖</span>
            <div>
              <p className="font-semibold text-brand-navy text-sm">Guides that actually help</p>
              <p className="text-gray-500 text-sm mt-0.5">Honest, practical parenting guides for OC families — sleep, feeding, milestones, and more.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-2xl flex-shrink-0">💜</span>
            <div>
              <p className="font-semibold text-brand-navy text-sm">No spam, ever</p>
              <p className="text-gray-500 text-sm mt-0.5">We only send things worth reading. Unsubscribe any time — no hard feelings.</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/events" className="btn-coral flex-1 justify-center py-3">
            This week in OC →
          </Link>
          <Link href="/resources" className="btn-outline-white flex-1 justify-center py-3 !text-brand-navy !border-brand-navy/30 hover:!bg-brand-navy/5">
            Browse free guides ✦
          </Link>
        </div>

      </div>
    </div>
  )
}
