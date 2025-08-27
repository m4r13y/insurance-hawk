import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AnimatedButton from "@/components/animated-button"
import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"

interface SocialPlatform {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  url: string
  color: string
  followers: string
  badge: string
}

interface SocialPlatformsProps {
  title: string
  description: string
  platforms: SocialPlatform[]
}

export default function SocialPlatforms({ title, description, platforms }: SocialPlatformsProps) {
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                    <Badge variant="secondary" className="text-xs">
                      {platform.badge}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{platform.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{platform.followers}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {platform.description}
                  </CardDescription>
                  <Link href={platform.url} target="_blank" rel="noopener noreferrer">
                    <AnimatedButton variant="outline" className="w-full">
                      Follow Us
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
