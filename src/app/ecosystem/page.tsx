"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    url: "https://facebook.com/insurancehawk",
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
    url: "https://instagram.com/insurancehawk",
    color: "from-pink-500 to-purple-600",
    followers: "1.2K followers",
    badge: "Visual Stories"
  },
  {
    name: "YouTube",
    description: "Educational videos and webinars about insurance",
    icon: VideoIcon,
    url: "https://youtube.com/insurancehawk",
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
    badge: "Agent Portal"
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
    <div className="bg-gray-50 dark:bg-neutral-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            The Insurance Hawk Ecosystem
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Connect with us across all platforms and explore our comprehensive network of insurance solutions and resources.
          </p>
        </div>

        {/* Social Media Platforms */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Follow Us on Social Media</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Stay connected and get the latest insurance tips, industry news, and exclusive offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialPlatforms.map((platform, index) => {
              const IconComponent = platform.icon
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${platform.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {platform.badge}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {platform.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {platform.description}
                      </CardDescription>
                      <p className="text-sm font-medium text-gray-500 mt-2">{platform.followers}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={platform.url} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full group-hover:bg-blue-600 transition-colors">
                        Follow Us
                        <ExternalLinkIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Hawking Insurance Group Ecosystem */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hawking Insurance Group Network</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Access our full suite of insurance platforms and services designed to serve all your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {hawkingEcosystem.map((platform, index) => {
              const IconComponent = platform.icon
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${platform.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {platform.badge}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {platform.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Key Features:</h4>
                      <div className="space-y-1">
                        {platform.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link href={platform.url} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full group-hover:bg-blue-600 transition-colors">
                        Access Portal
                        <ExternalLinkIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Community Resources */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-md">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Community Resources</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Additional resources and tools to help you make informed insurance decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityResources.map((resource, index) => {
              const IconComponent = resource.icon
              return (
                <div key={index} className="text-center space-y-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors group">
                  <div className={`mx-auto w-12 h-12 ${resource.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {resource.description}
                    </p>
                    <Link href={resource.url}>
                      <Button variant="outline" size="sm" className="w-full">
                        Explore
                        <ArrowRightIcon className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive insurance tips, industry updates, and special offers delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button variant="secondary" className="whitespace-nowrap">
              Subscribe Now
            </Button>
          </div>
          <p className="text-xs text-blue-200 mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  )
}
