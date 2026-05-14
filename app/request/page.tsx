'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RequestPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/client/intake')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600">Redirecting to service request form...</p>
    </div>
  )
}
