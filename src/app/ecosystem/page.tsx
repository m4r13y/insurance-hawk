"use client"

import { motion } from "framer-motion"
import { staggerContainer } from "@/components/motion-wrapper"
import { HeroSection } from "@/components/about"
import { 
  SocialPlatforms,
  PlatformEcosystem,
  CommunityResources,
  NewsletterSignup,
  CTASection
} from "@/components/ecosystem"
import { ecosystemPageData } from "./ecosystemData"

export default function EcosystemPage() {
  return (
    <div className="bg-background mt-16">
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12"
      >
        
        {/* Hero Section */}
        <HeroSection 
          title={ecosystemPageData.hero.title}
          description={ecosystemPageData.hero.description}
        />

        {/* Social Media Platforms */}
        <SocialPlatforms 
          title={ecosystemPageData.socialPlatforms.title}
          description={ecosystemPageData.socialPlatforms.description}
          platforms={ecosystemPageData.socialPlatforms.platforms}
        />

        {/* Platform Ecosystem */}
        <PlatformEcosystem 
          title={ecosystemPageData.platformEcosystem.title}
          description={ecosystemPageData.platformEcosystem.description}
          platforms={ecosystemPageData.platformEcosystem.platforms}
        />

        {/* Community Resources */}
        <CommunityResources 
          title={ecosystemPageData.communityResources.title}
          description={ecosystemPageData.communityResources.description}
          resources={ecosystemPageData.communityResources.resources}
        />

        {/* Newsletter Signup */}
        <NewsletterSignup 
          title={ecosystemPageData.newsletter.title}
          description={ecosystemPageData.newsletter.description}
          placeholder={ecosystemPageData.newsletter.placeholder}
          buttonText={ecosystemPageData.newsletter.buttonText}
        />

        {/* CTA Section */}
        <CTASection 
          title={ecosystemPageData.cta.title}
          description={ecosystemPageData.cta.description}
          buttons={ecosystemPageData.cta.buttons}
        />

      </motion.div>
    </div>
  )
}
