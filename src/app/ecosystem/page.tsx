"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AnimatedButton from "@/components/animated-button"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"
import {
  GlobeIcon,
  PersonIcon,
  LockClosedIcon,
  ExternalLinkIcon,
  TwitterLogoIcon,
  LinkedInLogoIcon,
  InstagramLogoIcon,
  GitHubLogoIcon,
  VideoIcon,
  ChatBubbleIcon,
  ArrowRightIcon,
  ComponentInstanceIcon,
  ArchiveIcon
} from "@radix-ui/react-icons"

// Custom Facebook Icon Component (since Radix doesn't have it)
const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const socialPlatforms = [
  {
    name: "Facebook",
    description: "Follow us for insurance tips, client stories, and industry updates",
    icon: FacebookIcon,
    url: "https://www.facebook.com/The-Insurance-Hawk",
    color: "from-blue-600 to-blue-700",
    followers: "2.5K followers",
    badge: "Most Active"
  },
  {
    name: "Twitter",
    description: "Quick insurance tips and real-time customer support",
    icon: TwitterLogoIcon,
    url: "https://twitter.com/insurancehawk",
    color: "from-sky-500 to-sky-600",
    followers: "1.8K followers",
    badge: "Breaking News"
  },
  {
    name: "LinkedIn",
    description: "Professional insights and business insurance content",
    icon: LinkedInLogoIcon,
    url: "https://linkedin.com/company/insurancehawk",
    color: "from-blue-700 to-blue-800",
    followers: "3.2K connections",
    badge: "Business Focus"
  },
  {
    name: "Instagram",
    description: "Behind-the-scenes content and client success stories",
    icon: InstagramLogoIcon,
    url: "https://www.instagram.com/theinsurancehawk",
    color: "from-pink-500 to-purple-600",
    followers: "1.2K followers",
    badge: "Visual Stories"
  },
  {
    name: "YouTube",
    description: "Educational videos and webinars about insurance",
    icon: VideoIcon,
    url: "https://www.youtube.com/@theinsurancehawk9030",
    color: "from-red-500 to-red-600",
    followers: "5.6K subscribers",
    badge: "Education Hub"
  }
]

const hawkingEcosystem = [
  {
    title: "Hawking Insurance Group",
    description: "Our parent company providing comprehensive insurance solutions across multiple states",
    url: "https://hawkinginsurancegroup.com",
    icon: GlobeIcon,
    color: "from-blue-500 to-blue-600",
    features: ["Multi-state coverage", "Commercial insurance", "Group benefits", "Risk management"],
    badge: "Parent Company"
  },
  {
    title: "HawkNest Client Portal",
    description: "Secure portal for existing clients to manage policies, file claims, and access documents",
    url: "https://hawknest.insurancehawk.com",
    icon: PersonIcon,
    color: "from-green-500 to-green-600",
    features: ["Policy management", "Claims filing", "Document access", "24/7 availability"],
    badge: "Client Access"
  },
  {
    title: "HawkNest Admin Portal",
    description: "Administrative portal for agents and brokers in our network",
    url: "https://admin.hawknest.com",
    icon: LockClosedIcon,
    color: "from-purple-500 to-purple-600",
    features: ["Agent tools", "Commission tracking", "Client management", "Training resources"],
    badge: "Agent Only"
  },
  {
    title: "Insurance Hawk API",
    description: "Developer API for integrations and custom insurance applications",
    url: "https://api.insurancehawk.com",
    icon: ComponentInstanceIcon,
    color: "from-orange-500 to-orange-600",
    features: ["Quote API", "Policy API", "Claims API", "Documentation"],
    badge: "Developer"
  }
]

