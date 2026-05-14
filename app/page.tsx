import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-12 sm:py-8" style={{ backgroundColor: '#05080D' }}>
      {/* Subtle honeycomb pattern background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="honeycomb" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M10,0 L30,0 L40,10 L40,30 L30,40 L10,40 L0,30 L0,10 Z" fill="none" stroke="#FFC400" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb)" />
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-lg w-full text-center space-y-8 relative z-10">
        {/* Logo/Branding */}
        <div className="space-y-3 pt-4">
          <h1 className="text-5xl sm:text-6xl font-bold" style={{ color: '#FFFFFF' }}>
            HiveHaul™
          </h1>
          <p className="text-lg sm:text-xl" style={{ color: '#CBD5E1' }}>
            Local Pickup & Delivery Services
          </p>
        </div>

        {/* Service Overview */}
        <div className="space-y-4 p-6 rounded-lg" style={{ backgroundColor: 'rgba(11, 31, 58, 0.6)', borderLeft: '3px solid #FFC400' }}>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#FFFFFF' }}>
            Fast, reliable transport and delivery for your needs.
          </p>

          <ul className="text-sm sm:text-base space-y-2 text-left" style={{ color: '#CBD5E1' }}>
            <li className="flex items-center">
              <span className="mr-3" style={{ color: '#FFC400' }}>✓</span>
              <span>Quick pickup and delivery</span>
            </li>
            <li className="flex items-center">
              <span className="mr-3" style={{ color: '#FFC400' }}>✓</span>
              <span>Professional service</span>
            </li>
            <li className="flex items-center">
              <span className="mr-3" style={{ color: '#FFC400' }}>✓</span>
              <span>Fair, transparent pricing</span>
            </li>
          </ul>
        </div>

        {/* Main CTA */}
        <div className="space-y-3">
          <Link
            href="/request"
            className="block w-full font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 text-base sm:text-lg touch-target-lg"
            style={{
              backgroundColor: '#FFC400',
              color: '#05080D',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5B700'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFC400'
            }}
          >
            Request Pickup or Delivery
          </Link>

          <p className="text-xs sm:text-sm" style={{ color: '#CBD5E1' }}>
            Get an estimate and book your service in minutes
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs sm:text-sm pt-6" style={{ color: '#CBD5E1', borderTop: '1px solid rgba(255, 196, 0, 0.2)' }}>
          <p>HiveHaul™ — Simple, Reliable Transport Services</p>
        </div>
      </div>
    </div>
  )
}
