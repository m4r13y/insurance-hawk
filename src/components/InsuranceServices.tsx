"use client"

import { motion } from "framer-motion"
import { Stethoscope, Users, Building, Smile, HeartHandshake, Plus } from "lucide-react"

const services = [
  {
    title: "Medicare Plans",
    description: "Comprehensive Medicare coverage including supplements, advantage plans, and prescription drug coverage.",
    icon: <Stethoscope className="w-8 h-8" />,
    gradient: "from-slate-500/20 to-slate-600/10",
    features: [
      "Parts A, B, C & D Coverage",
      "Supplement Plans Available", 
      "Annual Enrollment Help"
    ]
  },
  {
    title: "Group Insurance", 
    description: "Competitive group benefits for your employees with access to major national carriers.",
    icon: <Building className="w-8 h-8" />,
    gradient: "from-slate-500/20 to-slate-600/10",
    features: [
      "Employee Benefits Package",
      "Competitive Group Rates",
      "Full Coverage Options"
    ]
  },
  {
    title: "Family Health",
    description: "Guaranteed renewable health plans that give families more control over healthcare costs.",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-slate-500/20 to-slate-600/10",
    features: [
      "Low Deductible Options",
      "Family-Friendly Plans",
      "Preventive Care Included"
    ]
  },
  {
    title: "Dental & Vision",
    description: "Affordable dental and vision coverage to complement your health insurance.",
    icon: <Smile className="w-8 h-8" />,
    gradient: "from-slate-500/20 to-slate-600/10",
    features: [
      "Routine Cleanings Covered",
      "Vision Exams & Frames",
      "No Waiting Periods"
    ]
  },
  {
    title: "Life Insurance",
    description: "Term and permanent life insurance options to protect your family's financial future.",
    icon: <HeartHandshake className="w-8 h-8" />,
    gradient: "from-slate-500/20 to-slate-600/10",
    features: [
      "Term & Whole Life Options",
      "No Medical Exam Available",
      "Accelerated Death Benefits"
    ]
  },
  {
    title: "Additional Coverage",
    description: "Supplement plans including hospital indemnity, cancer insurance, and accident coverage.",
    icon: <Plus className="w-8 h-8" />,
    gradient: "from-slate-500/20 to-slate-600/10",
    features: [
      "Hospital Indemnity Plans",
      "Cancer & Critical Illness",
      "Accident Coverage"
    ]
  },
]

export default function InsuranceServices() {
  return (
    <section className="py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Insurance Solutions for Every Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive coverage options tailored to protect what matters most to you and your family.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`bg-card border border-border rounded-3xl p-8 backdrop-blur-sm hover:border-border/70 transition-all duration-300 group shadow-lg`}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-foreground">{service.icon}</div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                {service.description}
              </p>

              <div className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{feature}</span>
                    <span className="text-green-500">✓</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30 rounded-lg py-3 px-6 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
