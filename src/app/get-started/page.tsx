import GetStartedFlow from "@/components/GetStartedFlow"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started with Insurance Hawk | Free Consultation',
  description: 'Begin your journey with Insurance Hawk. Our guided process makes it easy to find the right insurance coverage. Get a free, no-obligation consultation today.',
  alternates: {
    canonical: '/get-started',
  },
}

export default function GetStartedPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <GetStartedFlow />
      </div>
    </div>
  )
}
