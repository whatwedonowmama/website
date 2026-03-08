import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Story — whatwedonowmama',
  description: 'The story behind whatwedonowmama — an OC parent community born from a simple question our son August kept asking.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* The August Moment */}
      <div className="mb-10">
        <p className="section-label mb-3">Our Story</p>
        <h1 className="font-display text-4xl font-bold text-brand-navy leading-tight mb-6">
          "What do we do now, mama?"
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-4">
          That's what our son August started asking. Every. Single. Weekend.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed mb-4">
          Saturday morning, coffee still hot, him standing there at 7am in his pajamas looking at us like we had all the answers. We were two parents in Orange County trying our best — and we kept coming up empty.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed mb-4">
          The Facebook groups were outdated. The local event sites were a mess. The "OC family" blogs were all sponsored posts for things we'd never buy. And we were tired of scrolling for 45 minutes just to find one thing to do with our kids that wasn't a $40 admission fee.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          So we started making our own list. Then we started sharing it. Then a few hundred OC parents started reading it every Friday. And here we are.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed font-medium">
          whatwedonowmama is the thing we wished existed when August asked that question for the first time.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-10" />

      {/* What we do */}
      <div className="mb-10">
        <h2 className="font-display text-2xl font-bold text-brand-navy mb-5">What we do</h2>
        <div className="flex flex-col gap-5">
          {[
            {
              icon: '📅',
              title: 'We find the events',
              desc: 'Every week, we scrape and curate the best free and affordable family events happening in OC — parks, libraries, museums, festivals, you name it. Delivered to your inbox every Friday.',
            },
            {
              icon: '📖',
              title: 'We write the guides',
              desc: 'Honest parenting resources on sleep, feeding, development, and OC-specific stuff — the best pediatricians, parks by city, library programs. Written for real parents, not search engines.',
            },
            {
              icon: '👋',
              title: 'We built the community',
              desc: '3,000+ OC parents in a Discord where real people share what actually works. Age-grouped channels, weekend plans, wins, struggles, and the occasional very funny parenting moment.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
              <div>
                <p className="font-semibold text-brand-navy mb-1">{title}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="mb-10">
        <h2 className="font-display text-2xl font-bold text-brand-navy mb-5">What we believe</h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            'Good parenting isn\'t about doing everything right. It\'s about showing up.',
            'Free should actually mean free. No bait-and-switch.',
            'OC parents deserve local, specific, useful information — not generic national content.',
            'No judgment. Every family is figuring it out differently.',
            'If we wouldn\'t share it with a friend, we don\'t publish it.',
          ].map((v) => (
            <p key={v} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
              <span className="text-brand-coral mt-0.5 shrink-0">→</span>
              {v}
            </p>
          ))}
        </div>
      </div>

      {/* Meet the team */}
      <div className="mb-10">
        <h2 className="font-display text-2xl font-bold text-brand-navy mb-5">The family behind it</h2>
        <div className="card flex gap-4 items-start">
          <div className="w-14 h-14 rounded-full bg-brand-lavender flex items-center justify-center text-2xl shrink-0">
            👨‍👩‍👧
          </div>
          <div>
            <p className="font-semibold text-brand-navy">Bran &amp; family</p>
            <p className="text-sm text-gray-500 mb-2">Orange County, CA · 2 kids including August</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Two parents trying to be the best we can be, one weekend at a time. We built this because August asked a question we couldn't answer well enough. We're still working on it.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-purple rounded-2xl p-8 text-white text-center flex flex-col gap-4">
        <p className="font-display text-2xl font-bold">Come hang out.</p>
        <p className="text-brand-lavender">Free events every week, honest guides, and a community that gets it.</p>
        <Link href="/signup" className="btn-coral mx-auto px-8">Join free →</Link>
      </div>
    </div>
  )
}
