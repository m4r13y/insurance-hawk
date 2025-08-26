import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon, QuoteIcon } from "@radix-ui/react-icons"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"

interface Testimonial {
  name: string
  location: string
  rating: number
  text: string
  insurance: string
  avatar: string
}

interface TestimonialsProps {
  title: string
  description: string
  testimonials: Testimonial[]
}

export default function Testimonials({ title, description, testimonials }: TestimonialsProps) {
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
        {testimonials.map((testimonial, index) => (
          <motion.div key={index} variants={staggerItem}>
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {testimonial.insurance}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <QuoteIcon className="absolute -top-2 -left-2 h-6 w-6 text-primary/20" />
                  <p className="text-muted-foreground italic pl-4">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
