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
import { ecosystemData } from "@/components/ecosystem/ecosystemData"

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
          title={ecosystemData.hero.title}
          description={ecosystemData.hero.description}
        />

        {/* Social Media Platforms */}
        <SocialPlatforms 
          title={ecosystemData.socialPlatforms.title}
          description={ecosystemData.socialPlatforms.description}
          platforms={ecosystemData.socialPlatforms.platforms}
        />

        {/* Platform Ecosystem */}
        <PlatformEcosystem 
          title={ecosystemData.platformEcosystem.title}
          description={ecosystemData.platformEcosystem.description}
          platforms={ecosystemData.platformEcosystem.platforms}
        />

        {/* Community Resources */}
        <CommunityResources 
          title={ecosystemData.communityResources.title}
          description={ecosystemData.communityResources.description}
          resources={ecosystemData.communityResources.resources}
        />
      </motion.div>
    </div>
  )
}
