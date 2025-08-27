"use client"

import HeroSection from "@/components/HeroSection"
import MainServicesSection from "@/components/MainServicesSection"
import TrustedCarriersSection from "@/components/TrustedCarriersSection"
import HowWeWork from "@/components/HowWeWork"
import AboutUsTabs from "@/components/AboutUsTabs"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Page Container - Full width, no padding */}
      <div className="w-full">
        
        {/* Hero Section - Video Background - No padding, touches nav */}
        <HeroSection />

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
        {/* Trusted Carriers Section */}
          <TrustedCarriersSection />

          {/* Main Services Section */}
          <MainServicesSection />

          {/* About Us Tabs Section */}
          <AboutUsTabs />

        </div>
      </div>
    </div>    
  )
}
