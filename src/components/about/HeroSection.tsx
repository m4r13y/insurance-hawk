import { motion } from "framer-motion"
import { staggerItem } from "@/components/motion-wrapper"

interface HeroSectionProps {
  title: string
  description: string
}

export default function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <motion.div variants={staggerItem} className="text-center space-y-6">
      <motion.h1 
        variants={staggerItem}
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        {title}
      </motion.h1>
      <motion.p 
        variants={staggerItem}
        className="text-xl text-muted-foreground max-w-3xl mx-auto"
      >
        {description}
      </motion.p>
    </motion.div>
  )
}
