import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpgradeCTA from '@/components/UpgradeCTA'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Community' }

// Replace with your actual permanent Discord invite link
const DISCORD_INVITE = process.env.DISCORD_INVITE_URL || 'https://discord.gg/YOUR_INVITE'

export default async function CommunityPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/members/community')

  const isPlus  = user.tier === 'plus'
  const isTrial = user.subscription_status === 'trialing'
  const hasAccess = isPlus && !isTrial

  const CHANNELS = [
    { name: '#welcome-start-here', desc: 'Intro yourself and get the lay of the land' },
    { name: '#newborns-0-12m',     desc: 'All things newborn — feeding, sleep, sanity' },
    { name: '#toddlers-1-3',       desc: 'Toddler chaos. You are not alone.' },
    { name: '#big-kids-4-10',      desc: 'School, activities, and big feelings' },
    { name: '#weekend-events',     desc: 'OC parents sharing what to do this weekend' },
    { name: '#product-recs',       desc: 'What we actually use and love' },
    { name: '#founding-parents',   desc: 'Exclusive channel for Plus members from day one' },
  ]

  if (hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="section-label mb-2">Community</p>
        <h1 className="font-display text-3xl font-bold text-brand-navy mb-2">
          3,000+ OC parents. Real talk. No judgment.
        </h1>
        <p className="text-gray-500 mb-8">You're a Plus member — the Discord is all yours.</p>

        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full justify-center text-center block mb-8 text-base py-4"
        >
          Open Discord →
        </a>

        <div className="card mb-6">
          <h2 className="font-semibold text-brand-navy mb-4">What's inside</h2>
          <div className="flex flex-col gap-3">
            {CHANNELS.map(c => (
              <div key={c.name} className="flex items-start gap-3">
                <span className="text-brand-purple font-mono text-sm font-bold shrink-0 mt-0.5">{c.name}</span>
                <span className="text-sm text-gray-500">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-lavender rounded-xl p-5 text-sm text-brand-navy">
          <p className="font-semibold mb-1">You're a founding member 🎉</p>
          <p className="text-gray-600">You joined while we're still building this thing. That means you get the #founding-parents channel — a direct line to us and the other people who believed in this early.</p>
        </div>
      </div>
    )
  }

  // Free user OR trial user — show upgrade gate
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <p className="section-label mb-2">Community</p>
      <h1 className="font-display text-3xl font-bold text-brand-navy mb-2">
        {isTrial ? 'Discord unlocks when you become a paying member' : 'This is where the community lives.'}
      </h1>

      {isTrial && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 text-sm text-amber-800">
          Your 7-day trial is active. Discord access unlocks automatically on day 8 when your card is charged.
        </div>
      )}

      {/* Community preview */}
      {!isTrial && (
        <div className="mb-8">
          <p className="text-gray-500 mb-5">A sneak peek at what's inside:</p>
          <div className="flex flex-col gap-3">
            {[
              { author: 'Sarah M.', text: "Anyone else's 2yo just refusing naps completely? We tried everything and finally...", channel: '#toddlers-1-3' },
              { author: 'Mike & Jen', text: 'Best free splash pad in Irvine is 100% the one at Woodbury. Open until September.', channel: '#weekend-events' },
              { author: 'Priya K.', text: 'Just had our 6-month checkup, sharing the milestone checklist my pediatrician gave us...', channel: '#newborns-0-12m' },
            ].map((post, i) => (
              <div key={i} className="card filter blur-[2px] select-none pointer-events-none">
                <p className="text-xs text-brand-purple font-semibold mb-1">{post.channel}</p>
                <p className="text-sm text-gray-700">{post.text}</p>
                <p className="text-xs text-gray-400 mt-2">— {post.author}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <UpgradeCTA variant="card" context="community" />
    </div>
  )
}
