'use client'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function SignupForm() {
  const [firstName,    setFirstName]    = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  // true while we check for an existing session on mount
  const [checkingSession, setCheckingSession] = useState(true)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const plan         = searchParams.get('plan') // 'plus' | 'oc-insider' | null

  const isOCInsider = plan === 'oc-insider'
  const isPlus      = plan === 'plus'
  const isPaid      = isOCInsider || isPlus

  // On mount: if the visitor is already logged in, skip account creation.
  // Route them to /onboarding?plan=X (if they have a plan) or /dashboard.
  useEffect(() => {
    async function checkExistingSession() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        if (isPaid) {
          // Already authenticated — skip form, go to benefits/payment page
          router.replace(`/onboarding?plan=${plan}`)
        } else {
          // Logged in, no plan — already a member
          router.replace('/dashboard')
        }
        return
      }

      setCheckingSession(false)
    }

    checkExistingSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show spinner while checking session (avoids flash of form)
  if (checkingSession) {
    return (
      <div className="card flex flex-col items-center gap-4 text-center py-12">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    )
  }

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
      options: {
        data: {
          first_name: firstName,
          // Store the intended plan in metadata so the auth callback can
          // resume the correct flow after email confirmation.
          intended_plan: plan ?? null,
        },
      },
    })

    if (authError) {
      setError(authError.message.includes('already registered')
        ? 'That email is already registered. Try logging in instead.'
        : authError.message)
      setLoading(false)
      return
    }

    // Email confirmation required — session not created yet
    if (!data.session) {
      setNeedsConfirm(true)
      setLoading(false)
      return
    }

    // Account created + session active.
    // Paid plan → go to the benefits/payment page.
    // Free → go to home (dashboard is for paid members only).
    if (isPaid) {
      router.push(`/onboarding?plan=${plan}`)
    } else {
      router.push('/')
    }
  }

  // ── Confirmation pending ─────────────────────────────────────────
  if (needsConfirm) {
    return (
      <div className="card flex flex-col items-center gap-4 text-center py-8">
        <p className="text-4xl">📬</p>
        <h2 className="font-display text-xl font-bold text-brand-navy">Check your email</h2>
        <p className="text-sm text-gray-600">
          We sent a confirmation link to <strong>{email}</strong>.{' '}
          {isPaid
            ? "Click it to verify your account, then we'll take you to checkout."
            : 'Click it to activate your account.'}
        </p>
        <p className="text-xs text-gray-400">
          Check your spam folder if you don&apos;t see it within a minute.
        </p>
      </div>
    )
  }

  // ── Signup form ──────────────────────────────────────────────────
  return (
    <>
      {/* Plan context banners */}
      {isOCInsider && (
        <div className="bg-brand-navy border border-brand-gold/30 rounded-xl px-4 py-3 mb-5 text-sm text-center">
          <p className="text-brand-gold font-semibold">✦ OC Insider — Founding Member</p>
          <p className="text-gray-300 mt-0.5">$49/year · Early events · Full library · Discord access</p>
        </div>
      )}
      {isPlus && (
        <div className="bg-brand-lavender border border-brand-purple/30 rounded-xl px-4 py-3 mb-5 text-sm text-brand-navy text-center">
          Plus: All resources + Discord community · 7-day free trial, then $7/mo
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

        <button
          type="submit"
          disabled={loading}
          className={
            isOCInsider
              ? 'w-full justify-center mt-1 bg-brand-gold text-brand-navy font-bold py-3 px-6 rounded-2xl hover:bg-brand-gold/90 transition-colors disabled:opacity-60'
              : 'btn-primary w-full justify-center mt-1 disabled:opacity-60'
          }
        >
          {loading
            ? 'Creating account…'
            : isOCInsider
              ? 'Create account & continue →'
              : isPlus
                ? 'Create account & start trial →'
                : 'Create free account'}
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

// ── Page shell ───────────────────────────────────────────────────────
export default function SignupPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-brand-purple text-2xl">
            whatwedonowmama
          </Link>
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

  const titles: Record<string, { heading: string; sub: string }> = {
    'oc-insider': {
      heading: 'Step 1 of 3 — Create your account',
      sub:     'Then we\'ll show you your OC Insider perks before checkout.',
    },
    'plus': {
      heading: 'Step 1 of 3 — Create your account',
      sub:     'Then we\'ll start your free 7-day trial.',
    },
  }

  const t = plan ? titles[plan] : null

  return (
    <>
      <h1 className="font-display text-xl font-bold text-brand-navy mt-4">
        {t?.heading ?? 'Join the community'}
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        {t?.sub ?? 'Free forever. No credit card needed.'}
      </p>
    </>
  )
}
