"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { featuredCarriers } from "@/lib/carriers"
import AnimatedButton from "@/components/animated-button"
import GlossyIcon from "@/components/glossy-icon"
import { fadeInUp, staggerContainer, staggerItem } from "@/components/motion-wrapper"
import {
  HeartIcon,
  ComponentInstanceIcon,
  PersonIcon,
  ArchiveIcon,
  StarIcon,
  CheckIcon,
  ArrowRightIcon,
  RocketIcon,
  LockClosedIcon,
  ChatBubbleIcon
} from "@radix-ui/react-icons"

const mainServices = [
  {
    title: "Business Insurance",
    description: "Comprehensive coverage for businesses of all sizes",
    href: "/business",
    icon: ComponentInstanceIcon,
    features: ["Group Health Plans", "Liability Coverage", "Workers' Compensation", "Business Property"],
    color: "from-navy-600 to-navy-700",
    savings: "Save up to 30%"
  },
  {
    title: "Individual Coverage",
    description: "Personal insurance solutions for you and your family",
    href: "/individual",
    icon: PersonIcon,
    features: ["Health Insurance", "Life Insurance", "Dental & Vision", "Cancer Coverage"],
    color: "from-gray-600 to-gray-700",
    savings: "Plans from $50/month"
  },
  {
    title: "Medicare Solutions",
    description: "Navigate Medicare with confidence and expert guidance",
    href: "/medicare",
    icon: HeartIcon,
    features: ["Medicare Advantage", "Supplement Plans", "Part D Drug Plans", "Provider Networks"],
    color: "from-blue-800 to-blue-900",
    savings: "Free consultation"
  }
]

const whyChooseUs = [
  {
    icon: StarIcon,
    title: "Save Money",
    description: "We compare dozens of options to find you the best rates"
  },
  {
    icon: LockClosedIcon,
    title: "Keep Freedom",
    description: "Choose the coverage that fits your needs, not what we want to sell"
  },
  {
    icon: CheckIcon,
    title: "Expert Guidance",
    description: "20+ years of experience helping families and businesses"
  },
  {
    icon: RocketIcon,
    title: "Fast & Easy",
    description: "Get quotes in minutes, not hours"
  }
]

