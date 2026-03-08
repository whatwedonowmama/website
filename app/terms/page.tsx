import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for whatwedonowmama membership and community.',
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-brand-navy mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-8">

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Acceptance of terms</h2>
          <p>By accessing or using whatwedonowmama.com (&quot;the site&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the site. These terms apply to all visitors, registered users, and Plus members.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">What we offer</h2>
          <p>whatwedonowmama is a community platform for parents in Orange County, California. We provide a weekly events newsletter, a curated resource library, and a private Discord community. Content is a mix of free and Plus-member-only access.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Account registration</h2>
          <p>To access certain features, you must create a free account with a valid email address. You are responsible for keeping your login credentials secure and for all activity that occurs under your account. Please notify us immediately at <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a> if you suspect unauthorized access.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Membership and billing</h2>
          <p><strong>Free accounts</strong> are free forever and include access to the weekly newsletter and select free resources.</p>
          <p className="mt-2"><strong>Plus membership</strong> is $7/month and includes the full resource library and access to the Discord community. A 7-day free trial is available — your card is collected at signup and charged on day 8. You may cancel any time before day 8 and will not be charged.</p>
          <p className="mt-2">After the trial, your membership renews monthly. You can cancel at any time from your Account Settings or by emailing us. Cancellations take effect at the end of the current billing period. We do not offer partial-month refunds.</p>
          <p className="mt-2">If a payment fails, we will notify you by email and your Plus access may be paused until payment is resolved.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Community guidelines</h2>
          <p>The Discord community is a Plus member benefit. By joining, you agree to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Be respectful, kind, and inclusive to all members</li>
            <li>Not spam, solicit, or promote your own business without permission</li>
            <li>Not harass, bully, or demean other members</li>
            <li>Use channels for their intended purpose</li>
            <li>Report problems to a moderator rather than escalating publicly</li>
          </ul>
          <p className="mt-2">We reserve the right to remove anyone from the community who violates these standards, with or without a refund, at our sole discretion. Membership cancellation does not automatically remove you from Discord — removal will be processed within 48 hours of cancellation.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Acceptable use</h2>
          <p>You agree not to use the site to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Scrape, copy, or republish our content without written permission</li>
            <li>Attempt to gain unauthorized access to any part of the site</li>
            <li>Impersonate another user or person</li>
            <li>Use the site for any unlawful purpose</li>
            <li>Interfere with the operation of the site or its servers</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Content ownership</h2>
          <p>All content published on whatwedonowmama — including articles, guides, event roundups, and newsletter issues — is owned by us unless otherwise stated. You may share links and short excerpts with attribution. You may not republish our content in full without written permission.</p>
          <p className="mt-2">Event information is sourced from publicly available listings and third-party sources. We make no guarantees about its accuracy. Always confirm event details with the organizer before attending.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Disclaimer and limitation of liability</h2>
          <p>whatwedonowmama is provided &quot;as is&quot; without warranties of any kind. We are not responsible for errors in event listings, the actions or advice of community members, or any decisions you make based on content found on this site.</p>
          <p className="mt-2">To the fullest extent permitted by law, our liability for any claim arising from your use of the site is limited to the amount you paid us in the 3 months preceding the claim.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Changes to these terms</h2>
          <p>We may update these terms from time to time. We will notify you of significant changes by email or by posting a notice on the site. Continued use of the site after changes are posted constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Governing law</h2>
          <p>These terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes will be resolved in the courts of Orange County, California.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy mb-2">Contact</h2>
          <p>Questions about these terms? Email us: <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a></p>
        </section>

      </div>
    </div>
  )
}
