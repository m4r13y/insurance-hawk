"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AnimatedButton from "@/components/animated-button"
import GlossyIcon from "@/components/glossy-icon"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"
import {
  ComponentInstanceIcon,
  PersonIcon,
  HeartIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons"

const mainServices = [
  {
    title: "Business Insurance",
    description: "Comprehensive coverage for businesses of all sizes",
    href: "/get-started/business",
    icon: ComponentInstanceIcon,
    features: ["Group Health Plans", "Liability Coverage", "Workers' Compensation", "Business Property"],
    color: "from-navy-600 to-navy-700",
    savings: "Save up to 30%"
  },
  {
    title: "Individual Coverage",
    description: "Personal insurance solutions for you and your family",
    href: "/get-started/individual",
    icon: PersonIcon,
    features: ["Health Insurance", "Life Insurance", "Dental & Vision", "Cancer Coverage"],
    color: "from-gray-600 to-gray-700",
    savings: "Plans from $50/month"
  },
  {
    title: "Medicare Solutions",
    description: "Navigate Medicare with confidence and expert guidance",
    href: "/get-started/individual",
    icon: HeartIcon,
    features: ["Medicare Advantage", "Supplement Plans", "Part D Drug Plans", "Provider Networks"],
    color: "from-blue-800 to-blue-900",
    savings: "Free consultation"
  }
]

export default function MainServicesSection() {
  return (
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
  )
}
