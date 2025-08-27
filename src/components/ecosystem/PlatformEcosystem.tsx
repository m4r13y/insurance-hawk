import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AnimatedButton from "@/components/animated-button"
import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"

interface EcosystemPlatform {
  title: string
  description: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  features: string[]
  badge: string
}

interface PlatformEcosystemProps {
  title: string
  description: string
  platforms: EcosystemPlatform[]
}

export default function PlatformEcosystem({ title, description, platforms }: PlatformEcosystemProps) {
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
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {platforms.map((platform, index) => {
          const IconComponent = platform.icon
          return (
            <motion.div key={index} variants={staggerItem}>
              <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full group">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={`p-3 rounded-lg bg-gradient-to-r ${platform.color}`}
                    >
                      <IconComponent className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <Badge variant="secondary">
                      {platform.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {platform.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>
                    {platform.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-foreground">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {platform.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href={platform.url} target="_blank" rel="noopener noreferrer">
                    <AnimatedButton variant="outline" className="w-full">
                      Visit Platform
                      <ExternalLinkIcon className="ml-2 h-4 w-4" />
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
