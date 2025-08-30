"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, Check, User, Users, Building, UserCheck, Heart, Shield, Phone, DollarSign, Calendar, MapPin, Stethoscope, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

// Medicare status options
const medicareStatus = [
  {
    id: "new",
    name: "New to Medicare",
    icon: <Shield className="w-8 h-8" />,
    description: "I'm approaching 65 or new to Medicare",
  },
  {
    id: "enrolled", 
    name: "Currently Enrolled",
    icon: <UserCheck className="w-8 h-8" />,
    description: "I already have Medicare coverage",
  },
  {
    id: "browsing",
    name: "Just Browsing", 
    icon: <User className="w-8 h-8" />,
    description: "I'm researching options for myself or others",
  },
]

// Plan categories for browsing/selection
const planCategories = [
  { id: "medigap", name: "Medicare Supplement (Medigap)", description: "Fill gaps in Original Medicare" },
  { id: "advantage", name: "Medicare Advantage", description: "All-in-one alternative to Original Medicare" },
  { id: "partd", name: "Part D (Prescription Drugs)", description: "Prescription drug coverage" },
  { id: "dental", name: "Dental Insurance", description: "Dental coverage options" },
  { id: "vision", name: "Vision Insurance", description: "Vision care coverage" },
  { id: "life", name: "Life Insurance", description: "Life insurance protection" },
]

// Medigap plan types for selection
const medigapPlanTypes = [
  {
    id: "F",
    name: "Plan F",
    description: "Most comprehensive coverage",
    features: ["Covers all Medicare gaps", "No deductibles", "Foreign travel emergency"],
    popular: false
  },
  {
    id: "G", 
    name: "Plan G",
    description: "Popular comprehensive choice",
    features: ["Covers most Medicare gaps", "Part B deductible only", "Lower premiums than Plan F"],
    popular: true
  },
  {
    id: "N",
    name: "Plan N", 
    description: "Budget-friendly option",
    features: ["Good coverage", "Small copays", "Lower premiums"],
    popular: false
  }
]

// New to Medicare options
const newMedicareOptions = [
  {
    id: "know-what-want",
    name: "I know what I want",
    description: "I've researched and know which plan type I need",
  },
  {
    id: "unsure",
    name: "I'm not sure",
    description: "I need help understanding my options",
  },
]

// Current Medicare options
const currentMedicareOptions = [
  {
    id: "advantage",
    name: "Medicare Advantage",
    description: "I have a Medicare Advantage plan",
  },
  {
    id: "supplement",
    name: "Medicare Supplement",
    description: "I have Original Medicare + Supplement",
  },
  {
    id: "neither",
    name: "Neither",
    description: "I only have Original Medicare",
  },
]

// Supplement holder options
const supplementOptions = [
  {
    id: "new-plan-type",
    name: "Change to a new plan type",
    description: "Switch to Medicare Advantage or add coverage",
  },
  {
    id: "lower-premiums",
    name: "Check for lower premiums", 
    description: "Find a better rate on my current plan type",
  },
  {
    id: "look-around",
    name: "Just looking around",
    description: "Exploring what's available",
  },
]

// Advantage holder options
const advantageOptions = [
  {
    id: "new-advantage",
    name: "Look for new Advantage plans",
    description: "Compare other Medicare Advantage options",
  },
  {
    id: "fill-gaps",
    name: "Fill gaps in current coverage",
    description: "Add dental, vision, or other supplemental coverage",
  },
  {
    id: "change-supplement",
    name: "Change to Medicare Supplement",
    description: "Switch to Original Medicare + Supplement",
  },
]

interface MedicareQuoteFlowProps {
  onComplete: (data: any) => void;
  onCancel?: () => void;
  mode?: 'guided' | 'quick'; // Add mode prop
}

