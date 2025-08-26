"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AnimatedButton from "@/components/animated-button"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"
import {
  StarIcon,
  PersonIcon,
  HeartIcon,
  RocketIcon,
  ChatBubbleIcon,
  EnvelopeClosedIcon,
  MobileIcon,
  GlobeIcon,
  CheckIcon,
  QuoteIcon,
  ArrowRightIcon
} from "@radix-ui/react-icons"

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Austin, TX",
    rating: 5,
    text: "The Insurance Hawk saved me over $200/month on my family's health insurance. The service was exceptional and they found us better coverage than we had before!",
    insurance: "Family Health Insurance",
    avatar: "SJ"
  },
  {
    name: "Mike Rodriguez",
    location: "Denver, CO", 
    rating: 5,
    text: "As a small business owner, finding the right insurance was overwhelming. The Insurance Hawk made it simple and saved us thousands on our business coverage.",
    insurance: "Small Business Package",
    avatar: "MR"
  },
  {
    name: "Linda Chen",
    location: "Seattle, WA",
    rating: 5,
    text: "When I turned 65, Medicare was confusing. The Insurance Hawk explained everything clearly and helped me choose the perfect supplement plan.",
    insurance: "Medicare Supplement",
    avatar: "LC"
  },
  {
    name: "David Thompson",
    location: "Miami, FL",
    rating: 5,
    text: "Life insurance was something I kept putting off. The Insurance Hawk made the process so easy, and I got great coverage at a price I could afford.",
    insurance: "Term Life Insurance",
    avatar: "DT"
  }
]

const missionValues = [
  {
    icon: HeartIcon,
    title: "Client-First Approach",
    description: "Your needs come first. We work for you, not the insurance companies.",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: CheckIcon,
    title: "Transparency",
    description: "No hidden fees, no surprises. We believe in honest, straightforward service.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: RocketIcon,
    title: "Innovation",
    description: "Using technology to make insurance shopping faster and easier.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: PersonIcon,
    title: "Expertise",
    description: "20+ years of experience helping families and businesses save money.",
    color: "from-purple-500 to-violet-500"
  }
]

const contactMethods = [
  {
    icon: MobileIcon,
    title: "Call Us",
    description: "Speak directly with an expert",
    action: "(817) 800-4253",
    href: "tel:+18178004253"
  },
  {
    icon: EnvelopeClosedIcon,
    title: "Email Us",
    description: "Get a response within 24 hours",
    action: "info@hawkinsig.com",
    href: "mailto:info@hawkinsig.com"
  },
  {
    icon: ChatBubbleIcon,
    title: "Live Chat",
    description: "Chat with us right now",
    action: "Start Chat",
    href: "#chat"
  },
  {
    icon: GlobeIcon,
    title: "Schedule Consultation",
    description: "Book a free 30-minute consultation",
    action: "Book Now",
    href: "/consultation"
  }
]

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
        <motion.div variants={staggerItem} className="text-center space-y-6">
          <motion.h1 
            variants={staggerItem}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            About The Insurance Hawk
          </motion.h1>
          <motion.p 
            variants={staggerItem}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Dedicated to helping families and businesses save money while keeping their freedom to choose the best insurance coverage.
          </motion.p>
        </motion.div>

        {/* Origin Story */}
        <motion.div 
          variants={staggerItem}
          className="bg-card border border-border rounded-2xl p-8 lg:p-12 shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              variants={staggerItem}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-foreground">Our Origin Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  The Insurance Hawk was born from a simple frustration: insurance was too complicated, too expensive, and too one-size-fits-all.
                </p>
                <p>
                  After 20+ years in the insurance industry, our founder saw too many families and businesses overpaying for coverage that didn&apos;t meet their actual needs. Traditional insurance brokers were focused on selling products, not solving problems.
                </p>
                <p>
                  We decided to flip the script. Instead of working for insurance companies, we work exclusively for you - our clients. We use technology to compare dozens of options quickly, and we provide honest, transparent advice that puts your financial wellbeing first.
                </p>
                <p className="font-medium text-primary">
                  Our mission is simple: Save your money, keep your freedom.
                </p>
              </div>
            </motion.div>
            <motion.div 
              variants={staggerItem}
              className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 rounded-xl border border-border"
            >
              <div className="space-y-4">
                <div className="text-4xl font-bold text-primary">20+</div>
                <div className="text-muted-foreground">Years of Experience</div>
                
                <div className="text-4xl font-bold text-purple-600">$2M+</div>
                <div className="text-muted-foreground">Saved for Clients</div>
                
                <div className="text-4xl font-bold text-green-600">5,000+</div>
                <div className="text-muted-foreground">Families Protected</div>
                
                <div className="text-4xl font-bold text-orange-600">98%</div>
                <div className="text-muted-foreground">Client Satisfaction</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Mission & Values */}
        <motion.div variants={staggerItem} className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Our Mission & Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything we do is guided by these core principles that put you first.
            </p>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {missionValues.map((value, index) => {
              const IconComponent = value.icon
              return (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="text-center border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full group">
                    <CardHeader className="space-y-4">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={`mx-auto w-16 h-16 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center`}
                      >
                        <IconComponent className="h-8 w-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Testimonials */}
        <motion.div variants={staggerItem} className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real stories from real people who&apos;ve saved money and gained peace of mind.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      {testimonial.insurance}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <QuoteIcon className="absolute -top-2 -left-2 h-6 w-6 text-primary/20" />
                      <p className="text-muted-foreground italic pl-4">
                        &ldquo;{testimonial.text}&rdquo;
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          variants={staggerItem}
          className="bg-card border border-border rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ready to save money on insurance? We&apos;re here to help in whatever way works best for you.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <motion.div 
                  key={index} 
                  variants={staggerItem}
                  className="text-center space-y-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                  >
                    <IconComponent className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                    <AnimatedButton variant="outline" size="sm" className="w-full">
                      {method.action}
                    </AnimatedButton>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          variants={staggerItem}
          className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-center text-white shadow-lg"
        >
          <motion.h2 
            variants={staggerItem}
            className="text-3xl font-bold mb-4"
          >
            Ready to Start Saving?
          </motion.h2>
          <motion.p 
            variants={staggerItem}
            className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto"
          >
            Join thousands of satisfied clients who&apos;ve already discovered how much they can save with The Insurance Hawk.
          </motion.p>
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/get-started">
              <AnimatedButton size="lg" variant="secondary">
                Get My Free Quote
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </Link>
            <AnimatedButton size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Consultation
            </AnimatedButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
