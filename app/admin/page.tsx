import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin' }

export default async function AdminPage() {
  const user = await getUser()
  if (!user || user.role !== 'admin') redirect('/')

  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: plusUsers },
    { count: freeUsers },
    { count: resources },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'plus'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'free'),
    supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('pending_content').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Total members',       value: totalUsers    ?? 0 },
    { label: 'Plus subscribers',    value: plusUsers     ?? 0 },
    { label: 'Free members',        value: freeUsers     ?? 0 },
    { label: 'Published resources', value: resources     ?? 0 },
  ]

  const pending = pendingCount ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">Admin</p>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Dashboard</h1>
        </div>
        <span className="text-sm text-gray-400">Logged in as {user.email}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="card text-center">
            <p className="font-display text-3xl font-bold text-brand-purple">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content Review — highlighted if there are pending items */}
      {pending > 0 && (
        <Link
          href="/admin/review"
          className="block mb-4 bg-brand-coral/10 border-2 border-brand-coral/40 rounded-3xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-brand-navy text-base">🔍 Content Review</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Approve, edit, or skip scraped events and resources
              </p>
            </div>
            <span className="bg-brand-coral text-white text-sm font-bold px-3 py-1 rounded-full">
              {pending} pending
            </span>
          </div>
        </Link>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/review" className="card hover:shadow-md transition-shadow flex flex-col gap-1">
          <p className="font-semibold text-brand-navy">🔍 Content Review</p>
          <p className="text-sm text-gray-500">Review scraped events and resources from the web</p>
        </Link>
        <Link href="/admin/resources" className="card hover:shadow-md transition-shadow flex flex-col gap-1">
          <p className="font-semibold text-brand-navy">📝 Resource Manager</p>
          <p className="text-sm text-gray-500">Create, edit, and publish articles</p>
        </Link>
        <Link href="/admin/events" className="card hover:shadow-md transition-shadow flex flex-col gap-1">
          <p className="font-semibold text-brand-navy">📅 Events Manager</p>
          <p className="text-sm text-gray-500">Manually add or pin events</p>
        </Link>
        <Link href="/admin/members" className="card hover:shadow-md transition-shadow flex flex-col gap-1">
          <p className="font-semibold text-brand-navy">👥 Members</p>
          <p className="text-sm text-gray-500">Search, view tier, manage access</p>
        </Link>
        <Link href="/admin/sources" className="card hover:shadow-md transition-shadow flex flex-col gap-1">
          <p className="font-semibold text-brand-navy">🌐 Scrape Sources</p>
          <p className="text-sm text-gray-500">Add and manage websites the scraper visits</p>
        </Link>
      </div>

      {/* Note */}
      <div className="mt-8 bg-brand-lavender/50 rounded-xl p-4 text-sm text-brand-navy">
        <strong>Content pipeline:</strong> The scraper writes to <code>pending_content</code> in Supabase.
        Use Content Review above to approve items to the live site.
        Run the migration in <code>supabase/migrations/20240001_pending_content.sql</code> if you haven&apos;t yet.
      </div>
    </div>
  )
}