const testimonialHighlights = [
  {
    text: "Saved over $200/month on our family health plan!",
    author: "Sarah J.",
    location: "Austin, TX"
  },
  {
    text: "Best business insurance rates we've ever found.",
    author: "Mike R.",
    location: "Denver, CO"
  },
  {
    text: "Made Medicare so much easier to understand.",
    author: "Linda C.",
    location: "Seattle, WA"
  }
]

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Page Container - Full width, no padding */}
            <div className="w-full">
                
                {/* Hero Section - Video Background - No padding, touches nav */}
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
                                <AnimatedButton variant="glow" size="lg" className="shadow-xl">
                                    Get Free Quote
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </AnimatedButton>
                                <AnimatedButton 
                                  variant="outline" 
                                  size="lg" 
                                  className="glass border-white text-white hover:bg-white/20 hover:text-white shadow-lg"
                                >
                                    Call (555) 123-4567
                                </AnimatedButton>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Main Content Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Main Services Section */}
                    <motion.section 
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true }}
                      className="py-16 lg:py-24" 
                      aria-labelledby="services-title"
                    >
                        <motion.div 
                          variants={staggerContainer}
                          initial="initial"
                          whileInView="animate"
                          viewport={{ once: true }}
                          className="text-center space-y-6 mb-16"
                        >
                            <motion.h2 
                              variants={staggerItem}
                              id="services-title" 
                              className="text-3xl lg:text-4xl font-bold text-foreground"
                            >
                                Insurance Solutions for Every Need
                            </motion.h2>
                            <motion.p 
                              variants={staggerItem}
                              className="text-lg text-muted-foreground max-w-3xl mx-auto"
                            >
                                Whether you&apos;re protecting your family or your business, we have the expertise and options to help you save money.
                            </motion.p>
                        </motion.div>

                        <motion.div 
                          variants={staggerContainer}
                          initial="initial"
                          whileInView="animate"
                          viewport={{ once: true }}
                          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10"
                        >
                            {mainServices.map((service, index) => {
                                const IconComponent = service.icon
                                const colors = ["blue", "purple", "green"] as const
                                return (
                                    <motion.div
                                      key={index}
                                      variants={staggerItem}
                                      whileHover={{ scale: 1.05, y: -8 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                        <Card className="group glass rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-white/10 border-white/20 hover:border-white/30 glow-primary h-full">
                                            <CardHeader className="space-y-6 pb-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="transform group-hover:scale-110 transition-transform duration-200">
                                                        <GlossyIcon color={colors[index]} size="lg">
                                                            <IconComponent className="h-7 w-7" />
                                                        </GlossyIcon>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-secondary/80 text-secondary-foreground font-medium px-3 py-1 backdrop-blur-sm">
                                                        {service.savings}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-3">
                                                    <CardTitle className="text-xl lg:text-2xl group-hover:text-primary transition-colors">
                                                        {service.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-base leading-relaxed">
                                                        {service.description}
                                                    </CardDescription>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Popular Options:</h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {service.features.map((feature, idx) => (
                                                            <div key={idx} className="flex items-center space-x-3">
                                                            <CheckIcon className="h-4 w-4 text-primary flex-shrink-0" />
                                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <Link href={service.href} className="block">
                                                <AnimatedButton variant="primary" className="w-full transition-all duration-300 shadow-md hover:shadow-lg">
                                                    Explore Options
                                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                                </AnimatedButton>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                                )
                            })}
                        </motion.div>
                    </motion.section>

                    {/* Trusted Carriers Section */}
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

                    {/* Why Choose Us Section */}
                    <section className="py-16" aria-labelledby="why-choose-title">
                        <div className="glass rounded-2xl p-8 lg:p-12 shadow-lg bg-card/80 border border-border/20">
                            <div className="text-center space-y-6 mb-12">
                                <h2 id="why-choose-title" className="text-3xl lg:text-4xl font-bold text-foreground">
                                    Why Choose The Insurance Hawk?
                                </h2>
                                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                    We&apos;re not just another insurance broker. We&apos;re your advocate in a complicated industry.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {whyChooseUs.map((item, index) => {
                                    const IconComponent = item.icon
                                    return (
                                        <div key={index} className="text-center space-y-4 group">
                                            <div className="mx-auto w-16 h-16 bg-secondary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <IconComponent className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Stats & Testimonials Section */}
                    <section className="py-16" aria-labelledby="social-proof">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Stats */}
                            <Card className="glass bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg">
                                <CardHeader className="pb-6">
                                    <CardTitle className="text-center text-2xl text-foreground">Our Track Record</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-8 text-center">
                                        <div className="space-y-2">
                                            <div className="text-4xl font-bold text-primary">$2M+</div>
                                            <div className="text-sm font-medium text-muted-foreground">Saved for Clients</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-4xl font-bold text-foreground">5,000+</div>
                                            <div className="text-sm font-medium text-muted-foreground">Families Protected</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-4xl font-bold text-primary">20+</div>
                                            <div className="text-sm font-medium text-muted-foreground">Years Experience</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-4xl font-bold text-foreground">98%</div>
                                            <div className="text-sm font-medium text-muted-foreground">Satisfaction Rate</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Testimonials */}
                            <Card className="glass shadow-lg">
                                <CardHeader className="pb-6">
                                    <CardTitle className="flex items-center space-x-3 text-xl text-foreground">
                                        <ChatBubbleIcon className="h-6 w-6 text-primary" />
                                        <span>What Clients Say</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {testimonialHighlights.map((testimonial, index) => (
                                        <div key={index} className="border-l-4 border-border pl-6 py-2">
                                            <p className="text-muted-foreground italic text-lg leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                                            <p className="text-sm font-medium text-muted-foreground/70 mt-3">
                                                - {testimonial.author}, {testimonial.location}
                                            </p>
                                        </div>
                                    ))}
                                    <Link href="/about" className="block pt-4">
                                        <Button variant="outline" className="w-full">
                                            Read More Reviews
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Quick Access Navigation */}
                    <section className="py-16" aria-labelledby="quick-access">
                        <div className="text-center mb-12">
                            <h2 id="quick-access" className="text-3xl font-bold text-foreground mb-4">
                                Explore More
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            <Link href="/resources" className="block group">
                                <Card className="glass hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full">
                                    <CardHeader className="text-center pb-6">
                                        <ArchiveIcon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                        <CardTitle className="group-hover:text-primary transition-colors text-xl">Resources Library</CardTitle>
                                        <CardDescription className="text-base">Articles, guides, and educational content</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <Link href="/about" className="block group">
                                <Card className="glass hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full">
                                    <CardHeader className="text-center pb-6">
                                        <HeartIcon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                        <CardTitle className="group-hover:text-primary transition-colors text-xl">About Us</CardTitle>
                                        <CardDescription className="text-base">Our story, mission, and testimonials</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <Link href="/ecosystem" className="block group">
                                <Card className="glass hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full">
                                    <CardHeader className="text-center pb-6">
                                        <ComponentInstanceIcon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                        <CardTitle className="group-hover:text-primary transition-colors text-xl">Ecosystem</CardTitle>
                                        <CardDescription className="text-base">Connect with us across all platforms</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="py-16" aria-labelledby="final-cta">
                        <div className="glass bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-8 lg:p-12 text-center border border-primary/20 shadow-xl">
                            <h2 id="final-cta" className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">Ready to Save Money on Insurance?</h2>
                            <p className="text-muted-foreground mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                                Get personalized quotes from top-rated carriers in minutes. No obligation, no pressure, no hidden fees.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <AnimatedButton variant="glow" size="lg" className="shadow-lg">
                                    Get Free Quotes Now
                                </AnimatedButton>
                                <AnimatedButton variant="outline" size="lg" className="glass border-border hover:bg-accent hover:text-accent-foreground shadow-lg">
                                    Schedule Consultation
                                </AnimatedButton>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>    
    );
}