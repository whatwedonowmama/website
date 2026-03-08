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

      <div className="prose prose-sm max-w-none text-gray-700 space-y-8">

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Overview</h2>
          <p>whatwedonowmama (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates whatwedonowmama.com. We take your privacy seriously. This policy explains what information we collect, how we use it, and your rights around it. We do not sell your data. We do not run ads.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">What we collect</h2>
          <p>We collect the following when you use our site:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Account information:</strong> your first name and email address when you create an account or subscribe to our newsletter.</li>
            <li><strong>Payment information:</strong> if you upgrade to a Plus membership, your payment is processed by Stripe. We never see or store your credit card number — only a customer reference ID that Stripe provides.</li>
            <li><strong>Usage data:</strong> pages visited and general site activity, collected in a cookieless, privacy-friendly way through Vercel Analytics. No personal identifiers are stored.</li>
            <li><strong>Communications:</strong> if you email us, we retain that correspondence to respond to you.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">How we use your information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To create and manage your account</li>
            <li>To deliver the weekly newsletter and event updates</li>
            <li>To process payments and manage your membership</li>
            <li>To grant access to the Plus Discord community</li>
            <li>To send transactional emails (password resets, billing notices)</li>
            <li>To improve the site and understand how it&apos;s being used</li>
          </ul>
          <p className="mt-2">We do not use your data for advertising, and we do not share it with third parties for their own marketing purposes.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Third-party services</h2>
          <p>We use the following services to operate the site. Each has its own privacy policy:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Supabase</strong> — authentication and database hosting</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Beehiiv</strong> — newsletter delivery and subscriber management</li>
            <li><strong>Resend</strong> — transactional email (password resets, account emails)</li>
            <li><strong>Vercel</strong> — website hosting and analytics</li>
            <li><strong>Discord</strong> — community platform for Plus members</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Cookies</h2>
          <p>We use a single session cookie to keep you logged into your account. This cookie expires after 30 days of inactivity. We do not use advertising cookies, tracking pixels, or third-party cookies. Our site analytics are cookieless.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Children&apos;s privacy</h2>
          <p>whatwedonowmama is a community for parents and is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child, please contact us immediately at <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a> and we will delete it.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">California privacy rights (CCPA)</h2>
          <p>If you are a California resident, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Know what personal information we collect and how it is used</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of the sale of your personal information (we do not sell it)</li>
            <li>Not be discriminated against for exercising these rights</li>
          </ul>
          <p className="mt-2">To exercise these rights, email us at <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a>.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Your rights</h2>
          <p>You can access, update, or delete your account information at any time from your Account Settings page. To request full data deletion, email us at <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a>. We will process your request within 30 days.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Data retention</h2>
          <p>We retain your account data for as long as your account is active. When you delete your account, your email address and name are permanently removed. Anonymized usage data may be retained for analytics purposes. Payment records are retained as required by law.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Changes to this policy</h2>
          <p>We may update this policy from time to time. If we make significant changes, we will notify you by email or by posting a notice on the site. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Contact</h2>
          <p>Questions about privacy? Email us: <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a></p>
        </section>

      </div>
    </div>
  )
}
