import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Community | OC Insider Dashboard' }

// Update this with your real Discord invite URL, or set via env var
const DISCORD_INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? 'https://discord.gg/placeholder'

const CHANNELS = [
  { name: '👋  introductions', desc: 'Come say hi and tell us about your little ones.' },
  { name: '📅  events-this-week', desc: 'Early drop of the weekly events list, every Thursday.' },
  { name: '😴  sleep-talk', desc: 'Sleep schedules, regressions, and wins.' },
  { name: '🍼  feeding-and-food', desc: 'Picky eaters, starting solids, recipes that actually work.' },
  { name: '🏖️  oc-spots', desc: 'Hidden gems, park reviews, and family recs across OC.' },
  { name: '🏷️  founding-parents', desc: 'Exclusive channel for Founding Members only.' },
]

export default async function CommunityPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/dashboard/community')

  const isPaid    = user.tier === 'plus' || user.tier === 'oc-insider'
  const isTrial   = user.subscription_status === 'trialing'
  const isInsider = user.tier === 'oc-insider'

  // Locked state for free users
  if (!isPaid) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 flex flex-col items-center gap-5">
        <span className="text-5xl">💬</span>
        <h1 className="font-display text-2xl font-bold text-brand-navy">Community is an OC Insider perk</h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
          Join our private Discord with 3,000+ OC parents. Real talk, no judgment — just a group of parents figuring it out together.
        </p>
        <Link href="/join" className="bg-brand-gold text-brand-navy font-bold px-6 py-3 rounded-2xl hover:bg-brand-gold/90 transition-colors">
          Become a Founding Member ✦
        </Link>
      </div>
    )
  }

  // Trial state — Discord unlocks on first payment
  if (isTrial && user.tier === 'plus') {
    return (
      <div className="max-w-xl mx-auto py-12 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Community</h1>
          <p className="text-gray-500 text-sm mt-1">Your private Discord with 3,000+ OC parents.</p>
        </div>
        <div className="bg-brand-lavender/40 border border-brand-purple/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
          <span className="text-3xl">⏳</span>
          <p className="font-semibold text-brand-navy">Discord unlocks when your trial ends</p>
          <p className="text-sm text-gray-600 max-w-sm">
            Your 7-day free trial is active. Discord access unlocks automatically on day 8 when your first payment processes.
          </p>
        </div>

        {/* Preview of what's inside */}
        <div>
          <h2 className="font-semibold text-brand-navy text-sm mb-3">Here&apos;s what&apos;s waiting for you:</h2>
          <div className="flex flex-col gap-2">
            {CHANNELS.map(ch => (
              <div key={ch.name} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex gap-3 items-center">
                <span className="text-gray-300 font-mono text-sm select-none">#</span>
                <div>
                  <p className="text-sm font-medium text-gray-400">{ch.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ch.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Active paid member — show the Discord join CTA
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {isInsider && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-gold font-semibold text-xs uppercase tracking-wider">OC Insider</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-xs">Community Access</span>
          </div>
        )}
        <h1 className="font-display text-2xl font-bold text-brand-navy">Community</h1>
        <p className="text-gray-500 text-sm mt-1">Your private Discord with 3,000+ OC parents.</p>
      </div>

      {/* Main Discord CTA card */}
      <div className="bg-brand-navy rounded-3xl p-8 flex flex-col items-center text-center gap-5 mb-8">
        {/* Discord logo */}
        <div className="w-16 h-16 rounded-2xl bg-[#5865F2] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.025.015.05.031.066a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>

        <div>
          <p className="font-display text-xl font-bold text-white">Join the OC Parent Community</p>
          <p className="text-gray-400 text-sm mt-1.5 max-w-sm">
            Real talk with 3,000+ OC parents. Ask anything, share what works, and connect with people who get it.
          </p>
        </div>

        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#5865F2] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#4752c4] transition-colors text-base w-full sm:w-auto justify-center"
        >
          Open Discord →
        </a>
        <p className="text-gray-600 text-xs">
          Opens in a new tab · Bookmark it for easy access
        </p>
      </div>

      {/* Channel preview */}
      <h2 className="font-display text-lg font-bold text-brand-navy mb-4">What&apos;s inside</h2>
      <div className="flex flex-col gap-2 mb-8">
        {CHANNELS.map(ch => (
          <div key={ch.name} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex gap-3 items-start">
            <span className="text-brand-purple font-mono text-sm select-none mt-0.5">#</span>
            <div>
              <p className="text-sm font-semibold text-brand-navy">{ch.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{ch.desc}</p>
            </div>
            {ch.name.includes('founding') && isInsider && (
              <span className="ml-auto shrink-0 text-xs bg-brand-gold/20 text-brand-navy font-semibold px-2 py-0.5 rounded-full border border-brand-gold/40">
                ✦ You&apos;re in
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Community rules reminder */}
      <div className="bg-brand-lavender/30 rounded-2xl p-5 text-sm text-gray-600">
        <p className="font-semibold text-brand-navy mb-1">A note on our vibe 🌟</p>
        <p className="leading-relaxed">
          This is a judgment-free zone. We support every kind of parent. Be kind, be yourself, and remember — none of us have it all figured out.
        </p>
      </div>
    </div>
  )
}
