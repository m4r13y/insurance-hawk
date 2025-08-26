import { motion } from "framer-motion"
import Link from "next/link"
import AnimatedButton from "@/components/animated-button"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { staggerItem } from "@/components/motion-wrapper"

interface CTAButton {
  text: string
  href: string
  variant?: "primary" | "outline" | "secondary"
  icon?: boolean
}

interface CTASectionProps {
  title: string
  description: string
  buttons: CTAButton[]
}

export default function CTASection({ title, description, buttons }: CTASectionProps) {
  return (
    <motion.div 
      variants={staggerItem}
      className="bg-card border border-border rounded-2xl p-8 text-center shadow-md"
    >
      <motion.h2 
        variants={staggerItem}
        className="text-3xl font-bold text-foreground mb-4"
      >
        {title}
      </motion.h2>
      <motion.p 
        variants={staggerItem}
        className="text-muted-foreground mb-6 max-w-2xl mx-auto"
      >
        {description}
      </motion.p>
      <motion.div 
        variants={staggerItem}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        {buttons.map((button, index) => (
          <Link key={index} href={button.href}>
            <AnimatedButton size="lg" variant={button.variant || "primary"}>
              {button.text}
              {button.icon && <ArrowRightIcon className="ml-2 h-4 w-4" />}
            </AnimatedButton>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}
