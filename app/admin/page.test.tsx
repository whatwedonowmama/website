import { render, screen } from '@testing-library/react'
import type { User } from '@/lib/types'

// ---------- mocks ----------

const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: (...args: any[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

// Supabase query builder mock — chainable
function mockSupabaseSelect(count: number) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnValue({ count }),
  }
  // For the initial select without eq (totalUsers)
  chain.select.mockReturnValue({ count, eq: chain.eq })
  return chain
}

const mockFrom = jest.fn()
const mockGetUser = jest.fn<Promise<User | null>, []>()

jest.mock('@/lib/supabase/server', () => ({
  getUser: () => mockGetUser(),
  createClient: () =>
    Promise.resolve({
      from: (...args: any[]) => mockFrom(...args),
    }),
}))

jest.mock('next/link', () => {
  return ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  )
})

import AdminPage from './page'

async function renderPage() {
  const jsx = await AdminPage()
  render(jsx)
}

// ---------- fixtures ----------

const adminUser: User = {
  id: 'a1',
  email: 'admin@whatwedonowmama.com',
  first_name: 'Admin',
  role: 'admin',
  tier: 'plus',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  subscription_status: null,
  subscription_ends_at: null,
  beehiiv_subscriber_id: null,
  created_at: '2024-01-01T00:00:00Z',
  last_login_at: null,
}

// ---------- tests ----------

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // --- redirect non-admin ---

  it('redirects unauthenticated users to homepage', async () => {
    mockGetUser.mockResolvedValue(null)
    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('redirects non-admin members to homepage', async () => {
    mockGetUser.mockResolvedValue({
      ...adminUser,
      role: 'member',
    })
    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  // --- admin dashboard ---

  describe('admin user', () => {
    beforeEach(async () => {
      mockGetUser.mockResolvedValue(adminUser)

      // Mock supabase.from() to return counts
      // The component calls supabase.from('users') three times and .from('resources') once
      mockFrom.mockImplementation((table: string) => {
        const builder: any = {}
        builder.select = jest.fn().mockImplementation(() => {
          if (table === 'resources') {
            return {
              count: undefined,
              eq: jest.fn().mockReturnValue({ count: 15 }),
            }
          }
          // users table — need to handle chained eq
          return {
            count: 500, // fallback for totalUsers (no eq call follows in Promise.all)
            eq: jest.fn().mockImplementation((_col: string, val: string) => {
              if (val === 'plus') return { count: 120 }
              if (val === 'free') return { count: 380 }
              return { count: 0 }
            }),
          }
        })
        return builder
      })

      await renderPage()
    })

    it('displays the admin header with user email', () => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/admin@whatwedonowmama\.com/)).toBeInTheDocument()
    })

    it('renders all four stat cards', () => {
      expect(screen.getByText('Total members')).toBeInTheDocument()
      expect(screen.getByText('Plus subscribers')).toBeInTheDocument()
      expect(screen.getByText('Free members')).toBeInTheDocument()
      expect(screen.getByText('Published resources')).toBeInTheDocument()
    })

    it('displays correct stat values', () => {
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('120')).toBeInTheDocument()
      expect(screen.getByText('380')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('renders all four quick-link cards', () => {
      const links = [
        { name: /Resource Manager/, href: '/admin/resources' },
        { name: /Events Manager/, href: '/admin/events' },
        { name: /Members/, href: '/admin/members' },
        { name: /Cancellations Report/, href: '/admin/cancellations' },
      ]

      links.forEach(({ name, href }) => {
        const link = screen.getByRole('link', { name })
        expect(link).toHaveAttribute('href', href)
      })
    })

    it('shows the Phase 2 admin note', () => {
      expect(screen.getByText(/Admin sub-pages.*Phase 2/)).toBeInTheDocument()
    })
  })
})
