import {
  GlobeIcon,
  PersonIcon,
  LockClosedIcon,
  TwitterLogoIcon,
  LinkedInLogoIcon,
  InstagramLogoIcon,
  VideoIcon,
  ChatBubbleIcon,
  ComponentInstanceIcon,
  ArchiveIcon
} from "@radix-ui/react-icons"

// Custom Facebook Icon Component (since Radix doesn't have it)
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

export const ecosystemData = {
  hero: {
    title: "The Insurance Hawk Ecosystem",
    description: "Connect with us across all platforms and discover the complete suite of tools and resources designed to help you save money and make informed insurance decisions."
  },

  socialPlatforms: {
    title: "Follow Us Everywhere",
    description: "Stay connected and get the latest insurance insights, tips, and updates across all your favorite platforms.",
    platforms: [
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
  },

  platformEcosystem: {
    title: "Our Platform Ecosystem",
    description: "Discover our complete suite of insurance tools, portals, and services designed to make your insurance experience seamless.",
    platforms: [
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
  },

  communityResources: {
    title: "Community Resources",
    description: "Access free educational content, tools, and connect with our community of insurance-savvy individuals.",
    resources: [
      {
        title: "Insurance Blog",
        description: "Weekly articles on insurance trends, tips, and industry insights",
        icon: ArchiveIcon,
        url: "/resources",
        color: "bg-primary/10 text-primary"
      },
      {
        title: "Webinar Series",
        description: "Monthly educational webinars on various insurance topics",
        icon: VideoIcon,
        url: "/webinars",
        color: "bg-secondary/10 text-secondary-foreground"
      },
      {
        title: "Community Forum",
        description: "Connect with other clients and share experiences",
        icon: ChatBubbleIcon,
        url: "/forum",
        color: "bg-success/10 text-success"
      },
      {
        title: "Insurance Calculator",
        description: "Tools to help calculate your insurance needs",
        icon: ComponentInstanceIcon,
        url: "/calculators",
        color: "bg-warning/10 text-warning-foreground"
      }
    ]
  },

  newsletter: {
    title: "Stay in the Loop",
    description: "Get weekly insurance tips, exclusive content, and be the first to know about new features and savings opportunities.",
    placeholder: "Enter your email",
    buttonText: "Subscribe"
  },

  cta: {
    title: "Ready to Join Our Ecosystem?",
    description: "Experience the full power of The Insurance Hawk ecosystem. Get started with a free quote and discover how much you can save.",
    buttons: [
      {
        text: "Get Started Today",
        href: "/get-started",
        variant: "primary" as const,
        icon: true
      },
      {
        text: "Learn More About Us",
        href: "/about",
        variant: "outline" as const,
        icon: false
      }
    ]
  }
}
