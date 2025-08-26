"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { InstagramLogoIcon, GitHubLogoIcon, VideoIcon, EnvelopeClosedIcon, MobileIcon, GlobeIcon, ArrowRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons"

// Custom Facebook Icon Component (since Radix doesn't have it)
const FacebookIcon = () => (
  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
import AnimatedButton from "./animated-button"
import { Logo } from "./logo"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function AnimatedFooter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    setEmail("")
    
    // Reset success message after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const socialLinks = [
    { name: "Instagram", href: "https://www.instagram.com/theinsurancehawk", icon: InstagramLogoIcon },
    { name: "Facebook", href: "https://www.facebook.com/The-Insurance-Hawk", icon: FacebookIcon },
    { name: "YouTube", href: "https://www.youtube.com/@theinsurancehawk9030", icon: VideoIcon },
  ]

  return (
    <footer className="relative bg-transparent border-t border-border/50">
      {/* Newsletter Section */}
      <div className="relative z-10 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Stay Informed About Your Coverage</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get important updates about insurance changes, enrollment periods, and money-saving tips delivered to your inbox.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            onSubmit={handleNewsletterSubmit}
            className="max-w-md mx-auto"
          >
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass bg-background/50 border-border/50 rounded-xl flex-1"
                required
              />
              <AnimatedButton
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="px-6 rounded-xl"
              >
                {isSubmitting ? "..." : isSubmitted ? "✓" : "Subscribe"}
              </AnimatedButton>
            </div>
            {isSubmitted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary text-center mt-3 text-sm"
              >
                Thank you for subscribing!
              </motion.p>
            )}
          </motion.form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section: Logo and Mission */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Logo */}
            <div className="flex justify-center">
              <Logo className="h-16 w-auto" />
            </div>

            {/* Mission Statement */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Family-owned insurance agency serving families and businesses with personalized insurance solutions that save money and protect your freedom.
            </p>

            {/* Social Media Links */}
            <div className="flex justify-center space-x-6 pt-4">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <motion.div
                  key={name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={href}
                    className="group"
                    aria-label={name}
                  >
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Middle Section: Navigation Grid */}
        <div className="border-t border-border/50 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Services Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-6">Services</h4>
              <ul className="space-y-4">
                {[
                  { name: "Medicare Plans", href: "/medicare" },
                  { name: "Business Insurance", href: "/business" },
                  { name: "Individual Insurance", href: "/individual" },
                  { name: "Life Insurance", href: "/individual" },
                  { name: "Health Insurance", href: "/individual" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-6">Resources</h4>
              <ul className="space-y-4">
                {[
                  { name: "Insurance Library", href: "/library" },
                  { name: "Blog Articles", href: "/resources" },
                  { name: "Enrollment Tools", href: "/medicare" },
                  { name: "Calculators", href: "/medicare" },
                  { name: "Guides", href: "/resources" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-6">Company</h4>
              <ul className="space-y-4">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Our Team", href: "/about" },
                  { name: "Success Stories", href: "/about" },
                  { name: "Contact", href: "/about" },
                  { name: "Get Started", href: "/" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-6">Legal</h4>
              <ul className="space-y-4">
                {[
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                  { name: "HIPAA Notice", href: "/hipaa" },
                  { name: "Accessibility", href: "/accessibility" },
                  { name: "Licenses", href: "/licenses" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-border/50 pt-12 mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <MobileIcon className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">(817) 800-4253</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <EnvelopeClosedIcon className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">info@hawkinsig.com</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <GlobeIcon className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">San Antonio, TX / Fort Worth, TX</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-border/50 pt-8 mt-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Hawkins Insurance Group, LLC. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/accessibility" className="text-muted-foreground hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Medicare Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        viewport={{ once: true }}
        className="bg-muted/30 border-t border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Hawkins Insurance Group, LLC is not connected with or endorsed by the United States government or the federal Medicare program. 
            We do not offer every plan available in your area. Any information we provide is limited to those plans we do offer in your area. 
            Please contact Medicare.gov or 1-800-MEDICARE to get information on all of your options.
          </p>
        </div>
      </motion.div>
    </footer>
  )
}
