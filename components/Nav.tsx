'use client'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="font-display font-bold text-brand-purple text-lg leading-tight">
          whatwedonowmama
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-navy">
          <Link href="/events" className="hover:text-brand-purple transition-colors">This Week in OC</Link>
          <Link href="/resources" className="hover:text-brand-purple transition-colors">Resources</Link>
          <Link href="/about" className="hover:text-brand-purple transition-colors">Our Story</Link>
          <Link href="/dashboard" className="hover:text-brand-purple transition-colors">Dashboard</Link>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-brand-navy hover:text-brand-purple">Log in</Link>
          <Link href="/signup" className="btn-primary text-sm px-4 py-2">Join Free</Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-navy"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          <Link href="/events" className="text-base font-medium py-2" onClick={() => setOpen(false)}>This Week in OC</Link>
          <Link href="/resources" className="text-base font-medium py-2" onClick={() => setOpen(false)}>Resources</Link>
          <Link href="/about" className="text-base font-medium py-2" onClick={() => setOpen(false)}>Our Story</Link>
          <Link href="/dashboard" className="text-base font-medium py-2" onClick={() => setOpen(false)}>Dashboard</Link>
          <hr className="border-gray-100" />
          <Link href="/login" className="text-base font-medium py-2" onClick={() => setOpen(false)}>Log in</Link>
          <Link href="/signup" className="btn-primary text-center" onClick={() => setOpen(false)}>Join Free</Link>
        </div>
      )}
    </header>
  )
}
