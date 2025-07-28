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
            <div className="max-w-7xl mx-auto space-y-12 p-4 sm:p-6 lg:p-8">
                
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 dark:from-blue-700 dark:via-blue-800 dark:to-purple-900 rounded-xl lg:rounded-2xl p-8 lg:p-12 text-white shadow-xl">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight">
                            The Insurance Hawk
                        </h1>
                        <p className="text-xl lg:text-2xl text-blue-100 font-medium">
                           Save Your Money - Keep Your Freedom
                        </p>
                        <p className="text-blue-100 text-lg leading-relaxed opacity-90 max-w-3xl mx-auto">
                            We help families and businesses find the best insurance coverage at the lowest prices. No sales pressure, no hidden fees - just honest advice that puts your needs first.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
                                Get Free Quote
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
                                Call (555) 123-4567
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Services */}
                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Insurance Solutions for Every Need
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Whether you're protecting your family or your business, we have the expertise and options to help you save money.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {mainServices.map((service, index) => {
                            const IconComponent = service.icon
                            return (
                                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                                    <CardHeader className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color} text-white`}>
                                                <IconComponent className="h-6 w-6" />
                                            </div>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                {service.savings}
                                            </Badge>
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                                {service.title}
                                            </CardTitle>
                                            <CardDescription className="mt-2">
                                                {service.description}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Popular Options:</h4>
                                            <div className="grid grid-cols-2 gap-1">
                                                {service.features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center space-x-2">
                                                        <CheckIcon className="h-3 w-3 text-green-500" />
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <Link href={service.href} className="block">
                                            <Button className="w-full group-hover:bg-blue-600 transition-colors">
                                                Explore Options
                                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-md">
                    <div className="text-center space-y-4 mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Why Choose The Insurance Hawk?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            We're not just another insurance broker. We're your advocate in a complicated industry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {whyChooseUs.map((item, index) => {
                            const IconComponent = item.icon
                            return (
                                <div key={index} className="text-center space-y-3">
                                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                        <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quick Stats & Testimonials */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Stats */}
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-center">Our Track Record</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6 text-center">
                                <div>
                                    <div className="text-3xl font-bold text-blue-600">$2M+</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Saved for Clients</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-600">5,000+</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Families Protected</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-purple-600">20+</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-orange-600">98%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Testimonials */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <ChatBubbleIcon className="h-5 w-5 text-blue-600" />
                                <span>What Clients Say</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {testimonialHighlights.map((testimonial, index) => (
                                <div key={index} className="border-l-4 border-blue-200 pl-4">
                                    <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.text}"</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        - {testimonial.author}, {testimonial.location}
                                    </p>
                                </div>
                            ))}
                            <Link href="/about" className="block">
                                <Button variant="outline" className="w-full">
                                    Read More Reviews
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Access */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/resources" className="block">
                        <Card className="hover:shadow-lg transition-shadow group">
                            <CardHeader className="text-center">
                                <ArchiveIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <CardTitle className="group-hover:text-blue-600 transition-colors">Resources Library</CardTitle>
                                <CardDescription>Articles, guides, and educational content</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/about" className="block">
                        <Card className="hover:shadow-lg transition-shadow group">
                            <CardHeader className="text-center">
                                <HeartIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <CardTitle className="group-hover:text-green-600 transition-colors">About Us</CardTitle>
                                <CardDescription>Our story, mission, and testimonials</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/ecosystem" className="block">
                        <Card className="hover:shadow-lg transition-shadow group">
                            <CardHeader className="text-center">
                                <ComponentInstanceIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                <CardTitle className="group-hover:text-purple-600 transition-colors">Ecosystem</CardTitle>
                                <CardDescription>Connect with us across all platforms</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Save Money on Insurance?</h2>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Get personalized quotes from top-rated carriers in minutes. No obligation, no pressure, no hidden fees.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary">
                            Get Free Quotes Now
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                            Schedule Consultation
                        </Button>
                    </div>
                </div>
            </div>
        </div>    
    );
}
    

    