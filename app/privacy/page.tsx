import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How whatwedonowmama collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-brand-navy mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

      <div className="bg-brand-lavender/50 border border-brand-purple/20 rounded-xl p-5 mb-8 text-sm text-brand-navy">
        <strong>Note:</strong> This is a placeholder privacy policy. Before launching, replace this with a properly drafted policy using a generator like <a href="https://termly.io" target="_blank" rel="noopener noreferrer" className="text-brand-purple underline">Termly</a> or <a href="https://www.iubenda.com" target="_blank" rel="noopener noreferrer" className="text-brand-purple underline">iubenda</a>, customized with the details below.
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">What we collect</h2>
          <p>When you create an account or subscribe to our newsletter, we collect your email address and first name. If you upgrade to a Plus membership, payment is processed by Stripe — we never see or store your credit card details.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">How we use it</h2>
          <p>We use your information to deliver the weekly newsletter, provide access to the website and Discord community, send transactional emails (password reset, account notices), and understand how people use the site so we can make it better.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Third-party services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Beehiiv</strong> — newsletter delivery</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Supabase</strong> — authentication and database</li>
            <li><strong>Plausible / Vercel Analytics</strong> — privacy-friendly, cookieless analytics</li>
            <li><strong>Resend</strong> — transactional email</li>
          </ul>
          <p>We do not sell your data. We do not run advertising. We do not share your information with anyone except the service providers listed above, who need it to operate the product.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Cookies</h2>
          <p>We use session cookies to keep you logged in. We do not use advertising trackers or third-party cookies. Our analytics are cookieless.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Your rights</h2>
          <p>You can access, correct, or delete your data at any time. To request deletion, email us at <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a>. You can also delete your account directly from the Account Settings page.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Data retention</h2>
          <p>We retain your account data until you delete your account. Deleted accounts are anonymized rather than hard-deleted to preserve data integrity. Email addresses are permanently removed.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Contact</h2>
          <p>Questions about privacy? Email us: <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a></p>
        </section>
      </div>
    </div>
  )
}
