'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
  icon: string
  paidOnly?: boolean
}

const NAV: NavItem[] = [
  { href: '/dashboard',                label: 'Home',           icon: '🏠' },
  { href: '/dashboard/early-events',   label: 'Early Events',   icon: '📅', paidOnly: true },
  { href: '/dashboard/community',      label: 'Community',      icon: '💬', paidOnly: true },
  { href: '/dashboard/resources',      label: 'Resource Library', icon: '📚', paidOnly: true },
]

type Props = {
  firstName: string | null
  tier: string
  email: string
}

export default function DashboardSidebar({ firstName, tier, email }: Props) {
  const pathname  = usePathname()
  const isPaid    = tier === 'plus' || tier === 'oc-insider'
  const isInsider = tier === 'oc-insider'

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-full">
      {/* User identity */}
      <div className="px-5 py-6 border-b border-gray-100">
        <p className="font-display font-bold text-brand-navy text-base truncate">
          {firstName ? `Hey, ${firstName} 👋` : 'Hey there 👋'}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
        <div className="mt-2">
          {isInsider && (
            <span className="inline-flex items-center gap-1 bg-brand-gold/20 text-brand-navy text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-gold/40">
              ✦ OC Insider
            </span>
          )}
          {tier === 'plus' && (
            <span className="inline-flex items-center gap-1 bg-brand-lavender text-brand-purple text-xs font-semibold px-2.5 py-1 rounded-full">
              ⭐ Plus
            </span>
          )}
          {tier === 'free' && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(item => {
          const isActive  = pathname === item.href
          const isLocked  = item.paidOnly && !isPaid

          return (
            <Link
              key={item.href}
              href={isLocked ? '/join' : item.href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-purple text-white'
                  : isLocked
                    ? 'text-gray-300 cursor-pointer hover:bg-gray-50'
                    : 'text-gray-700 hover:bg-brand-lavender/40 hover:text-brand-purple',
              ].join(' ')}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isLocked && (
                <span className="text-xs text-brand-gold font-semibold">✦</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade nudge for free users */}
      {!isPaid && (
        <div className="mx-3 mb-4 p-4 bg-brand-navy rounded-2xl flex flex-col gap-2">
          <p className="text-brand-gold text-xs font-semibold">✦ OC Insider</p>
          <p className="text-white text-xs leading-relaxed">
            Unlock early events, the full library &amp; Discord community.
          </p>
          <Link
            href="/join"
            className="bg-brand-gold text-brand-navy text-xs font-bold px-3 py-2 rounded-xl text-center hover:bg-brand-gold/90 transition-colors"
          >
            Become a Founding Member
          </Link>
        </div>
      )}

      {/* Account links */}
      <div className="px-3 pb-5 border-t border-gray-100 pt-4 flex flex-col gap-1">
        <Link href="/account" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <span>⚙️</span> Account Settings
        </Link>
        <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <span>↩️</span> Sign Out
        </Link>
      </div>
    </aside>
  )
}
