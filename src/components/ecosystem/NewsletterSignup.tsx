import { motion } from "framer-motion"
import AnimatedButton from "@/components/animated-button"
import { staggerItem } from "@/components/motion-wrapper"

interface NewsletterSignupProps {
  title: string
  description: string
  placeholder?: string
  buttonText?: string
}

export default function NewsletterSignup({ 
  title, 
  description, 
  placeholder = "Enter your email",
  buttonText = "Subscribe"
}: NewsletterSignupProps) {
  return (
    <motion.div 
      variants={staggerItem}
      className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-center text-primary-foreground shadow-lg"
    >
      <motion.h2 
        variants={staggerItem}
        className="text-3xl font-bold mb-4"
      >
        {title}
      </motion.h2>
      <motion.p 
        variants={staggerItem}
        className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto"
      >
        {description}
      </motion.p>
      <motion.div 
        variants={staggerItem}
        className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
      >
        <input
          type="email"
          placeholder={placeholder}
          className="flex-1 px-4 py-3 rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <AnimatedButton variant="secondary" className="px-6">
          {buttonText}
        </AnimatedButton>
      </motion.div>
    </motion.div>
  )
}
