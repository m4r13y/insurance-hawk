"use client"

import { motion } from "framer-motion"
import TeamSection from "@/components/TeamSection"
import { staggerContainer } from "@/components/motion-wrapper"
import { 
  HeroSection,
  OriginStory,
  MissionValues,
  Testimonials,
  ContactSection
} from "@/components/about"
import { aboutPageData } from "./aboutData"

export default function AboutPage() {
  return (
    <div className="bg-background mt-16">
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16"
      >
        
        {/* Hero Section */}
        <HeroSection 
          title={aboutPageData.hero.title}
          description={aboutPageData.hero.description}
        />

        {/* Origin Story */}
        <OriginStory 
          title={aboutPageData.originStory.title}
          paragraphs={aboutPageData.originStory.paragraphs}
          mission={aboutPageData.originStory.mission}
          statistics={aboutPageData.originStory.statistics}
        />

        {/* Team Section */}
        <TeamSection />

        {/* Mission & Values */}
        <MissionValues 
          title={aboutPageData.missionValues.title}
          description={aboutPageData.missionValues.description}
          values={aboutPageData.missionValues.values}
        />

        {/* Testimonials */}
        <Testimonials 
          title={aboutPageData.testimonials.title}
          description={aboutPageData.testimonials.description}
          testimonials={aboutPageData.testimonials.items}
        />

        {/* Contact Section */}
        <ContactSection 
          title={aboutPageData.contactSection.title}
          description={aboutPageData.contactSection.description}
          contactMethods={aboutPageData.contactSection.methods}
        />

      </motion.div>
    </div>
  )
}