export default function MedicareQuoteFlow({ onComplete, onCancel, mode = 'guided' }: MedicareQuoteFlowProps) {
  const [currentStep, setCurrentStep] = useState(mode === 'quick' ? 0 : 0) // Quick mode will start at plan categories
  const [formData, setFormData] = useState({
    medicareStatus: "",
    planCategories: [] as string[],
    selectedMedigapPlans: [] as string[],
    newMedicareChoice: "",
    currentMedicareType: "",
    supplementAction: "",
    advantageAction: "",
    needsDoctorCheck: false,
    needsMedicationCheck: false,
    doctors: [] as string[],
    medications: [] as string[],
    currentPlan: "",
    age: "",
    gender: "",
    zipCode: "",
    tobaccoUse: null as boolean | null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    effectiveDate: "",
  })

  // Dynamic steps based on choices
  const getSteps = () => {
    // Quick mode: skip Medicare status and go directly to plan selection
    if (mode === 'quick') {
      // For quick mode, if medigap is selected, add plan selection step
      if (formData.planCategories.includes('medigap')) {
        return ["Plan Categories", "Medigap Plans", "Personal Information"];
      }
      return ["Plan Categories", "Personal Information"];
    }
    
    let steps = ["Medicare Status"]
    
    if (formData.medicareStatus === "browsing") {
      steps.push("Plan Categories")
      // Add Medigap plan selection if medigap is selected
      if (formData.planCategories.includes('medigap')) {
        steps.push("Medigap Plans")
      }
      steps.push("Personal Information")
    } else if (formData.medicareStatus === "new") {
      if (formData.newMedicareChoice === "know-what-want") {
        steps.push("Plan Selection")
        // Add Medigap plan selection if medigap is selected
        if (formData.planCategories.includes('medigap')) {
          steps.push("Medigap Plans")
        }
        steps.push("Personal Information")
      } else if (formData.newMedicareChoice === "unsure") {
        steps.push("Personal Information")
      } else {
        steps.push("Experience Level")
        // Add subsequent steps for experience level path
        if (formData.newMedicareChoice === "know-what-want") {
          steps.push("Plan Selection")
          if (formData.planCategories.includes('medigap')) {
            steps.push("Medigap Plans")
          }
          steps.push("Personal Information")
        } else if (formData.newMedicareChoice === "unsure") {
          steps.push("Personal Information")
        }
      }
    } else if (formData.medicareStatus === "enrolled") {
      if (formData.currentMedicareType === "supplement") {
        if (formData.supplementAction === "new-plan-type") {
          steps.push("Plan Selection", "Personal Information")
        } else {
          steps.push("Personal Information")
        }
      } else if (formData.currentMedicareType === "advantage") {
        if (formData.advantageAction === "new-advantage") {
          if (formData.needsDoctorCheck) steps.push("Doctors")
          if (formData.needsMedicationCheck) steps.push("Medications")
          steps.push("Personal Information")
        } else if (formData.advantageAction === "fill-gaps") {
          steps.push("Current Plan", "Personal Information")
        } else {
          steps.push("Personal Information")
        }
      } else {
        steps.push("Personal Information")
      }
    }

    return steps
  }

  // Get estimated total steps for progress calculation
  const getEstimatedTotalSteps = () => {
    // Quick mode is always 2 steps
    if (mode === 'quick') {
      return 2;
    }
    
    if (!formData.medicareStatus) {
      return 3 // Estimated: Status -> Next Step -> Personal Info
    }
    
    // Calculate based on selected path
    if (formData.medicareStatus === "browsing") {
      return 3 // Status -> Plan Categories -> Personal Info
    } else if (formData.medicareStatus === "new") {
      return 3 // Status -> Experience Level -> Personal Info (minimum)
    } else if (formData.medicareStatus === "enrolled") {
      return 3 // Status -> Current Type/Action -> Personal Info (minimum)
    }
    
    // Fallback to actual steps if calculated
    const steps = getSteps()
    return Math.max(steps.length, 2)
  }

  // Check if we're on the actual final step (Personal Information)
  const isOnFinalStep = () => {
    const currentStepName = steps[currentStep]
    return currentStepName === "Personal Information"
  }

  const steps = getSteps()
  const estimatedTotal = getEstimatedTotalSteps()

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete the flow
      onComplete(formData)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      // If on first step, go back to landing page
      if (onCancel) {
        onCancel()
      }
    }
  }

  const togglePlanCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      planCategories: prev.planCategories.includes(categoryId)
        ? prev.planCategories.filter(id => id !== categoryId)
        : [...prev.planCategories, categoryId]
    }))
  }

  const toggleMedigapPlan = (planType: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMedigapPlans: prev.selectedMedigapPlans.includes(planType)
        ? prev.selectedMedigapPlans.filter(type => type !== planType)
        : [...prev.selectedMedigapPlans, planType]
    }))
  }

  const addDoctor = () => {
    setFormData(prev => ({
      ...prev,
      doctors: [...prev.doctors, ""]
    }))
  }

  const updateDoctor = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      doctors: prev.doctors.map((doc, i) => i === index ? value : doc)
    }))
  }

  const removeDoctor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      doctors: prev.doctors.filter((_, i) => i !== index)
    }))
  }

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, ""]
    }))
  }

  const updateMedication = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === index ? value : med)
    }))
  }

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const progress = ((currentStep + 1) / estimatedTotal) * 100

  const canProceed = () => {
    const currentStepName = steps[currentStep]
    
    switch (currentStepName) {
      case "Medicare Status":
        return formData.medicareStatus !== ""
      case "Plan Categories":
        return formData.planCategories.length > 0
      case "Medigap Plans":
        return formData.selectedMedigapPlans.length > 0
      case "Experience Level":
        return formData.newMedicareChoice !== ""
      case "Plan Selection":
        return formData.planCategories.length > 0
      case "Current Medicare Type":
        return formData.currentMedicareType !== ""
      case "Supplement Action":
        return formData.supplementAction !== ""
      case "Advantage Action":
        return formData.advantageAction !== ""
      case "Personal Information":
        return formData.age && formData.gender && formData.zipCode && formData.tobaccoUse !== null
      default:
        return true
    }
  }

  return (
    <section className="min-h-screen flex items-start justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {estimatedTotal}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentStep]}
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
        <div className="bg-card/50 backdrop-blur-sm min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* Step 0: Medicare Status */}
            {steps[currentStep] === "Medicare Status" && (
              <motion.div
                key="medicare-status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">What's your Medicare situation?</h2>
                <p className="text-muted-foreground mb-8">This helps us provide the most relevant options for you.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {medicareStatus.map((status) => (
                    <motion.button
                      key={status.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, medicareStatus: status.id }))}
                      className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                        formData.medicareStatus === status.id
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`p-3 rounded-lg ${
                          formData.medicareStatus === status.id ? "bg-primary/30" : "bg-muted"
                        }`}>
                          {status.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{status.name}</div>
                          <div className="text-sm opacity-70">{status.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Plan Categories Step */}
            {steps[currentStep] === "Plan Categories" && (
              <motion.div
                key="plan-categories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">What type of coverage are you looking for?</h2>
                <p className="text-muted-foreground mb-8">Select all that apply. You can always adjust this later.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {planCategories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => togglePlanCategory(category.id)}
                      className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                        formData.planCategories.includes(category.id)
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{category.name}</div>
                          <div className="text-sm opacity-70">{category.description}</div>
                        </div>
                        {formData.planCategories.includes(category.id) && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Medigap Plans Step */}
            {steps[currentStep] === "Medigap Plans" && (
              <motion.div
                key="medigap-plans"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">Which Medigap plans are you interested in?</h2>
                <p className="text-muted-foreground mb-8">Select the plans you'd like to compare. Each plan offers different benefits and coverage levels.</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {medigapPlanTypes.map((plan) => (
                    <motion.button
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleMedigapPlan(plan.id)}
                      className={`p-4 rounded-xl border transition-all duration-200 text-center ${
                        formData.selectedMedigapPlans.includes(plan.id)
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="font-semibold text-lg mb-2">Plan {plan.id}</div>
                        {formData.selectedMedigapPlans.includes(plan.id) && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Experience Level for New Medicare Users */}
            {steps[currentStep] === "Experience Level" && (
              <motion.div
                key="experience-level"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">How familiar are you with Medicare?</h2>
                <p className="text-muted-foreground mb-8">This helps us provide the right level of guidance.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {newMedicareOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, newMedicareChoice: option.id }))}
                      className={`p-6 rounded-xl border transition-all duration-200 text-center ${
                        formData.newMedicareChoice === option.id
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

            {/* Personal Information Step */}
            {steps[currentStep] === "Personal Information" && (
              <motion.div
                key="personal-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">Almost there!</h2>
                  <p className="text-muted-foreground text-lg">
                    We need some basic information to provide accurate quotes.
                  </p>
                </div>

                <Card className="bg-card backdrop-blur-sm shadow-xl border border-border max-w-2xl mx-auto">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Form Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Age */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">Your Age *</Label>
                          <Input
                            type="number"
                            placeholder="65"
                            min="60"
                            max="100"
                            className="text-lg py-3"
                            value={formData.age}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              age: e.target.value 
                            }))}
                          />
                        </div>

                        {/* ZIP Code */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">ZIP Code *</Label>
                          <Input
                            type="text"
                            placeholder="12345"
                            maxLength={5}
                            className="text-lg py-3"
                            value={formData.zipCode}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              zipCode: e.target.value.replace(/\D/g, '')
                            }))}
                          />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">Gender *</Label>
                          <Select 
                            value={formData.gender} 
                            onValueChange={(value) => setFormData(prev => ({ 
                              ...prev, 
                              gender: value 
                            }))}
                          >
                            <SelectTrigger className="text-lg py-3">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Effective Date */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">When do you need coverage?</Label>
                          <Input
                            type="date"
                            className="text-lg py-3"
                            value={formData.effectiveDate}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              effectiveDate: e.target.value 
                            }))}
                          />
                        </div>
                      </div>

                      {/* Tobacco Use */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Tobacco Use *</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={formData.tobaccoUse === false ? "default" : "outline"}
                            size="default"
                            onClick={() => setFormData(prev => ({ ...prev, tobaccoUse: false }))}
                            className="flex-1"
                          >
                            No
                          </Button>
                          <Button
                            type="button"
                            variant={formData.tobaccoUse === true ? "default" : "outline"}
                            size="default"
                            onClick={() => setFormData(prev => ({ ...prev, tobaccoUse: true }))}
                            className="flex-1"
                          >
                            Yes
                          </Button>
                        </div>
                      </div>

                      {/* Trust Line */}
                      <p className="text-center text-sm text-muted-foreground pt-4">
                        100% Free • No Obligation • Instant Results
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center gap-2 ${
                isOnFinalStep()
                  ? "text-lg font-semibold py-3 px-8" 
                  : ""
              }`}
              size={isOnFinalStep() ? "lg" : "default"}
            >
              {isOnFinalStep() ? (
                // Final step (Personal Information) - show completion button
                <>
                  <Shield className="w-5 h-5" />
                  Show My Plans
                </>
              ) : (
                // All other steps - show continue button
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
