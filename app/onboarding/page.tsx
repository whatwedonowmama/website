'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const OC_INSIDER_BENEFITS = [
  { icon: '📅', text: 'Early access to events — see them before the public' },
  { icon: '📚', text: 'Full resource library curated for OC parents' },
  { icon: '💬', text: 'Private Discord community of local OC parents' },
  { icon: '✦',  text: 'Founding member badge and recognition' },
  { icon: '🔒', text: 'Lock in the $49/yr founding rate — forever' },
  { icon: '✓',  text: 'Cancel anytime, no questions asked' },
]

const PLUS_BENEFITS = [
  { icon: '📚', text: 'Full resource library curated for OC parents' },
  { icon: '💬', text: 'Private Discord community of local OC parents' },
  { icon: '🎉', text: '7 days completely free — no charge today' },
  { icon: '$',  text: 'Only $7/month after your trial ends' },
  { icon: '✓',  text: 'Cancel anytime, no questions asked' },
]

// ── Step indicator ──────────────────────────────────────────────────
function Steps({ step2Label, accentClass }: { step2Label: string; accentClass: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-8">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>
        <span>Account</span>
      </div>
      <div className="w-6 h-px bg-gray-200" />
      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${accentClass}`}>2</span>
        <span>{step2Label}</span>
      </div>
      <div className="w-6 h-px bg-gray-200" />
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">3</span>
        <span>Dashboard</span>
      </div>
    </div>
  )
}

// ── Main content ────────────────────────────────────────────────────
function OnboardingContent() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const plan        = searchParams.get('plan')

  const [checking,  setChecking]  = useState(true)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [userEmail, setUserEmail] = useState<string | undefined>()

  const isInsider = plan === 'oc-insider'
  const isPlus    = plan === 'plus'

  // Require auth — bounce back to signup if not logged in
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace(`/signup${plan ? `?plan=${plan}` : ''}`)
        return
      }
      setUserEmail(user.email)
      setChecking(false)
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, plan, returnUrl: window.location.href }),
      })
      const { url, error: checkoutError } = await res.json()
      if (url) {
        window.location.href = url
        return
      }
      setError(checkoutError || 'Could not start checkout. Please try again.')
      setLoading(false)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // Loading state while verifying session
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Unknown plan
  if (!isInsider && !isPlus) {
    router.replace('/join')
    return null
  }

  // ── OC INSIDER ───────────────────────────────────────────────────
  if (isInsider) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          <Steps step2Label="Membership" accentClass="bg-brand-gold text-brand-navy" />

          {/* Price card */}
          <div className="bg-brand-navy rounded-3xl p-8 text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              ✦ Founding Member — Limited Spots
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              You&apos;re almost in.
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              Complete your OC Insider membership below.
            </p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-brand-gold font-bold text-6xl leading-none">$49</span>
              <span className="text-gray-400 text-xl mb-1">/year</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Lock in the founding rate forever · Cancel anytime
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              What&apos;s included
            </p>
            <ul className="flex flex-col gap-3">
              {OC_INSIDER_BENEFITS.map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-5 text-center text-brand-gold flex-shrink-0 mt-0.5">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>
          )}

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-brand-gold text-brand-navy font-bold py-4 px-6 rounded-2xl text-base
                       hover:bg-brand-gold/90 active:scale-[0.98] transition-all
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                Connecting to checkout…
              </span>
            ) : (
              'Complete my membership →'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            🔒 Secure payment powered by Stripe
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            <Link href="/join" className="hover:underline">← Back</Link>
          </p>
        </div>
      </div>
    )
  }

  // ── PLUS ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <Steps step2Label="Free trial" accentClass="bg-brand-purple text-white" />

        {/* Price card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-brand-lavender text-brand-navy text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            ⭐ Plus Membership
          </div>
          <h1 className="font-display text-3xl font-bold text-brand-navy mb-1">
            Start your free trial
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Try Plus free for 7 days, then $7/month.
          </p>
          <div className="bg-brand-lavender/40 rounded-2xl py-5 px-6 inline-block">
            <div className="flex items-end justify-center gap-1">
              <span className="text-brand-navy font-bold text-6xl leading-none">$0</span>
              <span className="text-gray-500 text-xl mb-1"> today</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              then $7/mo · Cancel anytime
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            What&apos;s included
          </p>
          <ul className="flex flex-col gap-3">
            {PLUS_BENEFITS.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-5 text-center text-brand-purple flex-shrink-0 mt-0.5 font-bold">{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn-primary w-full justify-center py-4 text-base
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting to checkout…
            </span>
          ) : (
            'Start 7-day free trial →'
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          🔒 Secure payment powered by Stripe · No charge for 7 days
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          <Link href="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
