'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function SignupForm() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const plan         = searchParams.get('plan')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } },
    })

    if (authError) {
      setError(authError.message.includes('already registered')
        ? 'That email is already registered. Try logging in instead.'
        : authError.message)
      setLoading(false)
      return
    }

    // If no session, Supabase sent a confirmation email — show check-your-email screen
    if (!data.session) {
      setNeedsConfirm(true)
      setLoading(false)
      return
    }

    // Session exists — user is immediately signed in (email confirmation disabled)
    if (plan === 'plus') {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, returnUrl: window.location.href }),
      })
      const { url } = await res.json()
      window.location.href = url
      return
    }

    router.push('/dashboard?welcome=1')
    router.refresh()
  }

  if (needsConfirm) {
    return (
      <div className="card flex flex-col items-center gap-4 text-center py-8">
        <p className="text-4xl">📬</p>
        <h2 className="font-display text-xl font-bold text-brand-navy">Check your email</h2>
        <p className="text-sm text-gray-600">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and get into your dashboard.
        </p>
        <p className="text-xs text-gray-400">Check your spam folder if you don&apos;t see it within a minute.</p>
      </div>
    )
  }

  return (
    <>
      {plan === 'plus' && (
        <div className="bg-brand-lavender border border-brand-purple/30 rounded-xl px-4 py-3 mb-5 text-sm text-brand-navy text-center">
          Plus: All resources + Discord community &middot; 7-day free trial
        </div>
      )}

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-sm font-medium text-brand-navy">First name</label>
          <input
            id="firstName" type="text" required autoComplete="given-name"
            value={firstName} onChange={e => setFirstName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-purple min-h-[44px]"
            placeholder="Your first name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-brand-navy">Email</label>
          <input
            id="email" type="email" required autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-purple min-h-[44px]"
            placeholder="you@email.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-brand-navy">Password</label>
          <input
            id="password" type="password" required autoComplete="new-password"
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-purple min-h-[44px]"
            placeholder="Min. 8 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
          {loading ? 'Creating account...' : plan === 'plus' ? 'Continue to checkout' : 'Create free account'}
        </button>

        <p className="text-xs text-center text-gray-400">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-brand-purple underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-brand-purple underline">Privacy Policy</Link>.
        </p>
      </form>
    </>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-brand-purple text-2xl">whatwedonowmama</Link>
          <Suspense fallback={<div className="h-16" />}>
            <SignupPageTitle />
          </Suspense>
        </div>

        <Suspense fallback={<div className="card h-64 animate-pulse bg-gray-50" />}>
          <SignupForm />
        </Suspense>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-purple font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}

function SignupPageTitle() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-navy mt-4">
        {plan === 'plus' ? 'Start your Plus trial' : 'Join the community'}
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        {plan === 'plus' ? '7 days free · $7/mo after · cancel anytime' : 'Free forever. No credit card needed.'}
      </p>
    </>
  )
}
