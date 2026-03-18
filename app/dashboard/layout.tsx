import type { ReactNode } from 'react'
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // getUser is React-cached — shared with page.tsx, only one DB call per request
  const user = await getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar — hidden on mobile, shown md+ */}
      <div className="hidden md:flex">
        <DashboardSidebar
          firstName={user.first_name}
          tier={user.tier}
          email={user.email}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 bg-gray-50">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100 text-sm">
          <span className="font-semibold text-brand-navy truncate">
            {user.first_name ? `Hey, ${user.first_name}` : 'Dashboard'}
          </span>
          {user.tier === 'oc-insider' && (
            <span className="ml-auto shrink-0 text-xs bg-brand-gold/20 text-brand-navy font-semibold px-2 py-0.5 rounded-full border border-brand-gold/40">
              ✦ OC Insider
            </span>
          )}
          {user.tier === 'plus' && (
            <span className="ml-auto shrink-0 text-xs bg-brand-lavender text-brand-purple font-semibold px-2 py-0.5 rounded-full">
              ⭐ Plus
            </span>
          )}
        </div>

        {/* Mobile nav tabs */}
        <nav className="md:hidden flex border-b border-gray-100 bg-white overflow-x-auto">
          {[
            { href: '/dashboard',              label: 'Home',      icon: '🏠' },
            { href: '/dashboard/early-events', label: 'Events',    icon: '📅' },
            { href: '/dashboard/community',    label: 'Community', icon: '💬' },
            { href: '/dashboard/resources',    label: 'Library',   icon: '📚' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-4 py-3 text-xs text-gray-500 hover:text-brand-purple whitespace-nowrap shrink-0"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
