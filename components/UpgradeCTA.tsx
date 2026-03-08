import Link from 'next/link'

type Props = {
  variant?: 'banner' | 'card' | 'inline'
  context?: 'community' | 'resource' | 'general'
}

const COPY = {
  community: {
    headline: '3,000+ OC parents are in there.',
    sub:      'The Discord community is a Plus benefit. Real talk, no judgment, age-grouped channels.',
    cta:      'Go Plus to join the community',
  },
  resource: {
    headline: 'This is Plus content.',
    sub:      'Unlock every guide, deep dive, and downloadable resource for $7/month.',
    cta:      'Start 7-day free trial',
  },
  general: {
    headline: 'Everything in one place.',
    sub:      'Full resource library + Discord community + no ads. $7/month, cancel anytime.',
    cta:      'Start 7-day free trial',
  },
}

export default function UpgradeCTA({ variant = 'card', context = 'general' }: Props) {
  const copy = COPY[context]

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-brand-purple font-semibold">
        <Link href="/signup?plan=plus" className="underline underline-offset-2 hover:text-brand-coral">
          {copy.cta} →
        </Link>
      </span>
    )
  }

  if (variant === 'banner') {
    return (
      <div className="bg-brand-lavender border-t-4 border-brand-purple rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <p className="font-display font-bold text-brand-navy text-lg">{copy.headline}</p>
          <p className="text-sm text-gray-600 mt-1">{copy.sub}</p>
        </div>
        <Link href="/signup?plan=plus" className="btn-primary whitespace-nowrap shrink-0">
          {copy.cta}
        </Link>
      </div>
    )
  }

  // card (default)
  return (
    <div className="card border-2 border-brand-purple/30 bg-brand-lavender/40 flex flex-col gap-4 text-center p-7">
      <p className="text-3xl">⭐</p>
      <p className="font-display font-bold text-brand-navy text-xl">{copy.headline}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{copy.sub}</p>
      <Link href="/signup?plan=plus" className="btn-primary">
        {copy.cta}
      </Link>
      <p className="text-xs text-gray-400">7-day free trial · cancel anytime · $7/mo after</p>
    </div>
  )
}
