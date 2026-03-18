'use client'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5">
      <span className="text-4xl">⚠️</span>
      <h2 className="font-display text-xl font-bold text-brand-navy">Something went wrong</h2>
      <p className="text-gray-500 text-sm max-w-sm">
        {error.message || 'An unexpected error occurred loading your dashboard.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="btn-primary px-5 py-2 text-sm"
        >
          Try again
        </button>
        <Link href="/" className="btn-outline px-5 py-2 text-sm">
          Go home
        </Link>
      </div>
    </div>
  )
}
