'use client'

import { useState } from 'react'

type Props = {
  url: string
  title: string
  large?: boolean
}

export default function ShareButtons({ url, title, large = false }: Props) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function handleCopy() {
    try {
      if (navigator.share) {
        // Use native Web Share API on mobile
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        // Silent fail
      }
    }
  }

  const btnBase = large
    ? 'inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-colors min-h-[44px]'
    : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors min-h-[36px]'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Copy / Native Share */}
      <button
        onClick={handleCopy}
        className={`${btnBase} bg-gray-100 text-gray-700 hover:bg-brand-lavender hover:text-brand-purple`}
        title="Copy link"
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {large ? 'Copy link' : 'Copy'}
          </>
        )}
      </button>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} bg-black text-white hover:bg-gray-800`}
        title="Share on X"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        {large ? 'Share on X' : 'X'}
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} bg-blue-600 text-white hover:bg-blue-700`}
        title="Share on Facebook"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {large ? 'Share on Facebook' : 'Facebook'}
      </a>
    </div>
  )
}
