import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { staggerContainer, staggerItem } from "@/components/motion-wrapper"

interface MissionValue {
  icon: React.ElementType
  title: string
  description: string
  color: string
}

interface MissionValuesProps {
  title: string
  description: string
  values: MissionValue[]
}

export default function MissionValues({ title, description, values }: MissionValuesProps) {
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
        {values.map((value, index) => {
          const IconComponent = value.icon
          return (
            <motion.div key={index} variants={staggerItem}>
              <Card className="text-center border border-border shadow-md hover:shadow-lg transition-all duration-300 h-full group">
                <CardHeader className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`mx-auto w-16 h-16 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center`}
                  >
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </motion.div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