const communityResources = [
  {
    title: "Insurance Blog",
    description: "Weekly articles on insurance trends, tips, and industry insights",
    icon: ArchiveIcon,
    url: "/resources",
    color: "bg-blue-100 text-blue-700"
  },
  {
    title: "Webinar Series",
    description: "Monthly educational webinars on various insurance topics",
    icon: VideoIcon,
    url: "/webinars",
    color: "bg-purple-100 text-purple-700"
  },
  {
    title: "Community Forum",
    description: "Connect with other clients and share experiences",
    icon: ChatBubbleIcon,
    url: "/forum",
    color: "bg-green-100 text-green-700"
  },
  {
    title: "Insurance Calculator",
    description: "Tools to help calculate your insurance needs",
    icon: ComponentInstanceIcon,
    url: "/calculators",
    color: "bg-orange-100 text-orange-700"
  }
]

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
        <motion.div variants={staggerItem} className="text-center space-y-6">
          <motion.h1 
            variants={staggerItem}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            The Insurance Hawk Ecosystem
          </motion.h1>
          <motion.p 
            variants={staggerItem}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Connect with us across all platforms and discover the complete suite of tools and resources designed to help you save money and make informed insurance decisions.
          </motion.p>
        </motion.div>

        {/* Social Media Platforms */}
        <motion.div variants={staggerItem} className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Follow Us Everywhere</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay connected and get the latest insurance insights, tips, and updates across all your favorite platforms.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {socialPlatforms.map((platform, index) => {
              const IconComponent = platform.icon
              return (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full group">
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className={`p-3 rounded-lg bg-gradient-to-r ${platform.color}`}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </motion.div>
                        <Badge variant="secondary" className="text-xs">
                          {platform.badge}
                        </Badge>
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{platform.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{platform.followers}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {platform.description}
                      </CardDescription>
                      <Link href={platform.url} target="_blank" rel="noopener noreferrer">
                        <AnimatedButton variant="outline" className="w-full">
                          Follow Us
                          <ExternalLinkIcon className="ml-2 h-4 w-4" />
                        </AnimatedButton>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Hawking Ecosystem */}
        <motion.div variants={staggerItem} className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Our Platform Ecosystem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our complete suite of insurance tools, portals, and services designed to make your insurance experience seamless.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {hawkingEcosystem.map((platform, index) => {
              const IconComponent = platform.icon
              return (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full group">
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className={`p-3 rounded-lg bg-gradient-to-r ${platform.color}`}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </motion.div>
                        <Badge variant="secondary">
                          {platform.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {platform.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription>
                        {platform.description}
                      </CardDescription>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-foreground">Key Features:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {platform.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              <span className="text-xs text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link href={platform.url} target="_blank" rel="noopener noreferrer">
                        <AnimatedButton variant="outline" className="w-full">
                          Visit Platform
                          <ExternalLinkIcon className="ml-2 h-4 w-4" />
                        </AnimatedButton>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Community Resources */}
        <motion.div variants={staggerItem} className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Community Resources</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access free educational content, tools, and connect with our community of insurance-savvy individuals.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {communityResources.map((resource, index) => {
              const IconComponent = resource.icon
              return (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="text-center border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full group">
                    <CardHeader className="space-y-4">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${resource.color}`}
                      >
                        <IconComponent className="h-8 w-8" />
                      </motion.div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {resource.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {resource.description}
                      </CardDescription>
                      <Link href={resource.url}>
                        <AnimatedButton variant="outline" size="sm" className="w-full">
                          Explore
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </AnimatedButton>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div 
          variants={staggerItem}
          className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-center text-white shadow-lg"
        >
          <motion.h2 
            variants={staggerItem}
            className="text-3xl font-bold mb-4"
          >
            Stay in the Loop
          </motion.h2>
          <motion.p 
            variants={staggerItem}
            className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto"
          >
            Get weekly insurance tips, exclusive content, and be the first to know about new features and savings opportunities.
          </motion.p>
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <AnimatedButton variant="secondary" className="px-6">
              Subscribe
            </AnimatedButton>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          variants={staggerItem}
          className="bg-card border border-border rounded-2xl p-8 text-center shadow-md"
        >
          <motion.h2 
            variants={staggerItem}
            className="text-3xl font-bold text-foreground mb-4"
          >
            Ready to Join Our Ecosystem?
          </motion.h2>
          <motion.p 
            variants={staggerItem}
            className="text-muted-foreground mb-6 max-w-2xl mx-auto"
          >
            Experience the full power of The Insurance Hawk ecosystem. Get started with a free quote and discover how much you can save.
          </motion.p>
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/get-started">
              <AnimatedButton size="lg" variant="primary">
                Get Started Today
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </Link>
            <Link href="/about">
              <AnimatedButton size="lg" variant="outline">
                Learn More About Us
              </AnimatedButton>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
