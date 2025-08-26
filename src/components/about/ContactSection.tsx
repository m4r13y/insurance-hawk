import { motion } from "framer-motion"
import AnimatedButton from "@/components/animated-button"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"

interface ContactMethod {
  icon: React.ElementType
  title: string
  description: string
  action: string
  href: string
}

interface ContactSectionProps {
  title: string
  description: string
  contactMethods: ContactMethod[]
}

export default function ContactSection({ title, description, contactMethods }: ContactSectionProps) {
  return (
    <motion.div 
      variants={staggerItem}
      className="bg-card border border-border rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {contactMethods.map((method, index) => {
          const IconComponent = method.icon
          return (
            <motion.div 
              key={index} 
              variants={staggerItem}
              className="text-center space-y-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors"
              >
                <IconComponent className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-foreground">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                <AnimatedButton variant="outline" size="sm" className="w-full">
                  {method.action}
                </AnimatedButton>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
