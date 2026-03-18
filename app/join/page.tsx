import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Join OC Insider — Founding Member | whatwedonowmama',
  description: 'Become a Founding Member of OC Insider — early events, the full resource library, and a private Discord community for OC parents. $49/year.',
  openGraph: {
    title: 'Join OC Insider — Founding Member',
    description: 'Early events, full resource library, and private Discord for OC parents. Lock in $49/year as a Founding Member.',
    url: 'https://whatwedonowmama.com/join',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join OC Insider — Founding Member',
    description: 'Lock in the founding member rate — $49/year for early events, full library, and private Discord.',
  },
}

const PERKS = [
  {
    emoji: '📅',
    title: 'Events before anyone else',
    body: 'Get the full weekly events digest every Thursday — a full day before it hits the free newsletter — so you can actually grab spots.',
  },
  {
    emoji: '📚',
    title: 'Full resource library',
    body: 'Unlock every parenting guide we publish — sleep, feeding, milestones, OC-specific guides, and downloadable PDFs.',
  },
  {
    emoji: '💬',
    title: 'Private Discord community',
    body: "Ask questions, share recs, and connect with other OC parents in a space that's actually friendly. No Facebook Groups nonsense.",
  },
  {
    emoji: '🏷️',
    title: '#founding-parents channel',
    body: 'A dedicated channel for our earliest members — direct access to us and real input on what we build next.',
  },
  {
    emoji: '🔒',
    title: 'Founding Member rate — forever',
    body: '$49/year (vs $84/year at regular pricing). Your rate is locked in for as long as you stay subscribed.',
  },
]

export default function JoinPage() {
  return (
    <div className="bg-brand-cream min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-brand-navy px-4 pt-16 pb-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-coral/20 blur-3xl" />
          <div className="absolute bottom-0 -left-10 w-64 h-64 rounded-full bg-brand-gold/15 blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 rounded-full px-4 py-1.5">
            <span className="text-brand-gold text-sm font-semibold">✦ Founding Member — Limited Spots</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
            Become an<br />
            <span className="italic text-brand-coral">OC Insider.</span>
          </h1>

          <p className="text-brand-lavender/80 text-lg leading-relaxed max-w-lg">
            Early events, the full resource library, and a private community of OC parents who actually show up. Join now and lock in the Founding Member rate — forever.
          </p>

          <div className="flex items-baseline gap-3 mt-2">
            <span className="font-display text-4xl font-bold text-white">
              $49<span className="text-lg font-normal text-gray-400">/year</span>
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs text-brand-gold font-semibold uppercase tracking-wide">Founding rate</span>
              <span className="text-xs text-gray-500 line-through">$84/year regular</span>
            </div>
          </div>

          <Link
            href="/signup?plan=oc-insider"
            className="mt-2 inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-bold text-base px-8 py-4 rounded-2xl hover:bg-brand-gold/90 transition-colors shadow-lg"
          >
            Become a Founding Member →
          </Link>
          <p className="text-gray-500 text-xs">Billed annually · Cancel anytime · Secure checkout via Stripe</p>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="section-label mb-2">What&apos;s included</p>
          <h2 className="font-display text-3xl font-bold text-brand-navy leading-tight">
            Everything in free, plus a lot more.
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            OC Insider is built for parents who want the full picture — not just the highlights.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {PERKS.map(perk => (
            <div
              key={perk.title}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex gap-5 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-brand-lavender flex items-center justify-center text-2xl">
                {perk.emoji}
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-brand-navy">{perk.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{perk.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="bg-white px-4 py-14">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-brand-navy text-center mb-8">
            Free vs OC Insider
          </h2>
          <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-brand-navy text-white text-sm font-semibold">
              <div className="p-4 pl-6">Feature</div>
              <div className="p-4 text-center">Free</div>
              <div className="p-4 text-center text-brand-gold">OC Insider ✦</div>
            </div>
            {[
              ['Weekly events digest', '✓', '✓ + 1 day early'],
              ['Free guides & resources', '✓', '✓'],
              ['Full resource library + PDFs', '—', '✓'],
              ['Private Discord community', '—', '✓'],
              ['#founding-parents channel', '—', '✓'],
              ['Direct input on what we build', '—', '✓'],
            ].map(([feature, free, insider]) => (
              <div key={feature} className="grid grid-cols-3 border-t border-gray-100 text-sm">
                <div className="p-4 pl-6 text-gray-700 font-medium">{feature}</div>
                <div className="p-4 text-center text-gray-400">{free}</div>
                <div className="p-4 text-center text-brand-purple font-semibold">{insider}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="px-4 py-16 max-w-xl mx-auto text-center flex flex-col items-center gap-5">
        <p className="font-script text-brand-purple text-2xl">ready to be a founding member?</p>
        <h2 className="font-display text-2xl font-bold text-brand-navy leading-tight">
          Lock in $49/year today.
        </h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Founding members lock in their rate permanently. Once spots fill, new members pay full price.
        </p>
        <Link
          href="/signup?plan=oc-insider"
          className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-bold text-base px-8 py-4 rounded-2xl hover:bg-brand-gold/90 transition-colors shadow-md w-full sm:w-auto"
        >
          Become a Founding Member →
        </Link>
        <p className="text-xs text-gray-400">Billed annually · Cancel anytime · Secure checkout via Stripe</p>
      </section>

    </div>
  )
}
