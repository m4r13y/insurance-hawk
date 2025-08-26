import { motion } from "framer-motion"
import { staggerItem } from "@/components/motion-wrapper"

interface Statistic {
  value: string
  label: string
  sublabel: string
}

interface OriginStoryProps {
  title: string
  paragraphs: string[]
  mission: string
  statistics: Statistic[]
}

export default function OriginStory({ title, paragraphs, mission, statistics }: OriginStoryProps) {
  return (
    <motion.div 
      variants={staggerItem}
      className="bg-card border border-border rounded-2xl p-8 lg:p-12 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          variants={staggerItem}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          <div className="space-y-4 text-muted-foreground">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={index === 0 ? "text-lg" : ""}>
                {paragraph}
              </p>
            ))}
            <p className="font-medium text-primary">
              {mission}
            </p>
          </div>
        </motion.div>
        <motion.div 
          variants={staggerItem}
          className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 rounded-xl border border-border"
        >
          <div className="grid grid-cols-2 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2" style={{ textShadow: "0 0 20px rgba(71, 85, 105, 0.3)" }}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
