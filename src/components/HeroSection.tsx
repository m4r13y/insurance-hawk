"use client"

import { motion } from "framer-motion"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import AnimatedButton from "@/components/animated-button"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"
import Link from "next/link"

export default function HeroSection() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative overflow-hidden h-screen min-h-[600px] flex items-center justify-center" 
      aria-labelledby="hero-title"
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const video = e.target as HTMLVideoElement;
            console.error('Video failed to load:', video.error?.code, video.error?.message);
          }}
          onLoadedData={() => {
            console.log('Video loaded successfully');
          }}
        >
          <source src="https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/public-videos%2F0615(2).mp4?alt=media&token=cfc161e0-6323-4a43-96db-ef9e8a4fa77d" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
        
        {/* Enhanced gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/20"></div>
      </div>
      
      {/* Hero Content - Enhanced with motion and glass effects */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div variants={staggerItem} className="space-y-4">
            <motion.h1 
              id="hero-title" 
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg"
              style={{
                textShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
              }}
            >
              The Insurance Hawk
            </motion.h1>
            <motion.div 
              variants={staggerItem}
              className="text-xl lg:text-3xl text-white font-medium drop-shadow-md bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent"
            >
               Save Your Money - Keep Your Freedom
            </motion.div>
          </motion.div>
          <motion.p 
            variants={staggerItem}
            className="text-white text-lg lg:text-xl leading-relaxed opacity-90 max-w-3xl mx-auto drop-shadow-md"
          >
            We help families and businesses find the best insurance coverage at the lowest prices. No sales pressure, no hidden fees - just honest advice that puts your needs first.
          </motion.p>
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
          >
            <Link href="/get-started">
              <AnimatedButton variant="glow" size="lg" className="shadow-xl">
                Get Free Quote
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </Link>
            <AnimatedButton 
              variant="outline" 
              size="lg" 
              className="glass border-white text-white hover:bg-card/20 hover:text-white shadow-lg"
            >
              Call (817) 800-4253
            </AnimatedButton>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  )
}
