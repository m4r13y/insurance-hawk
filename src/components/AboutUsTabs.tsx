"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface TabContent {
  id: string
  title: string
  description: string
  features: string[]
  buttonText: string
  placeholderImage: string
  images?: string[]
}

const tabsData: TabContent[] = [
  {
    id: "insurance-hawk",
    title: "Insurance Hawk",
    description: "Your trusted insurance partner providing comprehensive coverage solutions for families and businesses. We make insurance simple, affordable, and accessible.",
    features: [
      "Licensed Insurance Agents",
      "Family-Owned Business", 
      "Years of Combined Experience",
      "Professional Service"
    ],
    buttonText: "Learn More About Us",
    placeholderImage: "/logo.svg",
    images: [
      "/logo.svg",
      "/logo-alt.svg"
    ]
  },
  {
    id: "quote-engine",
    title: "Quote Engine",
    description: "Advanced quote comparison tool that instantly compares plans from multiple carriers to find you the best coverage at the most competitive rates.",
    features: [
      "Real-Time Quote Comparison",
      "Multiple Carrier Options",
      "Instant Rate Calculations",
      "Side-by-Side Plan Analysis"
    ],
    buttonText: "Get Your Quote",
    placeholderImage: "/logo.svg"
  },
  {
    id: "client-portal",
    title: "Client Portal", 
    description: "Comprehensive client portal and policy management system providing seamless access to your insurance information, claims, and documents.",
    features: [
      "Policy Management Dashboard",
      "Claims Tracking",
      "Document Storage",
      "24/7 Account Access"
    ],
    buttonText: "Access Portal",
    placeholderImage: "/logo.svg"
  },
  {
    id: "agent-tools",
    title: "Agent Tools",
    description: "Professional-grade platform designed for insurance agents to efficiently manage their business operations and client relationships.",
    features: [
      "Client Management System",
      "Commission Tracking",
      "Lead Management",
      "Automated Workflows"
    ],
    buttonText: "View Tools",
    placeholderImage: "/logo.svg"
  }
]

export default function AboutUsTabs() {
  const [activeTab, setActiveTab] = useState("insurance-hawk")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const activeContent = tabsData.find(tab => tab.id === activeTab) || tabsData[0]

  const handleJoinWaitlist = (featureName: string) => {
    // Simple alert for now - can be replaced with proper modal
    alert(`Thank you for your interest in ${featureName}! We'll notify you when it's available.`)
  }

  // Auto-cycle through images for insurance-hawk tab
  useEffect(() => {
    if (activeTab === "insurance-hawk" && activeContent.images) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          (prev + 1) % activeContent.images!.length
        )
      }, 4000) // Change image every 4 seconds

      return () => clearInterval(interval)
    }
  }, [activeTab, activeContent.images])

  // Reset image index when switching tabs
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [activeTab])

  // Function to get the appropriate logo for each tab
  const getTabLogo = (tabId: string) => {
    switch (tabId) {
      case "insurance-hawk":
        return "/logo.svg"
      case "quote-engine":
        return "/logo-alt.svg"
      case "client-portal":
        return "/logo.svg"
      case "agent-tools":
        return "/logo-alt.svg"
      default:
        return "/logo.svg"
    }
  }

  return (
    <section className="py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Our Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our comprehensive suite of insurance technology and services designed to serve you better.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {/* Desktop version */}
          <div className="hidden sm:flex flex-wrap justify-center gap-4 w-full">
            {tabsData.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl border transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary/10 border-primary/50 text-primary"
                    : "bg-card border-border/20 hover:border-border/40 text-muted-foreground hover:bg-card/80 hover:text-foreground"
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image 
                    src={getTabLogo(tab.id)} 
                    alt={`${tab.title} Logo`} 
                    width={24} 
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <span className="font-medium">{tab.title}</span>
              </motion.button>
            ))}
          </div>

          {/* Mobile version - just logos in a row */}
          <div className="flex sm:hidden justify-center gap-3 w-full">
            {tabsData.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center w-16 h-16 rounded-2xl border transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary/10 border-primary/50 text-primary"
                    : "bg-card border-border/20 hover:border-border/40 text-muted-foreground hover:bg-card/80 hover:text-foreground"
                }`}
                aria-label={tab.title}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image 
                    src={getTabLogo(tab.id)} 
                    alt={`${tab.title} Logo`} 
                    width={24} 
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Image Side */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-3xl border border-border/20 overflow-hidden transition-all duration-300"
            >
              {activeContent.id === "insurance-hawk" && activeContent.images ? (
                <div className="w-full h-full relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full relative"
                    >
                      <Image 
                        src={activeContent.images[currentImageIndex]} 
                        alt={`Insurance Hawk Solutions ${currentImageIndex + 1}`} 
                        fill
                        className="object-contain p-8"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg">
                        Your trusted insurance partner
                      </p>
                      <div className="flex space-x-1">
                        {activeContent.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex 
                                ? 'bg-card' 
                                : 'bg-card/50 hover:bg-card/75'
                            }`}
                            aria-label={`View image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                  <Image 
                    src={activeContent.placeholderImage} 
                    alt={`${activeContent.title} Logo`} 
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Content Side */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                {activeContent.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {activeContent.description}
              </p>
            </div>

            <div className="space-y-4">
              {activeContent.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>

            {activeContent.id === "insurance-hawk" ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/about" 
                  className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors duration-300"
                >
                  {activeContent.buttonText}
                </Link>
              </motion.div>
            ) : activeContent.id === "quote-engine" ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/individual" 
                  className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors duration-300"
                >
                  {activeContent.buttonText}
                </Link>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleJoinWaitlist(activeContent.title)}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors duration-300"
              >
                {activeContent.buttonText}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
