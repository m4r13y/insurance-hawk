"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Image from "next/image"
import { ArrowRight, Users, Award, Phone, Mail, MapPin, Star, Shield, Heart, Facebook, Calendar, CheckCircle } from "lucide-react"
import AnimatedButton from "./animated-button"

const teamMembers = [
  {
    id: 1,
    name: "Jonathan Hawkins",
    title: "Owner | CFP®, RICP®, CLTC®, CLU®",
    specialties: ["Financial Planning", "Estate Planning", "Life Insurance", "Long-Term Care", "Retirement Income"],
    licenseNumber: "TX-9419848",
    licensedStates: ["TX", "NM"],
    yearsExperience: 14,
    education: "University of Texas",
    certifications: ["CFP®", "RICP®", "CLTC®", "CLU®"],
    bio: "Jonathan is a dedicated financial professional with over 14 years of experience helping families and individuals secure their financial future. As a Certified Financial Planner (CFP®) and owner of Hawkins Insurance Group, he specializes in comprehensive financial planning, estate planning, and insurance solutions. His extensive certifications and commitment to excellence ensure that every client receives personalized, expert guidance tailored to their unique needs and goals.",
    achievements: [
      "National Recognition as Top Producer",
      "CFP® Certified Financial Planner",
      "RICP® Retirement Income Professional", 
      "CLTC® Long-Term Care Specialist",
      "CLU® Chartered Life Underwriter",
      "Thousands of Americans Served",
      "Estate Planning Services Provider"
    ],
    image: "/jonathan-hawkins.jpg",
    phone: "(817) 800-4253",
    email: "jhawk@hawkinsig.com",
    facebook: "",
    languages: ["English"],
    servingAreas: ["Texas"]
  },
  {
    id: 2,
    name: "Kasey Weadon",
    title: "Group Advisor",
    specialties: ["Group Health Insurance", "Employee Benefits", "COBRA Administration"],
    licenseNumber: "TX-3456789",
    licensedStates: ["TX"],
    yearsExperience: 12,
    education: "Master's in Human Resources, University of Texas",
    certifications: ["CEBS", "GBA", "Texas Licensed Agent"],
    bio: "Kasey brings over 10 years of expertise in employee benefits and group insurance. He works closely with businesses to design comprehensive benefit packages that attract and retain top talent while managing costs effectively.",
    achievements: [
      "Certified Employee Benefit Specialist",
      "500+ Businesses Served",
      "Employee Benefits Excellence Award",
      "Client Retention Rate: 98%"
    ],
    image: "/Kasey-Weadon.jpg",
    phone: "(972) 978-5037",
    email: "kasey@hawkinsig.com",
    facebook: "",
    languages: ["English", "Spanish"],
    servingAreas: ["Dallas-Fort Worth", "Houston", "East Texas"]
  },
  {
    id: 3,
    name: "Cal Marley",
    title: "Senior Benefits Specialist",
    specialties: ["Medicare", "Supplemental Insurance"],
    licenseNumber: "TX-9419848",
    licensedStates: ["TX"],
    yearsExperience: 2,
    education: "Texas Christian University",
    certifications: ["General Lines Insurance"],
    bio: "Cal is a rising star in the insurance industry, bringing fresh perspectives and dedication to helping clients navigate their insurance needs with a focus on Medicare and supplemental coverage options.",
    achievements: [
      "Licensed Insurance Professional",
      "Medicare Specialist",
      "Client-Focused Approach",
      "Rising Star in Benefits"
    ],
    image: "/cal-marley.png",
    phone: "(325) 225-5742",
    email: "cal@hawkinsig.com",
    facebook: "",
    languages: ["English"],
    servingAreas: ["Texas"]
  },
]

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<number | null>(null)
  const [expandedBios, setExpandedBios] = useState<Set<number>>(new Set())

  const toggleBio = (memberId: number) => {
    const newExpandedBios = new Set(expandedBios)
    if (newExpandedBios.has(memberId)) {
      newExpandedBios.delete(memberId)
    } else {
      newExpandedBios.add(memberId)
    }
    setExpandedBios(newExpandedBios)
  }

  return (
    <section className="py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Team</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Licensed insurance professionals dedicated to protecting what matters most to you and your family
          </p>
        </motion.div>

        {/* Team Members Grid */}
        <div className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setSelectedMember(member.id)}
                onHoverEnd={() => setSelectedMember(null)}
                className="bg-card/50 border border-border/50 overflow-visible backdrop-blur-sm hover:border-border/80 transition-all duration-300 group"
                style={{
                  boxShadow: selectedMember === member.id ? "0 20px 40px rgba(0, 0, 0, 0.1) dark:rgba(71, 85, 105, 0.1)" : "none",
                  borderRadius: "12px 72px 12px 12px",
                }}
              >
                {/* Profile Header with Image in Corner */}
                <div className="relative p-6 rounded-e-full rounded-s-xl bg-transparent">
                  {/* Circular Profile Image - Top Right */}
                  <div className="absolute -top-2 -right-2 z-20">
                    <Image 
                      src={member.image} 
                      alt={member.name}
                      width={192}
                      height={192}
                      className="w-48 h-48 rounded-full object-cover border-4 border-border shadow-xl"
                      style={{ 
                        objectPosition: member.id === 1 ? 'center 30%' : 
                                      member.id === 2 ? 'center 25%' : 
                                      member.id === 3 ? 'center 35%' : 
                                      'center 30%'
                      }}
                      quality={90}
                      priority={member.id === 1}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                      }}
                    />
                    {/* Fallback icon (hidden by default) */}
                    <div className="fallback-icon hidden w-36 h-36 rounded-full bg-gradient-to-br from-muted/20 to-muted/40 border-4 border-border shadow-xl">
                      <div className="flex items-center justify-center w-full h-full">
                        <Users className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    </div>
                  </div>

                  {/* Basic Info - Left Aligned */}
                  <div className="pr-40">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-foreground text-sm mb-2">{member.title}</p>
                    <p className="text-muted-foreground text-xs mb-3">License: {member.licenseNumber}</p>
                    <p className="text-muted-foreground text-xs">{member.yearsExperience} Years Experience</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Specialties */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, i) => (
                        <span key={i} className="bg-muted/50 border border-border/50 rounded-full px-3 py-1 text-xs text-foreground">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <div className="relative">
                      <p className={`text-muted-foreground text-sm leading-relaxed transition-all duration-300 ${
                        expandedBios.has(member.id) ? '' : 'line-clamp-3'
                      }`}>
                        {member.bio}
                      </p>
                      
                      {/* Check if bio is long enough to need expansion */}
                      {member.bio && member.bio.length > 200 && (
                        <button
                          onClick={() => toggleBio(member.id)}
                          className="mt-2 text-primary hover:text-primary/80 text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                        >
                          {expandedBios.has(member.id) ? (
                            <>
                              Read Less
                              <motion.svg
                                initial={false}
                                animate={{ rotate: expandedBios.has(member.id) ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </>
                          ) : (
                            <>
                              Read More
                              <motion.svg
                                initial={false}
                                animate={{ rotate: expandedBios.has(member.id) ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Key Achievements and Licensed States + Contact & Languages Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Left Column - Key Achievements and Licensed States */}
                    <div>
                      {/* Key Achievements */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Key Achievements</h4>
                        <ul className="space-y-2">
                          {member.achievements.slice(0, 2).map((achievement, i) => (
                            <li key={i} className="text-foreground text-xs flex items-center">
                              <CheckCircle className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Licensed States */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Licensed States</h4>
                        <div className="flex flex-wrap gap-2">
                          {member.licensedStates.map((state, i) => (
                            <span key={i} className="bg-primary/20 border border-primary/30 rounded-full px-3 py-1 text-xs text-primary">
                              {state}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Contact & Languages */}
                    <div className="border-l border-border/50 pl-6">
                      <div className="grid grid-cols-1 gap-4 text-xs mb-4">
                        <div>
                          <p className="text-muted-foreground mb-1">Languages</p>
                          <p className="text-foreground">{member.languages.join(", ")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Serving Areas</p>
                          <p className="text-foreground">{member.servingAreas[0]}+</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                          <Mail className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                          <Facebook className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                        </div>
                        <AnimatedButton 
                          onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs w-full"
                        >
                          <span className="flex items-center justify-center">
                            Contact {member.name.split(' ')[0]}
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </span>
                        </AnimatedButton>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
