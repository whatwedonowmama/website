import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — whatwedonowmama' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth check — redirect non-admins immediately
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users')
    .select('role, email, first_name')
    .eq('id', authUser.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  // Pending badge count for nav
  const { count: pendingCount } = await service
    .from('pending_content')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const pending = pendingCount ?? 0
  const displayName = profile.first_name || profile.email?.split('@')[0] || 'Admin'

  const navLinks = [
    { href: '/admin',          label: 'Dashboard',   icon: '⚡' },
    { href: '/admin/review',   label: 'Review',      icon: '🔍', badge: pending > 0 ? pending : null },
    { href: '/admin/sources',  label: 'Sources',     icon: '🌐' },
    { href: '/admin/events',   label: 'Events',      icon: '📅' },
    { href: '/admin/resources',label: 'Resources',   icon: '📖' },
    { href: '/admin/members',  label: 'Members',     icon: '👥' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Nav Bar ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <span className="bg-brand-purple text-white text-xs font-bold px-2 py-1 rounded-lg tracking-wide">
              ADMIN
            </span>
            <span className="font-display font-bold text-brand-navy text-sm hidden sm:block">
              whatwedonowmama
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 px-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-brand-navy hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <span className="hidden md:block">{link.icon}</span>
                {link.label}
                {link.badge && (
                  <span className="ml-0.5 bg-brand-coral text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User pill */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:block text-xs text-gray-400">{displayName}</span>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-brand-purple border border-gray-200 px-2.5 py-1 rounded-lg hover:border-brand-purple/40 transition-colors"
            >
              ← Site
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
