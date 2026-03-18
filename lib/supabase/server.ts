import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { User } from '../types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                maxAge: 60 * 60 * 24 * 30,
              })
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

// Get the current authenticated user + their profile.
// Wrapped with React cache() so layout + page share one DB call per request.
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // Auth session is valid but no DB row yet (e.g. email just confirmed,
  // trigger hasn't fired). Return a minimal free-tier user so the dashboard
  // renders instead of looping into /login.
  if (!data) {
    return {
      id:                     authUser.id,
      email:                  authUser.email ?? '',
      first_name:             authUser.user_metadata?.first_name ?? null,
      role:                   'member',
      tier:                   'free',
      stripe_customer_id:     null,
      stripe_subscription_id: null,
      subscription_status:    null,
      subscription_ends_at:   null,
      beehiiv_subscriber_id:  null,
      created_at:             authUser.created_at,
      last_login_at:          null,
    } as User
  }

  return data
})

// Get user by ID using service role (for webhooks)
export function createServiceClient() {
  const { createClient: createSB } = require('@supabase/supabase-js')
  return createSB(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
