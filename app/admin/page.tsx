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
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'plus'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'free'),
    supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ])

  const stats = [
    { label: 'Total members',    value: totalUsers ?? 0 },
    { label: 'Plus subscribers', value: plusUsers  ?? 0 },
    { label: 'Free members',     value: freeUsers  ?? 0 },
    { label: 'Published resources', value: resources ?? 0 },
  ]

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

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <Link href="/admin/cancellations" className="card hover:shadow-md transition-shadow flex flex-col gap-1">
          <p className="font-semibold text-brand-navy">🔔 Cancellations Report</p>
          <p className="text-sm text-gray-500">Monthly list of cancelled Plus — for Discord revocation</p>
        </Link>
      </div>

      {/* Note */}
      <div className="mt-8 bg-brand-lavender/50 rounded-xl p-4 text-sm text-brand-navy">
        <strong>Note:</strong> Admin sub-pages (Resource Manager, Events Manager, Members, Cancellations) are Phase 2 builds.
        For now, manage content directly in the{' '}
        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-brand-purple underline">
          Supabase Table Editor
        </a>.
      </div>
    </div>
  )
}
