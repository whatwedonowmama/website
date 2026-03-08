'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email or password is incorrect.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
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
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="text-sm font-medium text-brand-navy">Password</label>
          <Link href="/forgot-password" className="text-xs text-brand-purple hover:underline">Forgot?</Link>
        </div>
        <input
          id="password" type="password" required autoComplete="current-password"
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-purple min-h-[44px]"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
        {loading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-brand-purple text-2xl">whatwedonowmama</Link>
          <h1 className="font-display text-2xl font-bold text-brand-navy mt-4">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to your account</p>
        </div>

        <Suspense fallback={<div className="card h-48 animate-pulse bg-gray-50" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-brand-purple font-semibold hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
