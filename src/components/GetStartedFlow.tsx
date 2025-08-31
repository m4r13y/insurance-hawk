"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRightIcon as ArrowRight, ArrowLeftIcon as ArrowLeft, CheckIcon as Check, PersonIcon as User, DividerVerticalIcon as Users, ArchiveIcon as Building, PersonIcon as UserCheck, HeartIcon as Heart, CheckCircledIcon as Shield, MobileIcon as Phone, TokensIcon as DollarSign, CalendarIcon as Calendar, GlobeIcon as MapPin } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const clientTypes = [
  {
    id: "individual",
    name: "Individual",
    icon: <User className="w-8 h-8" />,
    description: "Personal insurance coverage for myself",
  },
  {
    id: "family",
    name: "Family", 
    icon: <Users className="w-8 h-8" />,
    description: "Coverage for my family members",
  },
  {
    id: "business",
    name: "Business",
    icon: <Building className="w-8 h-8" />,
    description: "Group coverage for my employees",
  },
  {
    id: "agent",
    name: "Agent",
    icon: <UserCheck className="w-8 h-8" />,
    description: "I'm an insurance agent",
  },
]

const ageRanges = [
  { id: "under-26", name: "Under 26", description: "Young adults and recent graduates" },
  { id: "26-35", name: "26-35", description: "Young professionals" },
  { id: "36-50", name: "36-50", description: "Mid-career professionals" },
  { id: "51-64", name: "51-64", description: "Pre-Medicare age" },
  { id: "65+", name: "65+", description: "Medicare eligible" },
]

const familySizes = [
  { id: "2", name: "2 People", description: "Couple" },
  { id: "3", name: "3 People", description: "Small family" },
  { id: "4", name: "4 People", description: "Growing family" },
  { id: "5+", name: "5+ People", description: "Large family" },
]

const employeeCounts = [
  { id: "2-10", name: "2-10 Employees", description: "Small business" },
  { id: "11-50", name: "11-50 Employees", description: "Medium business" },
  { id: "51-100", name: "51-100 Employees", description: "Large business" },
  { id: "100+", name: "100+ Employees", description: "Enterprise" },
]

const agentTypes = [
  { id: "new-agent", name: "New Agent", description: "Just starting my insurance career" },
  { id: "experienced", name: "Experienced Agent", description: "Looking for new opportunities" },
  { id: "independent", name: "Independent Agent", description: "Seeking carrier partnerships" },
  { id: "captive", name: "Captive Agent", description: "Looking to expand product lines" },
]

const insuranceTypes = [
  { id: "health", name: "Health Insurance", description: "Individual and family plans", icon: <Heart className="w-6 h-6" /> },
  { id: "medicare", name: "Medicare Plans", description: "Supplement, Advantage, Part D", icon: <Shield className="w-6 h-6" /> },
  { id: "life", name: "Life Insurance", description: "Term, whole, universal life", icon: <User className="w-6 h-6" /> },
  { id: "disability", name: "Disability Insurance", description: "Short-term and long-term", icon: <Shield className="w-6 h-6" /> },
  { id: "supplemental", name: "Supplemental Plans", description: "Cancer, accident, hospital indemnity", icon: <Phone className="w-6 h-6" /> },
  { id: "group", name: "Group Benefits", description: "Employee health and benefits", icon: <Building className="w-6 h-6" /> },
]

const urgencyLevels = [
  { id: "immediate", name: "Immediate", description: "Need coverage within 30 days" },
  { id: "1-3-months", name: "1-3 Months", description: "Planning ahead for upcoming needs" },
  { id: "3-6-months", name: "3-6 Months", description: "Evaluating options for future" },
  { id: "research", name: "Just Researching", description: "Gathering information for now" },
]

const agentInterests = [
  { id: "lead-generation", name: "Lead Generation", description: "Access to qualified insurance prospects" },
  { id: "training-support", name: "Training & Support", description: "Professional development and mentorship" },
  { id: "technology-tools", name: "Technology Tools", description: "CRM, quoting, and sales platforms" },
  { id: "agent-client-portal", name: "Agent & Client Portal", description: "Full platform access for both agents and clients" },
  { id: "referral-partnerships", name: "Referral Partnerships", description: "Partner with us for referral opportunities" },
]

