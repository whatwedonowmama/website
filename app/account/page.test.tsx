import { render, screen } from '@testing-library/react'
import type { User } from '@/lib/types'

// ---------- mocks ----------

const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: (...args: any[]) => {
    mockRedirect(...args)
    // redirect throws in Next.js to halt rendering; simulate that
    throw new Error('NEXT_REDIRECT')
  },
}))

const mockGetUser = jest.fn<Promise<User | null>, []>()
jest.mock('@/lib/supabase/server', () => ({
  getUser: () => mockGetUser(),
}))

jest.mock('next/link', () => {
  return ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  )
})

// The component is an async Server Component — import after mocks
import AccountPage from './page'

// Helper: render the async server component
async function renderPage() {
  const jsx = await AccountPage()
  render(jsx)
}

// ---------- fixtures ----------

const baseUser: User = {
  id: 'u1',
  email: 'parent@example.com',
  first_name: 'Jamie',
  role: 'member',
  tier: 'free',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  subscription_status: null,
  subscription_ends_at: null,
  beehiiv_subscriber_id: null,
  created_at: '2024-01-01T00:00:00Z',
  last_login_at: null,
}

// ---------- tests ----------

describe('AccountPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects unauthenticated visitors to login', async () => {
    mockGetUser.mockResolvedValue(null)
    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?redirect=/account')
  })

  // --- free member ---
  describe('free member', () => {
    beforeEach(async () => {
      mockGetUser.mockResolvedValue({ ...baseUser })
      await renderPage()
    })

    it('displays profile info', () => {
      expect(screen.getByDisplayValue('Jamie')).toBeInTheDocument()
      expect(screen.getByDisplayValue('parent@example.com')).toBeInTheDocument()
    })

    it('shows Free membership badge and upgrade CTA', () => {
      expect(screen.getAllByText('Free')).toHaveLength(2) // label + badge
      expect(screen.getByRole('link', { name: /Upgrade to Plus/ })).toHaveAttribute(
        'href',
        '/signup?plan=plus',
      )
    })

    it('renders save-changes button in the profile form', () => {
      expect(screen.getByRole('button', { name: /Save changes/ })).toBeInTheDocument()
    })

    it('renders account deletion section', () => {
      expect(screen.getByText('Delete account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Delete my account/ })).toBeInTheDocument()
    })
  })

  // --- plus member ---
  describe('plus member', () => {
    beforeEach(async () => {
      mockGetUser.mockResolvedValue({
        ...baseUser,
        tier: 'plus',
        subscription_status: 'active',
        stripe_customer_id: 'cus_123',
      })
      await renderPage()
    })

    it('shows Plus badge and membership label', () => {
      expect(screen.getByText('Plus')).toBeInTheDocument()
      expect(screen.getByText('⭐ Plus')).toBeInTheDocument()
    })

    it('shows billing portal button when stripe customer exists', () => {
      expect(
        screen.getByRole('button', { name: /Manage billing/ }),
      ).toBeInTheDocument()
    })

    it('shows renewal info', () => {
      expect(screen.getByText(/\$7\/month/)).toBeInTheDocument()
    })
  })

  // --- trial member ---
  describe('trial member', () => {
    beforeEach(async () => {
      mockGetUser.mockResolvedValue({
        ...baseUser,
        tier: 'plus',
        subscription_status: 'trialing',
        stripe_customer_id: 'cus_456',
      })
      await renderPage()
    })

    it('shows trial label', () => {
      expect(screen.getByText('Plus — Free Trial')).toBeInTheDocument()
    })

    it('shows trial-specific note', () => {
      expect(screen.getByText(/Trial active/)).toBeInTheDocument()
      expect(screen.getByText(/Discord unlocks on day 8/)).toBeInTheDocument()
    })
  })

  // --- profile update form ---
  describe('profile update form', () => {
    beforeEach(async () => {
      mockGetUser.mockResolvedValue({ ...baseUser })
      await renderPage()
    })

    it('has a form that posts to the update endpoint', () => {
      const form = screen.getByRole('button', { name: /Save changes/ }).closest('form')
      expect(form).toHaveAttribute('action', '/api/account/update')
      expect(form).toHaveAttribute('method', 'POST')
    })

    it('pre-fills the first name input', () => {
      const input = screen.getByDisplayValue('Jamie')
      expect(input).toHaveAttribute('name', 'first_name')
    })

    it('disables the email input', () => {
      expect(screen.getByDisplayValue('parent@example.com')).toBeDisabled()
    })
  })

  // --- account deletion ---
  describe('account deletion', () => {
    beforeEach(async () => {
      mockGetUser.mockResolvedValue({ ...baseUser })
      await renderPage()
    })

    it('renders a warning about permanent deletion', () => {
      expect(
        screen.getByText(/permanently anonymize your account data/),
      ).toBeInTheDocument()
    })

    it('renders the delete button', () => {
      const btn = screen.getByRole('button', { name: /Delete my account/ })
      expect(btn).toBeInTheDocument()
    })
  })
})
