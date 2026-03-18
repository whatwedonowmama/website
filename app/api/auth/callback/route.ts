import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Handles Supabase Auth callbacks (magic links, email confirmation)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code     = searchParams.get('code')
  const next     = searchParams.get('next') ?? '/dashboard'
  const errorMsg = searchParams.get('error_description')

  if (errorMsg) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, maxAge: 60 * 60 * 24 * 30 })
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ensure a row exists in public.users — the DB trigger may not have fired
      // (e.g. when email confirmation is enabled, the trigger fires on auth.users
      //  insert but the anon client can't always read it back immediately).
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const service = createServiceClient()
          // INSERT … ON CONFLICT DO NOTHING — safe to call every time
          await service.from('users').insert({
            id:         authUser.id,
            email:      authUser.email ?? '',
            first_name: authUser.user_metadata?.first_name ?? null,
            role:       'member',
            tier:       'free',
          }).select()
          // If the row already exists, Supabase returns a 409 which we ignore below
        }
      } catch {
        // Non-fatal — getUser() fallback handles missing rows gracefully
      }

      return NextResponse.redirect(`${origin}${next}?welcome=1`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
