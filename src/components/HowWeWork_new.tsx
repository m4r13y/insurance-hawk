"use client"

import { motion } from "framer-motion"
import { ActivityLogIcon, ExclamationTriangleIcon, PersonIcon } from "@radix-ui/react-icons"

const steps = [
  {
    number: "01",
    title: "Medicare Plans",
    description: "Comprehensive Medicare coverage including supplements, advantage plans, and prescription drug coverage.",
    icon: <ActivityLogIcon className="w-8 h-8" />,
    gradient: "from-blue-500/20 to-blue-600/10",
    features: [
      "Parts A, B, C & D Coverage",
      "Supplement Plans Available", 
      "Annual Enrollment Help"
    ]
  },
  {
    number: "02",
    title: "Group Insurance",
    description: "Competitive group benefits for your employees with access to major national carriers.",
    icon: <ExclamationTriangleIcon className="w-8 h-8" />,
    gradient: "from-green-500/20 to-green-600/10",
    features: [
      "Employee Benefits Package",
      "Competitive Group Rates",
      "Full Coverage Options"
    ]
  },
  {
    number: "03",
    title: "Family Health",
    description: "Guaranteed renewable health plans that give families more control over healthcare costs.",
    icon: <PersonIcon className="w-8 h-8" />,
    gradient: "from-purple-500/20 to-purple-600/10",
    features: [
      "Low Deductible Options",
      "Family-Friendly Plans",
      "Preventive Care Included"
    ]
  },
]

export default function HowWeWork() {
  return (
    <section className="py-24 bg-transparent relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Insurance Solutions for Every Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From Medicare coverage to group benefits and family health plans, we provide comprehensive insurance solutions tailored to your specific needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              {/* Service Card */}
              <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg h-full">
                {/* Service Icon Area */}
                <div className={`aspect-video bg-gradient-to-br ${step.gradient} rounded-2xl mb-6 overflow-hidden relative border border-border/50`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                        {step.icon}
                      </div>
                      <div className="space-y-2">
                        {step.features.map((feature, idx) => (
                          <div key={idx} className="text-sm text-foreground bg-card/60 px-3 py-2 rounded-lg border border-border/50 backdrop-blur-sm">
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Content */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-muted-foreground">{step.number}</div>
                    <div className="text-primary">{step.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
