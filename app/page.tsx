import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex flex-col items-center justify-center px-4 py-12 sm:py-8">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo/Branding */}
        <div className="space-y-3 pt-4">
          <h1 className="text-5xl sm:text-6xl font-bold text-white">HiveHaul™</h1>
          <p className="text-blue-100 text-lg sm:text-xl">Local Pickup & Delivery Services</p>
        </div>

        {/* Service Overview */}
        <div className="space-y-4 bg-white/10 backdrop-blur-sm p-6 rounded-lg">
          <p className="text-blue-50 text-base sm:text-lg leading-relaxed">
            Fast, reliable transport and delivery for your needs. From local moves to equipment transport, we handle it all.
          </p>

          <ul className="text-blue-50 text-sm sm:text-base space-y-2 text-left">
            <li className="flex items-center">
              <span className="mr-3">✓</span>
              <span>Quick pickup and delivery</span>
            </li>
            <li className="flex items-center">
              <span className="mr-3">✓</span>
              <span>Professional, insured service</span>
            </li>
            <li className="flex items-center">
              <span className="mr-3">✓</span>
              <span>Fair, transparent pricing</span>
            </li>
          </ul>
        </div>

        {/* Main CTA */}
        <div className="space-y-3">
          <Link
            href="/request"
            className="block w-full bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 text-base sm:text-lg touch-target-lg"
          >
            📦 Request Pickup or Delivery
          </Link>

          <p className="text-blue-100 text-xs sm:text-sm">
            Get an estimate and book your service in minutes
          </p>
        </div>

        {/* Footer */}
        <div className="text-blue-100 text-xs sm:text-sm pt-6 border-t border-blue-400/50">
          <p>HiveHaul™ - Simple, Reliable Transport Services</p>
        </div>
      </div>
    </div>
  )
}
