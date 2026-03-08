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

      <div className="bg-brand-lavender/50 border border-brand-purple/20 rounded-xl p-5 mb-8 text-sm text-brand-navy">
        <strong>Note:</strong> This is a placeholder. Before launching, replace with a properly drafted ToS from a generator like <a href="https://termly.io" target="_blank" rel="noopener noreferrer" className="text-brand-purple underline">Termly</a>, customized for subscription membership.
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Using whatwedonowmama</h2>
          <p>By using this site, you agree to use it only for its intended purpose: finding family events, accessing parenting resources, and connecting with the OC parent community. You may not scrape, reproduce, or commercially use our content without permission.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Membership and billing</h2>
          <p>Free accounts are free forever. Plus membership is $7/month. A 7-day free trial is available — your card is collected at signup and charged on day 8. You can cancel at any time before day 7 and will not be charged. After the trial, you can cancel anytime through your Account Settings or by emailing us.</p>
          <p>Cancellations take effect at the end of the current billing period. We do not offer partial-month refunds.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Community guidelines</h2>
          <p>The Discord community is for Plus members. By joining, you agree to: be kind and inclusive, no spam or unsolicited self-promotion, no harassment or bullying, use the appropriate channels, and report issues to a moderator rather than escalating publicly.</p>
          <p>We reserve the right to remove anyone from the community who violates these standards, with or without a refund, at our discretion.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Content ownership</h2>
          <p>All content on whatwedonowmama is owned by us unless otherwise noted. You may share links and excerpts with attribution. You may not republish our content in full without written permission.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Limitation of liability</h2>
          <p>whatwedonowmama is provided as-is. We are not responsible for errors in event information, actions taken based on our resources, or any indirect damages. Event details change — always confirm with the source before attending.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Governing law</h2>
          <p>These terms are governed by the laws of the State of California.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">Contact</h2>
          <p>Questions? Email us: <a href="mailto:hello@whatwedonowmama.com" className="text-brand-purple underline">hello@whatwedonowmama.com</a></p>
        </section>
      </div>
    </div>
  )
}
