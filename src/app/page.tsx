"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    color: "from-blue-500 to-blue-600",
    savings: "Save up to 30%"
  },
  {
    title: "Individual Coverage",
    description: "Personal insurance solutions for you and your family",
    href: "/individual",
    icon: PersonIcon,
    features: ["Health Insurance", "Life Insurance", "Dental & Vision", "Cancer Coverage"],
    color: "from-green-500 to-green-600",
    savings: "Plans from $50/month"
  },
  {
    title: "Medicare Solutions",
    description: "Navigate Medicare with confidence and expert guidance",
    href: "/Medicare",
    icon: HeartIcon,
    features: ["Medicare Advantage", "Supplement Plans", "Part D Drug Plans", "Provider Networks"],
    color: "from-purple-500 to-purple-600",
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
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            {/* Page Container - Microsoft-style structured layout */}
            <div className="max-w-full">
                
                {/* Hero Section - Video Background */}
                <section className="relative overflow-hidden h-screen min-h-[600px] flex items-center justify-center" aria-labelledby="hero-title">
                    {/* Video Background */}
                    <div className="absolute inset-0 w-full h-full">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                            poster="/video-poster.jpg" // Optional: Add a poster image
                        >
                            <source src="https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/0615(2).mp4?alt=media" type="video/mp4" />
                            {/* Fallback for browsers that don't support video */}
                            Your browser does not support the video tag.
                        </video>
                        {/* Dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                    
                    {/* Hero Content */}
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <div className="space-y-4">
                                <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
                                    The Insurance Hawk
                                </h1>
                                <div className="text-xl lg:text-3xl text-white font-medium drop-shadow-md">
                                   Save Your Money - Keep Your Freedom
                                </div>
                            </div>
                            <p className="text-white text-lg lg:text-xl leading-relaxed opacity-90 max-w-3xl mx-auto drop-shadow-md">
                                We help families and businesses find the best insurance coverage at the lowest prices. No sales pressure, no hidden fees - just honest advice that puts your needs first.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                                <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg backdrop-blur-sm">
                                    Get Free Quote
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Button>
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 hover:text-white shadow-lg backdrop-blur-sm">
                                    Call (555) 123-4567
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Main Services Section */}
                    <section className="py-16 lg:py-24" aria-labelledby="services-title">
                        <div className="text-center space-y-6 mb-16">
                            <h2 id="services-title" className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                Insurance Solutions for Every Need
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                Whether you&apos;re protecting your family or your business, we have the expertise and options to help you save money.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                            {mainServices.map((service, index) => {
                                const IconComponent = service.icon
                                return (
                                    <Card key={index} className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg hover:scale-105 bg-white dark:bg-neutral-800">
                                        <CardHeader className="space-y-6 pb-6">
                                            <div className="flex items-start justify-between">
                                                <div className={`p-4 rounded-xl bg-gradient-to-r ${service.color} text-white shadow-lg`}>
                                                    <IconComponent className="h-7 w-7" />
                                                </div>
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 font-medium px-3 py-1">
                                                    {service.savings}
                                                </Badge>
                                            </div>
                                            <div className="space-y-3">
                                                <CardTitle className="text-xl lg:text-2xl group-hover:text-blue-600 transition-colors">
                                                    {service.title}
                                                </CardTitle>
                                                <CardDescription className="text-base leading-relaxed">
                                                    {service.description}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">Popular Options:</h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {service.features.map((feature, idx) => (
                                                        <div key={idx} className="flex items-center space-x-3">
                                                            <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <Link href={service.href} className="block">
                                                <Button className="w-full group-hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg">
                                                    Explore Options
                                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>

                    {/* Why Choose Us Section */}
                    <section className="py-16" aria-labelledby="why-choose-title">
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 lg:p-12 shadow-lg">
                            <div className="text-center space-y-6 mb-12">
                                <h2 id="why-choose-title" className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                    Why Choose The Insurance Hawk?
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                    We&apos;re not just another insurance broker. We&apos;re your advocate in a complicated industry.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {whyChooseUs.map((item, index) => {
                                    const IconComponent = item.icon
                                    return (
                                        <div key={index} className="text-center space-y-4 group">
                                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
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
                            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 shadow-lg">
                                <CardHeader className="pb-6">
                                    <CardTitle className="text-center text-2xl">Our Track Record</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-8 text-center">
                                        <div className="space-y-2">
                                            <div className="text-4xl font-bold text-blue-600">$2M+</div>
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved for Clients</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-4xl font-bold text-green-600">5,000+</div>
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Families Protected</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-4xl font-bold text-purple-600">20+</div>
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Years Experience</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-4xl font-bold text-orange-600">98%</div>
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Testimonials */}
                            <Card className="shadow-lg">
                                <CardHeader className="pb-6">
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <ChatBubbleIcon className="h-6 w-6 text-blue-600" />
                                        <span>What Clients Say</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {testimonialHighlights.map((testimonial, index) => (
                                        <div key={index} className="border-l-4 border-blue-200 pl-6 py-2">
                                            <p className="text-gray-600 dark:text-gray-300 italic text-lg leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                                            <p className="text-sm font-medium text-gray-500 mt-3">
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
                            <h2 id="quick-access" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Explore More
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            <Link href="/resources" className="block group">
                                <Card className="hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full">
                                    <CardHeader className="text-center pb-6">
                                        <ArchiveIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                        <CardTitle className="group-hover:text-blue-600 transition-colors text-xl">Resources Library</CardTitle>
                                        <CardDescription className="text-base">Articles, guides, and educational content</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <Link href="/about" className="block group">
                                <Card className="hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full">
                                    <CardHeader className="text-center pb-6">
                                        <HeartIcon className="h-12 w-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                        <CardTitle className="group-hover:text-green-600 transition-colors text-xl">About Us</CardTitle>
                                        <CardDescription className="text-base">Our story, mission, and testimonials</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <Link href="/ecosystem" className="block group">
                                <Card className="hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full">
                                    <CardHeader className="text-center pb-6">
                                        <ComponentInstanceIcon className="h-12 w-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                        <CardTitle className="group-hover:text-purple-600 transition-colors text-xl">Ecosystem</CardTitle>
                                        <CardDescription className="text-base">Connect with us across all platforms</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="py-16" aria-labelledby="final-cta">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white shadow-xl">
                            <h2 id="final-cta" className="text-3xl lg:text-4xl font-bold mb-6">Ready to Save Money on Insurance?</h2>
                            <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                                Get personalized quotes from top-rated carriers in minutes. No obligation, no pressure, no hidden fees.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" variant="secondary" className="shadow-lg">
                                    Get Free Quotes Now
                                </Button>
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 shadow-lg">
                                    Schedule Consultation
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>    
    );
}
    

    