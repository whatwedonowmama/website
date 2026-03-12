import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="font-display font-bold text-xl text-brand-gold mb-2">whatwedonowmama</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your guide to doing life with little ones in Orange County.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">Explore</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="hover:text-brand-coral transition-colors">This Week in OC</Link></li>
              <li><Link href="/resources" className="hover:text-brand-coral transition-colors">Resources</Link></li>
              <li><Link href="/orange-county-farmers-market" className="hover:text-brand-coral transition-colors">OC Farmers Markets</Link></li>
              <li><Link href="/members/community" className="hover:text-brand-coral transition-colors">Community</Link></li>
              <li><Link href="/about" className="hover:text-brand-coral transition-colors">Our Story</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">Account</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-brand-coral transition-colors">Join Free</Link></li>
              <li><Link href="/login" className="hover:text-brand-coral transition-colors">Log In</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-coral transition-colors">Dashboard</Link></li>
              <li><Link href="/account" className="hover:text-brand-coral transition-colors">Account Settings</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} whatwedonowmama. Orange County, CA.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
