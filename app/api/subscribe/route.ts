import { NextRequest, NextResponse } from 'next/server'

const BEEHIIV_API_KEY   = process.env.BEEHIIV_API_KEY   ?? ''
const BEEHIIV_PUB_ID    = process.env.BEEHIIV_PUBLICATION_ID ?? ''
const BEEHIIV_API_BASE  = 'https://api.beehiiv.com/v2'

export async function POST(req: NextRequest) {
  // ── Parse email from form submission or JSON body ──
  let email = ''

  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({}))
    email = (body.email ?? '').trim().toLowerCase()
  } else {
    // standard HTML form POST (application/x-www-form-urlencoded)
    const formData = await req.formData().catch(() => new FormData())
    email = ((formData.get('email') as string) ?? '').trim().toLowerCase()
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirectOrJson(req, { ok: false, error: 'Invalid email' }, 400)
  }

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUB_ID) {
    console.error('[subscribe] Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID env vars')
    return redirectOrJson(req, { ok: false, error: 'Server configuration error' }, 500)
  }

  // ── Call Beehiiv subscriptions API ──
  const beehiivRes = await fetch(
    `${BEEHIIV_API_BASE}/publications/${BEEHIIV_PUB_ID}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,       // don't reset existing subscribers
        send_welcome_email:  true,        // trigger welcome automation in Beehiiv
        utm_source:   'whatwedonowmama',
        utm_medium:   'website',
        utm_campaign: 'inline-subscribe',
      }),
    }
  )

  if (!beehiivRes.ok) {
    const errBody = await beehiivRes.text()
    console.error('[subscribe] Beehiiv error:', beehiivRes.status, errBody)
    return redirectOrJson(req, { ok: false, error: 'Subscription failed' }, 502)
  }

  // ── Success ──
  // For plain HTML form POSTs, redirect back with ?subscribed=1
  // For JSON / fetch callers, return JSON
  return redirectOrJson(req, { ok: true }, 200, '/?subscribed=1')
}

// ── Helper: return JSON for fetch, redirect for plain form POST ──
function redirectOrJson(
  req: NextRequest,
  body: object,
  status: number,
  redirectPath?: string
) {
  const isJsonRequest = (req.headers.get('accept') ?? '').includes('application/json')
    || (req.headers.get('content-type') ?? '').includes('application/json')

  if (!isJsonRequest && redirectPath && status < 400) {
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  return NextResponse.json(body, { status })
}
