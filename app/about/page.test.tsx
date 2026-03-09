import { render, screen } from '@testing-library/react'
import AboutPage from './page'

// Mock next/link to render a plain anchor
jest.mock('next/link', () => {
  return ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  )
})

describe('AboutPage', () => {
  beforeEach(() => {
    render(<AboutPage />)
  })

  it('renders the story section with headline and paragraphs', () => {
    expect(screen.getByText('Our Story')).toBeInTheDocument()
    expect(
      screen.getByText('"What do we do now, mama?"')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/That's what our son August started asking/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/So we started making our own list/)
    ).toBeInTheDocument()
  })

  it('renders the "What we do" section with all three items', () => {
    expect(screen.getByText('What we do')).toBeInTheDocument()
    expect(screen.getByText('We find the events')).toBeInTheDocument()
    expect(screen.getByText('We write the guides')).toBeInTheDocument()
    expect(screen.getByText('We built the community')).toBeInTheDocument()
  })

  it('renders the "What we believe" section with all values', () => {
    expect(screen.getByText('What we believe')).toBeInTheDocument()
    expect(
      screen.getByText(/Good parenting isn't about doing everything right/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Free should actually mean free/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/No judgment/)
    ).toBeInTheDocument()
  })

  it('renders the team section', () => {
    expect(screen.getByText('The family behind it')).toBeInTheDocument()
    expect(screen.getByText(/Bran/)).toBeInTheDocument()
    expect(screen.getByText(/Orange County, CA/)).toBeInTheDocument()
  })

  it('renders the CTA section with a sign-up link', () => {
    expect(screen.getByText('Come hang out.')).toBeInTheDocument()
    const joinLink = screen.getByRole('link', { name: /Join free/ })
    expect(joinLink).toBeInTheDocument()
    expect(joinLink).toHaveAttribute('href', '/signup')
  })
})