export default function GetStartedFlow({ initialClientType }: { initialClientType?: string }) {
  const [currentStep, setCurrentStep] = useState(initialClientType ? 0 : 0)
  const [formData, setFormData] = useState({
    clientType: initialClientType || "",
    age: "",
    familySize: "",
    employeeCount: "",
    agentType: "",
    insuranceTypes: [] as string[],
    urgency: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    zipCode: "",
  })

  // Dynamic steps based on client type
  const getSteps = () => {
    const baseSteps = initialClientType ? [] : ["Client Type"]
    
    switch (formData.clientType || initialClientType) {
      case "individual":
        return [...baseSteps, "Age Range", "Insurance Needs", "Timeline", "Contact Information", "Complete"]
      case "family":
        return [...baseSteps, "Family Size", "Insurance Needs", "Timeline", "Contact Information", "Complete"]
      case "business":
        return [...baseSteps, "Company Size", "Group Benefits", "Timeline", "Contact Information", "Complete"]
      case "agent":
        return [...baseSteps, "Partnership Interest", "Experience Level", "Territory", "Contact Information", "Complete"]
      default:
        return [...baseSteps, "Details", "Needs", "Timeline", "Contact Information", "Complete"]
    }
  }

  const steps = getSteps()

  // Filter insurance types based on client type and demographics
  const getAvailableInsuranceTypes = () => {
    const clientType = formData.clientType || initialClientType
    
    // For individuals, filter based on age
    if (clientType === 'individual') {
      // Medicare plans only for 51-64 (pre-Medicare) and 65+ age groups
      if (formData.age === 'under-26' || formData.age === '26-35' || formData.age === '36-50') {
        return insuranceTypes.filter(type => type.id !== 'medicare')
      }
    }
    
    // For families, show Medicare as they might have older members
    if (clientType === 'family') {
      return insuranceTypes
    }
    
    // For business, remove Medicare plans (group benefits don't include Medicare)
    if (clientType === 'business') {
      return insuranceTypes.filter(type => type.id !== 'medicare')
    }
    
    // For agents, show all types (they need to understand all products)
    return insuranceTypes
  }

  const availableInsuranceTypes = getAvailableInsuranceTypes()

  const nextStep = async () => {
    // Check if this is the final step (contact form completion)
    const finalStep = initialClientType ? 3 : 4;
    
    if (currentStep === finalStep) {
      // Submit form data
      try {
        console.log('Submitting form data:', formData);
        // Here you would integrate with your backend/Firebase
        
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleInsuranceType = (typeId: string) => {
    setFormData((prev) => ({
      ...prev,
      insuranceTypes: prev.insuranceTypes.includes(typeId)
        ? prev.insuranceTypes.filter((id) => id !== typeId)
        : [...prev.insuranceTypes, typeId],
    }))
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  return (
    <section className="min-h-screen flex items-center justify-center py-32">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">Get Started</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-3xl p-8 backdrop-blur-sm min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* Step 0: Client Type (only for non-initialClientType flows) */}
            {currentStep === 0 && !initialClientType && (
              <motion.div
                key="client-type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">Who are you looking for coverage for?</h2>
                <p className="text-muted-foreground mb-8">This helps us customize our insurance recommendations for your specific needs.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {clientTypes.map((client) => (
                    <motion.button
                      key={client.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData((prev) => ({ ...prev, clientType: client.id }))}
                      className={`p-6 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                        formData.clientType === client.id
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center space-x-4 mb-3">
                        <div
                          className={`p-3 rounded-lg ${
                            formData.clientType === client.id ? "bg-primary/30" : "bg-muted"
                          }`}
                        >
                          {client.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{client.name}</div>
                          <div className="text-sm opacity-70">{client.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Demographics Step: Age/Family Size/Employee Count/Agent Type */}
            {((currentStep === 1 && !initialClientType) || (currentStep === 0 && initialClientType)) && (
              <motion.div
                key="age-demographic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {(formData.clientType || initialClientType) === 'individual' && "What's your age range?"}
                  {(formData.clientType || initialClientType) === 'family' && "How many family members need coverage?"}
                  {(formData.clientType || initialClientType) === 'business' && "How many employees need coverage?"}
                  {(formData.clientType || initialClientType) === 'agent' && "What type of agent relationship are you seeking?"}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {(formData.clientType || initialClientType) === 'individual' 
                    ? "This helps us determine what plans you're eligible for."
                    : (formData.clientType || initialClientType) === 'family'
                    ? "This helps us determine the right coverage options for your family."
                    : (formData.clientType || initialClientType) === 'business'
                    ? "This helps us recommend the right group benefit options."
                    : "This helps us understand how we can best work together."
                  }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {((formData.clientType || initialClientType) === 'individual' ? ageRanges :
                    (formData.clientType || initialClientType) === 'family' ? familySizes :
                    (formData.clientType || initialClientType) === 'business' ? employeeCounts :
                    agentTypes).map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData((prev) => ({ 
                        ...prev, 
                        age: (formData.clientType || initialClientType) === 'individual' ? option.id : prev.age,
                        familySize: (formData.clientType || initialClientType) === 'family' ? option.id : prev.familySize,
                        employeeCount: (formData.clientType || initialClientType) === 'business' ? option.id : prev.employeeCount,
                        agentType: (formData.clientType || initialClientType) === 'agent' ? option.id : prev.agentType
                      }))}
                      className={`p-6 rounded-xl border transition-all duration-200 text-center ${
                        ((formData.clientType || initialClientType) === 'individual' && formData.age === option.id) ||
                        ((formData.clientType || initialClientType) === 'family' && formData.familySize === option.id) ||
                        ((formData.clientType || initialClientType) === 'business' && formData.employeeCount === option.id) ||
                        ((formData.clientType || initialClientType) === 'agent' && formData.agentType === option.id)
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="text-xl font-bold mb-2">{option.name}</div>
                      <div className="text-sm opacity-70">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Insurance Types Step */}
            {((currentStep === 2 && !initialClientType) || (currentStep === 1 && initialClientType)) && (
              <motion.div
                key="insurance-types"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {(formData.clientType || initialClientType) === 'agent' 
                    ? "What types of insurance are you licensed to sell?"
                    : "What type of insurance are you interested in?"
                  }
                </h2>
                <p className="text-muted-foreground mb-8">
                  {(formData.clientType || initialClientType) === 'agent'
                    ? "Select all license types you currently hold. This helps us match you with the right opportunities."
                    : "Select all that apply. We'll create a custom quote around your insurance needs."
                  }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {availableInsuranceTypes.map((insurance) => (
                    <motion.button
                      key={insurance.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleInsuranceType(insurance.id)}
                      className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                        formData.insuranceTypes.includes(insurance.id)
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-lg">{insurance.name}</div>
                        {formData.insuranceTypes.includes(insurance.id) && <Check className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="text-sm opacity-70">{insurance.description}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timeline/Urgency Step */}
            {((currentStep === 3 && !initialClientType) || (currentStep === 2 && initialClientType)) && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {(formData.clientType || initialClientType) === 'agent'
                    ? "What are you interested in?"
                    : "When do you need coverage to start?"
                  }
                </h2>
                <p className="text-muted-foreground mb-8">
                  {(formData.clientType || initialClientType) === 'agent'
                    ? "Let us know how you'd like to partner with us and what tools you need."
                    : "This helps us prioritize your application and ensure timely coverage."
                  }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {((formData.clientType || initialClientType) === 'agent' ? agentInterests : urgencyLevels).map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData((prev) => ({ ...prev, urgency: option.id }))}
                      className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                        formData.urgency === option.id
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg ${
                            formData.urgency === option.id ? "bg-primary/30" : "bg-muted"
                          }`}
                        >
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{option.name}</div>
                          <div className="text-sm opacity-70">{option.description}</div>
                        </div>
                        {formData.urgency === option.id && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Contact Information Step */}
            {((currentStep === 4 && !initialClientType) || (currentStep === 3 && initialClientType)) && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">Let's get you a quote</h2>
                <p className="text-muted-foreground mb-8">
                  We'll use this information to prepare your personalized insurance quote and get back to you within 24 hours.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                      placeholder="(123) 456-7890"
                      maxLength={14}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                      placeholder="12345"
                      required
                    />
                  </div>
                  {(formData.clientType === 'business' || formData.clientType === 'agent') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground/90 mb-2">
                        {formData.clientType === 'business' ? 'Company Name' : 'Agency Name'}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                        className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                        placeholder={formData.clientType === 'business' ? 'Your business name' : 'Your agency name'}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Completion Step */}
            {((currentStep === 5 && !initialClientType) || (currentStep === 4 && initialClientType)) && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 text-center"
              >
                <div className="w-20 h-20 bg-card/100/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-success" />
                </div>
                
                {/* Dynamic content based on client type */}
                {(formData.clientType || initialClientType) === 'individual' && (
                  <>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Your personal insurance quote request is complete!</h2>
                    <p className="text-xl text-foreground/90 mb-6">
                      Thank you for choosing Insurance Hawk. We'll prepare personalized insurance options tailored to your age and needs.
                    </p>
                    <div className="bg-card rounded-2xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-foreground mb-4">What happens next?</h3>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
                          <span className="text-foreground/90">We'll review your age range and insurance preferences</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
                          <span className="text-foreground/90">Our licensed agents will call you within 24 hours with personalized quotes</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
                          <span className="text-foreground/90">We'll help you compare options and enroll in the best plan for you</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(formData.clientType || initialClientType) === 'family' && (
                  <>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Your family insurance quote request is complete!</h2>
                    <p className="text-xl text-foreground/90 mb-6">
                      Thank you for choosing Insurance Hawk. We'll prepare comprehensive family coverage options that protect everyone you love.
                    </p>
                    <div className="bg-card rounded-2xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-foreground mb-4">What happens next?</h3>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
                          <span className="text-foreground/90">We'll review your family size and coverage needs</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
                          <span className="text-foreground/90">Our family insurance specialists will contact you within 24 hours</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
                          <span className="text-foreground/90">We'll help you find affordable family coverage that fits your budget</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(formData.clientType || initialClientType) === 'business' && (
                  <>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Your group benefits quote request is complete!</h2>
                    <p className="text-xl text-foreground/90 mb-6">
                      Thank you for choosing Insurance Hawk. We'll prepare comprehensive employee benefit packages tailored to your business needs.
                    </p>
                    <div className="bg-card rounded-2xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-foreground mb-4">What happens next?</h3>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
                          <span className="text-foreground/90">We'll analyze your employee count and benefit requirements</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
                          <span className="text-foreground/90">Our group benefits specialists will schedule a consultation within 24 hours</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
                          <span className="text-foreground/90">We'll present competitive group plans and assist with enrollment</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(formData.clientType || initialClientType) === 'agent' && (
                  <>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Your agent partnership request is complete!</h2>
                    <p className="text-xl text-foreground/90 mb-6">
                      Thank you for your interest in partnering with Insurance Hawk. We're excited to explore how we can work together.
                    </p>
                    <div className="bg-card rounded-2xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-foreground mb-4">What happens next?</h3>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
                          <span className="text-foreground/90">We'll review your licensing and partnership interests</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
                          <span className="text-foreground/90">Our agent development team will reach out within 24 hours</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
                          <span className="text-foreground/90">We'll discuss partnership opportunities and provide access to resources</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  onClick={() => (window.location.href = "/")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Return to Home
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < (initialClientType ? 4 : 5) && (
            <div className="flex justify-between items-center mt-8">
              <div>
                {currentStep > 0 && (
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="bg-transparent border-border text-muted-foreground hover:bg-transparent/80"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div>
                {currentStep < (initialClientType ? 4 : 5) && (
                  <Button
                    onClick={nextStep}
                    disabled={
                      // Step 0: Client Type (only for non-initial flows) or Details (for initial flows)
                      (currentStep === 0 && !initialClientType && !formData.clientType) ||
                      (currentStep === 0 && initialClientType && (
                        (initialClientType === 'individual' && !formData.age) ||
                        (initialClientType === 'family' && !formData.familySize) ||
                        (initialClientType === 'business' && !formData.employeeCount) ||
                        (initialClientType === 'agent' && !formData.agentType)
                      )) ||
                      // Step 1: Details (for non-initial) or Insurance Needs (for initial)
                      (currentStep === 1 && !initialClientType && (
                        (formData.clientType === 'individual' && !formData.age) ||
                        (formData.clientType === 'family' && !formData.familySize) ||
                        (formData.clientType === 'business' && !formData.employeeCount) ||
                        (formData.clientType === 'agent' && !formData.agentType)
                      )) ||
                      (currentStep === 1 && initialClientType && formData.insuranceTypes.length === 0) ||
                      // Step 2: Insurance Needs (for non-initial) or Timeline (for initial)
                      (currentStep === 2 && !initialClientType && formData.insuranceTypes.length === 0) ||
                      (currentStep === 2 && initialClientType && !formData.urgency) ||
                      // Step 3: Timeline (for non-initial) or Contact (for initial)
                      (currentStep === 3 && !initialClientType && !formData.urgency) ||
                      // Contact step validation
                      (currentStep === (initialClientType ? 3 : 4) && (!formData.name || !formData.email || !formData.phone || !formData.zipCode))
                    }
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {currentStep === (initialClientType ? 3 : 4) ? (
                      <>
                        Complete <Check className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
