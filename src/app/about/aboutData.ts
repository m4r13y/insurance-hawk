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

export const aboutPageData = {
  hero: {
    title: "About The Insurance Hawk",
    description: "Dedicated to helping families and businesses save money while keeping their freedom to choose the best insurance coverage."
  },
  
  originStory: {
    title: "Our Origin Story",
    paragraphs: [
      "The Insurance Hawk was born from a simple frustration: insurance was too complicated, too expensive, and too one-size-fits-all.",
      "After 20+ years in the insurance industry, our founder saw too many families and businesses overpaying for coverage that didn't meet their actual needs. Traditional insurance brokers were focused on selling products, not solving problems.",
      "We decided to flip the script. Instead of working for insurance companies, we work exclusively for you - our clients. We use technology to compare dozens of options quickly, and we provide honest, transparent advice that puts your financial wellbeing first."
    ],
    mission: "Our mission is simple: Save your money, keep your freedom.",
    statistics: [
      {
        value: "38+",
        label: "Years Combined Experience",
        sublabel: "Serving Texas communities"
      },
      {
        value: "5,000+",
        label: "Clients Protected",
        sublabel: "Individuals and families"
      },
      {
        value: "99%",
        label: "Client Satisfaction",
        sublabel: "Based on reviews"
      },
      {
        value: "24/7",
        label: "Support Available",
        sublabel: "When you need us most"
      }
    ]
  },

  missionValues: {
    title: "Our Mission & Values",
    description: "Everything we do is guided by these core principles that put you first.",
    values: [
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
  },

  testimonials: {
    title: "What Our Clients Say",
    description: "Real stories from real people who've saved money and gained peace of mind.",
    items: [
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
  },

  contactSection: {
    title: "Get in Touch",
    description: "Ready to save money on insurance? We're here to help in whatever way works best for you.",
    methods: [
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
  }
}
