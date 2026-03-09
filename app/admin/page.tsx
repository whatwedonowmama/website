import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

// Next scraper run: every Monday at 6am PT (14:00 UTC)
function nextScraperRun(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0 Sun … 6 Sat
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7
  const next = new Date(now)
  next.setUTCDate(now.getUTCDate() + daysUntilMonday)
  next.setUTCHours(14, 0, 0, 0)
  const diff = next.getTime() - now.getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days === 0) return `today in ${hours}h`
  if (days === 1) return `tomorrow (~${hours}h)`
  return `in ${days}d ${hours}h`
}

export default async function AdminDashboard() {
  const service = createServiceClient()

  const [
    { count: totalUsers },
    { count: plusUsers },
    { count: freeUsers },
    { count: totalEvents },
    { count: resources },
    { count: pendingCount },
    { count: approvedThisWeek },
    { count: sourcesCount },
  ] = await Promise.all([
    service.from('users').select('*', { count: 'exact', head: true }),
    service.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'plus'),
    service.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'free'),
    service.from('events').select('*', { count: 'exact', head: true }),
    service.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    service.from('pending_content').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    service.from('pending_content').select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('reviewed_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    service.from('scrape_sources').select('*', { count: 'exact', head: true }).eq('enabled', true),
  ])

  const pending  = pendingCount   ?? 0
  const approved = approvedThisWeek ?? 0
  const sources  = (sourcesCount ?? 0) + 3 // +3 for the 3 hardcoded yaml sources

  return (
    <div className="flex flex-col gap-8">

      {/* Page title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-navy">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Here&apos;s what&apos;s happening with the site.
        </p>
      </div>

      {/* Pending alert */}
      {pending > 0 && (
        <Link
          href="/admin/review"
          className="flex items-center justify-between bg-brand-coral/10 border-2 border-brand-coral/40 rounded-2xl px-5 py-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-semibold text-brand-navy text-sm">
                {pending} event{pending !== 1 ? 's' : ''} waiting for review
              </p>
              <p className="text-xs text-gray-500">Approve, edit, or skip scraped content</p>
            </div>
          </div>
          <span className="bg-brand-coral text-white text-sm font-bold px-3 py-1 rounded-full shrink-0">
            Review now →
          </span>
        </Link>
      )}

      {/* Key metrics */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { label: 'Total members',    value: totalUsers  ?? 0, href: '/admin/members',   color: 'text-brand-purple' },
            { label: 'Plus subscribers', value: plusUsers   ?? 0, href: '/admin/members',   color: 'text-brand-coral'  },
            { label: 'Live events',      value: totalEvents ?? 0, href: '/admin/events',    color: 'text-green-600'    },
            { label: 'Published guides', value: resources   ?? 0, href: '/admin/resources', color: 'text-blue-600'     },
          ] as const).map(s => (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all text-center group"
            >
              <p className={`font-display text-3xl font-bold ${s.color} group-hover:scale-110 transition-transform inline-block`}>
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Content pipeline */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Content Pipeline</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">

            <PipelineStep href="/admin/sources" bg="bg-brand-lavender" icon="🌐"
              value={sources} label="Sources" />
            <PipelineArrow />
            <PipelineStep href="/admin/review"
              bg={pending > 0 ? 'bg-brand-coral/20' : 'bg-gray-50'}
              icon="⏳"
              value={pending}
              label="Pending review"
              highlight={pending > 0}
            />
            <PipelineArrow />
            <PipelineStep bg="bg-green-50" icon="✅"
              value={approved} label="Approved this week" />
            <PipelineArrow />
            <PipelineStep href="/events" bg="bg-brand-cream" icon="🌍"
              value={totalEvents ?? 0} label="Live on site" external />

          </div>

          <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
            <span>⚙️ Scraper runs every Monday at 6am PT</span>
            <span className="font-medium text-brand-purple">Next run: {nextScraperRun()}</span>
          </div>
        </div>
      </section>

      {/* Action sections */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Content */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</h2>
          <ActionCard href="/admin/review" icon="🔍" title="Content Review"
            desc="Approve scraped events &amp; resources"
            accent={pending > 0} badge={pending > 0 ? `${pending} pending` : undefined} />
          <ActionCard href="/admin/events" icon="📅" title="Events Manager"
            desc="Manually add or pin events" />
          <ActionCard href="/admin/resources" icon="📖" title="Resource Manager"
            desc="Create, edit, and publish articles" />
        </section>

        {/* Pipeline */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pipeline</h2>
          <ActionCard href="/admin/sources" icon="🌐" title="Scrape Sources"
            desc={`${sources} active sources — add a URL to scrape`} />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="font-semibold text-brand-navy text-sm mb-1">📬 Weekly Email</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Approve events in Review → approved events drop into the notepad → paste into Beehiiv.
            </p>
            <Link href="/admin/review" className="text-xs text-brand-purple hover:underline mt-2 inline-block font-medium">
              Open Review →
            </Link>
          </div>
        </section>

        {/* Community */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Community</h2>
          <ActionCard href="/admin/members" icon="👥" title="Members"
            desc={`${totalUsers ?? 0} total · ${plusUsers ?? 0} Plus · ${freeUsers ?? 0} Free`} />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="font-semibold text-brand-navy text-sm mb-1">💌 Newsletter</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Subscribers managed in Beehiiv. Wednesday automation sends the weekly events email.
            </p>
            <a href="https://app.beehiiv.com" target="_blank" rel="noopener noreferrer"
              className="text-xs text-brand-purple hover:underline mt-2 inline-block font-medium">
              Open Beehiiv →
            </a>
          </div>
        </section>

      </div>
    </div>
  )
}

// ── Pipeline step ─────────────────────────────────────────────

function PipelineStep({
  href, bg, icon, value, label, highlight, external,
}: {
  href?: string
  bg: string
  icon: string
  value: number
  label: string
  highlight?: boolean
  external?: boolean
}) {
  const inner = (
    <div className="flex flex-col items-center gap-1.5 group cursor-default">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center text-xl ${href ? 'group-hover:scale-105 transition-transform' : ''}`}>
        {icon}
      </div>
      <span className={`font-display font-bold text-lg ${highlight ? 'text-brand-coral' : 'text-brand-navy'}`}>
        {value}
      </span>
      <span className="text-xs text-gray-500 text-center whitespace-nowrap">{label}</span>
    </div>
  )

  if (!href) return inner
  return (
    <Link href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {inner}
    </Link>
  )
}

function PipelineArrow() {
  return <div className="text-gray-200 text-xl select-none hidden sm:block">→</div>
}

// ── Action card ───────────────────────────────────────────────

function ActionCard({
  href, icon, title, desc, accent = false, badge,
}: {
  href: string
  icon: string
  title: string
  desc: string
  accent?: boolean
  badge?: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-2xl p-4 border transition-all hover:shadow-md group ${
        accent
          ? 'bg-brand-coral/5 border-brand-coral/30 hover:border-brand-coral/60'
          : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <span className="text-xl mt-0.5 group-hover:scale-110 transition-transform">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-brand-navy text-sm">{title}</p>
          {badge && (
            <span className="bg-brand-coral text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
      </div>
      <span className="text-gray-300 group-hover:text-brand-purple text-sm mt-0.5 transition-colors">›</span>
    </Link>
  )
}
