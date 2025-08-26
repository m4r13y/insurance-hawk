import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedButton from "@/components/animated-button"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"

interface CommunityResource {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  url: string
  color: string
}

interface CommunityResourcesProps {
  title: string
  description: string
  resources: CommunityResource[]
}

export default function CommunityResources({ title, description, resources }: CommunityResourcesProps) {
  return (
    <motion.div variants={staggerItem} className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {resources.map((resource, index) => {
          const IconComponent = resource.icon
          return (
            <motion.div key={index} variants={staggerItem}>
              <Card className="text-center border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full group">
                <CardHeader className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${resource.color}`}
                  >
                    <IconComponent className="h-8 w-8" />
                  </motion.div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {resource.description}
                  </CardDescription>
                  <Link href={resource.url}>
                    <AnimatedButton variant="outline" size="sm" className="w-full">
                      Explore
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </AnimatedButton>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
