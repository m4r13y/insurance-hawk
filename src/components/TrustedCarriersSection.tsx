"use client"

import { featuredCarriers } from "@/lib/carriers"

export default function TrustedCarriersSection() {
  return (
    <section className="py-12" aria-labelledby="carriers-title">
      <div className="text-center space-y-6 mb-8">
        <h2 id="carriers-title" className="text-2xl lg:text-3xl font-bold text-foreground">
          Trusted by Leading Insurance Carriers
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We partner with top-rated insurance companies to bring you the best coverage options and competitive rates.
        </p>
      </div>
      
      {/* Carousel Container with Fade Effects */}
      <div className="relative overflow-hidden">
        {/* Left Fade Gradient */}
        <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none"></div>
        
        {/* Right Fade Gradient */}
        <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none"></div>
        
        {/* Carousel Track */}
        <div className="flex animate-scroll gap-8 py-4">
          {/* First Set of Logos */}
          {featuredCarriers.map((carrier, index) => (
            <div key={`first-${carrier.id}`} className="flex-shrink-0 min-w-fit flex items-center justify-center w-48">
              <img 
                className="h-20 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 filter" 
                alt={carrier.name}
                src={carrier.logoUrl}
                title={carrier.name}
              />
            </div>
          ))}
          {/* Duplicate Set for Seamless Loop */}
          {featuredCarriers.map((carrier, index) => (
            <div key={`second-${carrier.id}`} className="flex-shrink-0 min-w-fit flex items-center justify-center w-48">
              <img 
                className="h-20 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 filter" 
                alt={carrier.name}
                src={carrier.logoUrl}
                title={carrier.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
