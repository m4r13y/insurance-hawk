"use client"

import { featuredCarriers } from "@/lib/carrier-system"

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
      <div 
        className="relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0px, black 80px, black calc(100% - 80px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 80px, black calc(100% - 80px), transparent 100%)'
        }}
      >
        {/* Carousel Track */}
        <div className="flex animate-ticker gap-4 md:gap-8 py-4 will-change-transform w-max">
          {/* First Set of Logos */}
          {featuredCarriers.map((carrier, index) => (
            <div key={`first-${carrier.id}`} className="flex-shrink-0 min-w-fit flex items-center justify-center w-32 md:w-48">
              <img 
                className="h-16 md:h-20 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 filter" 
                alt={carrier.name}
                src={carrier.logoUrl}
                title={carrier.name}
              />
            </div>
          ))}
          {/* Second Set for Seamless Loop */}
          {featuredCarriers.map((carrier, index) => (
            <div key={`second-${carrier.id}`} className="flex-shrink-0 min-w-fit flex items-center justify-center w-32 md:w-48">
              <img 
                className="h-16 md:h-20 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 filter" 
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
