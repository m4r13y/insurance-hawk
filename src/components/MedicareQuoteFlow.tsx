"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, Check, User, Users, Building, UserCheck, Heart, Shield, Phone, DollarSign, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

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
  { id: "advantage", name: "Medicare Advantage", description: "Alternative to Original Medicare" },
  { id: "partd", name: "Part D (Prescription Drugs)", description: "Prescription drug coverage" },
  { id: "additional", name: "Additional Options", description: "Dental, cancer, and hospital indemnity coverage" },
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

// Additional options for selection
type AdditionalOption = {
  id: string;
  name: string;
  description: string;
  features?: string[];
};

const additionalOptions: AdditionalOption[] = [
  {
    id: "dental",
    name: "Dental Insurance",
    description: "Routine cleanings, fillings, and major dental work",
  },
  {
    id: "cancer",
    name: "Cancer Insurance", 
    description: "Critical illness coverage for cancer, heart attack, and stroke",
  },
  {
    id: "hospital",
    name: "Hospital Indemnity",
    description: "Cash benefits for hospital stays and medical events",
  },
  {
    id: "final-expense",
    name: "Final Expense Life Insurance",
    description: "Life insurance to cover end-of-life expenses"
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
    selectedAdditionalOptions: [] as string[],
    newMedicareChoice: "",
    currentMedicareType: "",
    supplementAction: "",
    advantageAction: "",
    doctorsSkipped: false,
    medicationsSkipped: false,
    doctors: [] as string[],
    medications: [] as string[],
    currentPlan: "",
    age: "",
    gender: "",
    zipCode: "",
    state: "",
    tobaccoUse: null as boolean | null,
    benefitAmount: "",
    // Cancer Insurance specific fields
    familyType: "",
    carcinomaInSitu: null as boolean | null,
    premiumMode: "",
    // Dental Insurance specific fields
    coveredMembers: "",
    // Final Expense specific fields
    desiredFaceValue: "",
    desiredRate: "",
    underwritingType: "",
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
      let steps = ["Plan Categories"];
      // Add Medigap plan selection if medigap is selected
      if (formData.planCategories.includes('medigap')) {
        steps.push("Medigap Plans");
      }
      // Add doctor/medication steps if advantage is selected
      if (formData.planCategories.includes('advantage')) {
        steps.push("Doctors");
        steps.push("Medications");
      }
      // Add Additional Options selection if additional is selected
      if (formData.planCategories.includes('additional')) {
        steps.push("Additional Options");
      }
      steps.push("Personal Information");
      return steps;
    }
    
    let steps = ["Medicare Status"]
    
    if (formData.medicareStatus === "browsing") {
      steps.push("Plan Categories")
      // Add Medigap plan selection if medigap is selected
      if (formData.planCategories.includes('medigap')) {
        steps.push("Medigap Plans")
      }
      // Add doctor/medication steps if advantage is selected
      if (formData.planCategories.includes('advantage')) {
        steps.push("Doctors")
        steps.push("Medications")
      }
      // Add Additional Options selection if additional is selected
      if (formData.planCategories.includes('additional')) {
        steps.push("Additional Options")
      }
      steps.push("Personal Information")
    } else if (formData.medicareStatus === "new") {
      if (formData.newMedicareChoice === "know-what-want") {
        steps.push("Plan Selection")
        // Add Medigap plan selection if medigap is selected
        if (formData.planCategories.includes('medigap')) {
          steps.push("Medigap Plans")
        }
        // Add doctor/medication steps if advantage is selected
        if (formData.planCategories.includes('advantage')) {
          steps.push("Doctors")
          steps.push("Medications")
        }
        // Add Additional Options selection if additional is selected
        if (formData.planCategories.includes('additional')) {
          steps.push("Additional Options")
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
          if (formData.planCategories.includes('advantage')) {
            steps.push("Doctors")
            steps.push("Medications")
          }
          if (formData.planCategories.includes('additional')) {
            steps.push("Additional Options")
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
          steps.push("Doctors")
          steps.push("Medications")
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
    // Quick mode: base steps + conditional additions
    if (mode === 'quick') {
      let estimatedSteps = 2; // Plan Categories + Personal Information
      
      // Add conditional steps based on selections
      if (formData.planCategories.includes('medigap')) {
        estimatedSteps += 1; // Medigap Plans
      }
      if (formData.planCategories.includes('advantage')) {
        estimatedSteps += 2; // Doctors + Medications  
      }
      if (formData.planCategories.includes('additional')) {
        estimatedSteps += 1; // Additional Options
      }
      
      return estimatedSteps;
    }
    
    // For guided mode, try to calculate dynamically based on selections
    const actualSteps = getSteps();
    if (actualSteps.length > 1) {
      return actualSteps.length;
    }
    
    // Initial estimates before user selections
    if (!formData.medicareStatus) {
      return 4; // Conservative estimate: Status -> Selection -> Options -> Personal Info
    }
    
    // Calculate based on selected Medicare status
    if (formData.medicareStatus === "browsing") {
      let estimate = 3; // Status -> Plan Categories -> Personal Info
      // Add estimates for potential additional steps
      if (formData.planCategories.length === 0) {
        estimate += 2; // Could have Medigap + Advantage steps
      }
      return estimate;
    } else if (formData.medicareStatus === "new") {
      if (formData.newMedicareChoice === "unsure") {
        return 2; // Status -> Personal Info
      } else if (formData.newMedicareChoice === "know-what-want") {
        return 5; // Status -> Plan Selection -> possible subcategories -> Personal Info
      } else {
        return 4; // Status -> Experience Level -> Plan Selection -> Personal Info
      }
    } else if (formData.medicareStatus === "enrolled") {
      return 4; // Status -> Current Type -> Action -> Personal Info
    }
    
    // Fallback
    return Math.max(actualSteps.length, 3);
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
      const nextStepIndex = currentStep + 1;
      const nextStepName = steps[nextStepIndex];
      
      // Initialize arrays when entering Doctors or Medications steps
      if (nextStepName === "Doctors" && formData.doctors.length === 0) {
        setFormData(prev => ({ ...prev, doctors: [""], doctorsSkipped: false }));
      } else if (nextStepName === "Medications" && formData.medications.length === 0) {
        setFormData(prev => ({ ...prev, medications: [""], medicationsSkipped: false }));
      }
      
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

  const toggleAdditionalOption = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAdditionalOptions: prev.selectedAdditionalOptions.includes(optionId)
        ? prev.selectedAdditionalOptions.filter(id => id !== optionId)
        : [...prev.selectedAdditionalOptions, optionId]
    }))
  }

  const addDoctor = () => {
    setFormData(prev => ({
      ...prev,
      doctors: [...prev.doctors, ""],
      doctorsSkipped: false // Reset skip state when adding doctors
    }))
  }

  const updateDoctor = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      doctors: prev.doctors.map((doc, i) => i === index ? value : doc),
      doctorsSkipped: false // Reset skip state when user starts entering doctors
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
      medications: [...prev.medications, ""],
      medicationsSkipped: false // Reset skip state when adding medications
    }))
  }

  const updateMedication = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === index ? value : med),
      medicationsSkipped: false // Reset skip state when user starts entering medications
    }))
  }

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const skipMedications = () => {
    setFormData(prev => ({
      ...prev,
      medicationsSkipped: true,
      medications: []
    }))
  }

  // Helper function to determine required fields based on selected plans
  const getRequiredFields = () => {
    const fields = {
      zipCode: false,
      state: false,
      gender: false,
      age: false,
      tobaccoUse: false,
      benefitAmount: false,
      // Cancer Insurance specific fields
      familyType: false,
      carcinomaInSitu: false,
      premiumMode: false,
      // Dental Insurance specific fields
      coveredMembers: false,
      // Final Expense specific fields
      desiredFaceValue: false,
      desiredRate: false,
      underwritingType: false
    }

    // Check selected plan categories
    const hasAdvantage = formData.planCategories.includes('advantage')
    const hasMedigap = formData.planCategories.includes('medigap')
    const hasPartD = formData.planCategories.includes('partd')
    
    // Check selected additional options
    const hasDental = formData.selectedAdditionalOptions.includes('dental')
    const hasCancer = formData.selectedAdditionalOptions.includes('cancer')
    const hasHospital = formData.selectedAdditionalOptions.includes('hospital')
    const hasFinalExpense = formData.selectedAdditionalOptions.includes('final-expense')

    // Apply requirements based on the breakdown:
    // Zip Code: All (Except Cancer)
    if (hasAdvantage || hasMedigap || hasPartD || hasDental || hasHospital || hasFinalExpense) {
      fields.zipCode = true
    }
    
    // State: Cancer
    if (hasCancer) {
      fields.state = true
    }
    
    // Gender: Med Supp, Dental, Final Expense, Cancer, Hospital Indemnity
    if (hasMedigap || hasDental || hasCancer || hasFinalExpense || hasHospital) {
      fields.gender = true
    }
    
    // Age: Med Supp, Dental, Final Expense, Cancer, Hospital Indemnity  
    if (hasMedigap || hasDental || hasCancer || hasFinalExpense || hasHospital) {
      fields.age = true
    }
    
    // Tobacco Use: Med Supp, Dental, Final Expense, Cancer, Hospital Indemnity
    if (hasMedigap || hasDental || hasCancer || hasFinalExpense || hasHospital) {
      fields.tobaccoUse = true
    }
    
    // Cancer Insurance specific fields
    if (hasCancer) {
      fields.familyType = true
      fields.carcinomaInSitu = true
      fields.premiumMode = true
      fields.benefitAmount = true
    }

    // Dental Insurance specific fields
    if (hasDental) {
      fields.coveredMembers = true
    }

    // Final Expense specific fields
    if (hasFinalExpense) {
      fields.desiredFaceValue = true
      fields.underwritingType = true
    }

    return fields
  }

  // Helper function to determine if multiple plan types are selected (for contextual labels)
  const hasMultiplePlanTypes = () => {
    const totalSelections = formData.planCategories.length + formData.selectedAdditionalOptions.length
    return totalSelections > 1
  }

  const skipDoctors = () => {
    setFormData(prev => ({
      ...prev,
      doctorsSkipped: true,
      doctors: []
    }))
  }

  // Calculate progress based on actual steps vs estimated
  const progress = (() => {
    const actualSteps = getSteps();
    const totalSteps = Math.max(actualSteps.length, estimatedTotal);
    
    // If we have actual steps, use them for more accurate progress
    if (actualSteps.length > 1) {
      return ((currentStep + 1) / actualSteps.length) * 100;
    }
    
    // Otherwise use estimated total
    return ((currentStep + 1) / estimatedTotal) * 100;
  })();

  const canProceed = () => {
    const currentStepName = steps[currentStep]
    
    switch (currentStepName) {
      case "Medicare Status":
        return formData.medicareStatus !== ""
      case "Plan Categories":
        return formData.planCategories.length > 0
      case "Medigap Plans":
        return formData.selectedMedigapPlans.length > 0
      case "Doctors":
        return formData.doctorsSkipped || (formData.doctors.length > 0 && formData.doctors.some(doctor => doctor.trim() !== ""))
      case "Medications":
        return formData.medicationsSkipped || (formData.medications.length > 0 && formData.medications.some(med => med.trim() !== ""))
      case "Additional Options":
        return formData.selectedAdditionalOptions.length > 0
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
        const requiredFields = getRequiredFields()
        const validations = []
        
        if (requiredFields.zipCode && !formData.zipCode) validations.push(false)
        if (requiredFields.state && !formData.state) validations.push(false)
        if (requiredFields.gender && !formData.gender) validations.push(false)
        if (requiredFields.age && !formData.age) validations.push(false)
        if (requiredFields.tobaccoUse && formData.tobaccoUse === null) validations.push(false)
        if (requiredFields.benefitAmount && !formData.benefitAmount) validations.push(false)
        
        // Cancer Insurance specific validations
        if (requiredFields.familyType && !formData.familyType) validations.push(false)
        if (requiredFields.carcinomaInSitu && formData.carcinomaInSitu === null) validations.push(false)
        if (requiredFields.premiumMode && !formData.premiumMode) validations.push(false)
        
        // Dental Insurance specific validations
        if (requiredFields.coveredMembers && !formData.coveredMembers) validations.push(false)
        
        // Final Expense specific validations
        if (requiredFields.desiredFaceValue && !formData.desiredFaceValue) validations.push(false)
        if (requiredFields.underwritingType && !formData.underwritingType) validations.push(false)
        
        return validations.length === 0
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
              Step {currentStep + 1} of {(() => {
                const actualSteps = getSteps();
                return actualSteps.length > 1 ? actualSteps.length : estimatedTotal;
              })()}
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
        <div className="backdrop-blur-sm min-h-[500px] flex flex-col">
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
                      className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                        formData.selectedMedigapPlans.includes(plan.id)
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-lg">Plan {plan.id}</div>
                        {formData.selectedMedigapPlans.includes(plan.id) && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Additional Options Step */}
            {steps[currentStep] === "Additional Options" && (
              <motion.div
                key="additional-options"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">Which additional options interest you?</h2>
                <p className="text-muted-foreground mb-8">Select the supplemental coverage options you'd like to explore. Each provides different benefits to complement your Medicare coverage.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {additionalOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleAdditionalOption(option.id)}
                      className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                        formData.selectedAdditionalOptions.includes(option.id)
                          ? "bg-primary/20 border-primary/50 text-foreground"
                          : "bg-background/50 border-border text-foreground/80 hover:border-border/80"
                      }`}
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-lg">{option.name}</div>
                          {formData.selectedAdditionalOptions.includes(option.id) && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="text-sm opacity-70">{option.description}</div>
                        <div className="space-y-1">
                          {option.features && option.features.map((feature, index) => (
                            <div key={index} className="text-xs opacity-60 flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              {feature}
                            </div>
                          ))}
                        </div>
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

            {/* Doctors Step */}
            {steps[currentStep] === "Doctors" && (
              <motion.div
                key="doctors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">Tell us about your doctors</h2>
                <p className="text-muted-foreground mb-8">Add your current healthcare providers so we can check if they're in-network with Medicare Advantage plans.</p>

                {formData.doctorsSkipped ? (
                  <div className="text-center py-8">
                    <div className="bg-muted/50 rounded-lg p-6 mb-4">
                      <p className="text-foreground font-medium mb-2">Doctor check skipped</p>
                      <p className="text-muted-foreground text-sm">You can add doctors later or check network coverage after enrollment.</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, doctorsSkipped: false, doctors: [""] }))}
                    >
                      Add Doctors Instead
                    </Button>
                  </div>
                ) : (
                <div className="space-y-4 mb-8">
                  {formData.doctors.map((doctor, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder="e.g., Dr. Smith Cardiology, Main Street Family Practice"
                        value={doctor}
                        onChange={(e) => updateDoctor(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.doctors.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeDoctor(index)}
                          className="shrink-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addDoctor}
                    className="w-full"
                  >
                    + Add Another Doctor
                  </Button>
                  
                  <div className="text-center pt-4">
                    <Button
                      variant="ghost"
                      onClick={skipDoctors}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Skip - I'll check this later
                    </Button>
                  </div>
                </div>
                )}
              </motion.div>
            )}

            {/* Medications Step */}
            {steps[currentStep] === "Medications" && (
              <motion.div
                key="medications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">Tell us about your medications</h2>
                <p className="text-muted-foreground mb-8">Add your current prescriptions so we can check drug coverage and costs across different Medicare Advantage plans.</p>

                {formData.medicationsSkipped ? (
                  <div className="text-center py-8">
                    <div className="bg-muted/50 rounded-lg p-6 mb-4">
                      <p className="text-foreground font-medium mb-2">Medication check skipped</p>
                      <p className="text-muted-foreground text-sm">You can add medications later or check drug coverage after enrollment.</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, medicationsSkipped: false, medications: [""] }))}
                    >
                      Add Medications Instead
                    </Button>
                  </div>
                ) : (
                <div className="space-y-4 mb-8">
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder="e.g., Metformin, Lisinopril, Atorvastatin"
                        value={medication}
                        onChange={(e) => updateMedication(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.medications.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeMedication(index)}
                          className="shrink-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addMedication}
                    className="w-full"
                  >
                    + Add Another Medication
                  </Button>
                  
                  <div className="text-center pt-4">
                    <Button
                      variant="ghost"
                      onClick={skipMedications}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Skip - I'll check this later
                    </Button>
                  </div>
                </div>
                )}
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
                <h2 className="text-3xl font-bold text-foreground mb-4">Almost there!</h2>
                <p className="text-muted-foreground mb-8">
                  We need some basic information to provide accurate quotes.
                </p>

                <div className="max-w-2xl mx-auto">
                  <div className="p-8">
                    <div className="space-y-6">
                      {(() => {
                        const requiredFields = getRequiredFields()
                        return (
                          <>
                            {/* Form Grid */}
                            <div className={`grid grid-cols-1 gap-6 ${
                              Object.values(requiredFields).filter(Boolean).length === 1 && requiredFields.zipCode 
                                ? 'max-w-sm mx-auto' 
                                : 'md:grid-cols-2'
                            }`}>
                              {/* Age */}
                              {requiredFields.age && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Your Age *</Label>
                                    {hasMultiplePlanTypes() && (
                                      <div className="text-xs text-gray-500 mt-0.5">General Info</div>
                                    )}
                                  </div>
                                  <Input
                                    type="number"
                                    placeholder="65"
                                    min="60"
                                    max="100"
                                    value={formData.age}
                                    onChange={(e) => setFormData(prev => ({ 
                                      ...prev, 
                                      age: e.target.value 
                                    }))}
                                  />
                                </div>
                              )}

                              {/* ZIP Code */}
                              {requiredFields.zipCode && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">ZIP Code *</Label>
                                    {hasMultiplePlanTypes() && (
                                      <div className="text-xs text-gray-500 mt-0.5">General Info</div>
                                    )}
                                  </div>
                                  <Input
                                    type="text"
                                    placeholder="12345"
                                    maxLength={5}
                                    value={formData.zipCode}
                                    onChange={(e) => setFormData(prev => ({ 
                                      ...prev, 
                                      zipCode: e.target.value.replace(/\D/g, '')
                                    }))}
                                  />
                                </div>
                              )}

                              {/* State */}
                              {requiredFields.state && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">State *</Label>
                                    {hasMultiplePlanTypes() && (
                                      <div className="text-xs text-gray-500 mt-0.5">General Info</div>
                                    )}
                                  </div>
                                  <Select 
                                    value={formData.state} 
                                    onValueChange={(value) => setFormData(prev => ({ 
                                      ...prev, 
                                      state: value 
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {formData.selectedAdditionalOptions.includes('cancer') ? (
                                        <SelectItem value="TX">Texas</SelectItem>
                                      ) : (
                                        <>
                                          <SelectItem value="AL">Alabama</SelectItem>
                                          <SelectItem value="AK">Alaska</SelectItem>
                                          <SelectItem value="AZ">Arizona</SelectItem>
                                          <SelectItem value="AR">Arkansas</SelectItem>
                                          <SelectItem value="CA">California</SelectItem>
                                          <SelectItem value="CO">Colorado</SelectItem>
                                          <SelectItem value="CT">Connecticut</SelectItem>
                                          <SelectItem value="DE">Delaware</SelectItem>
                                          <SelectItem value="FL">Florida</SelectItem>
                                          <SelectItem value="GA">Georgia</SelectItem>
                                          <SelectItem value="HI">Hawaii</SelectItem>
                                          <SelectItem value="ID">Idaho</SelectItem>
                                          <SelectItem value="IL">Illinois</SelectItem>
                                          <SelectItem value="IN">Indiana</SelectItem>
                                          <SelectItem value="IA">Iowa</SelectItem>
                                          <SelectItem value="KS">Kansas</SelectItem>
                                          <SelectItem value="KY">Kentucky</SelectItem>
                                          <SelectItem value="LA">Louisiana</SelectItem>
                                          <SelectItem value="ME">Maine</SelectItem>
                                          <SelectItem value="MD">Maryland</SelectItem>
                                          <SelectItem value="MA">Massachusetts</SelectItem>
                                          <SelectItem value="MI">Michigan</SelectItem>
                                          <SelectItem value="MN">Minnesota</SelectItem>
                                          <SelectItem value="MS">Mississippi</SelectItem>
                                          <SelectItem value="MO">Missouri</SelectItem>
                                          <SelectItem value="MT">Montana</SelectItem>
                                          <SelectItem value="NE">Nebraska</SelectItem>
                                          <SelectItem value="NV">Nevada</SelectItem>
                                          <SelectItem value="NH">New Hampshire</SelectItem>
                                          <SelectItem value="NJ">New Jersey</SelectItem>
                                          <SelectItem value="NM">New Mexico</SelectItem>
                                          <SelectItem value="NY">New York</SelectItem>
                                          <SelectItem value="NC">North Carolina</SelectItem>
                                          <SelectItem value="ND">North Dakota</SelectItem>
                                          <SelectItem value="OH">Ohio</SelectItem>
                                          <SelectItem value="OK">Oklahoma</SelectItem>
                                          <SelectItem value="OR">Oregon</SelectItem>
                                          <SelectItem value="PA">Pennsylvania</SelectItem>
                                          <SelectItem value="RI">Rhode Island</SelectItem>
                                          <SelectItem value="SC">South Carolina</SelectItem>
                                          <SelectItem value="SD">South Dakota</SelectItem>
                                          <SelectItem value="TN">Tennessee</SelectItem>
                                          <SelectItem value="TX">Texas</SelectItem>
                                          <SelectItem value="UT">Utah</SelectItem>
                                          <SelectItem value="VT">Vermont</SelectItem>
                                          <SelectItem value="VA">Virginia</SelectItem>
                                          <SelectItem value="WA">Washington</SelectItem>
                                          <SelectItem value="WV">West Virginia</SelectItem>
                                          <SelectItem value="WI">Wisconsin</SelectItem>
                                          <SelectItem value="WY">Wyoming</SelectItem>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Gender */}
                              {requiredFields.gender && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Gender *</Label>
                                    {hasMultiplePlanTypes() && (
                                      <div className="text-xs text-gray-500 mt-0.5">General Info</div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant={formData.gender === "male" ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, gender: "male" }))}
                                      className="flex-1"
                                    >
                                      Male
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={formData.gender === "female" ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, gender: "female" }))}
                                      className="flex-1"
                                    >
                                      Female
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Tobacco Use */}
                              {requiredFields.tobaccoUse && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Tobacco Use *</Label>
                                    {hasMultiplePlanTypes() && (
                                      <div className="text-xs text-gray-500 mt-0.5">General Info</div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant={formData.tobaccoUse === false ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, tobaccoUse: false }))}
                                      className="flex-1"
                                    >
                                      No
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={formData.tobaccoUse === true ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, tobaccoUse: true }))}
                                      className="flex-1"
                                    >
                                      Yes
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Benefit Amount */}
                              {requiredFields.benefitAmount && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Benefit Amount *</Label>
                                    {hasMultiplePlanTypes() && formData.selectedAdditionalOptions.includes('cancer') && (
                                      <div className="text-xs text-gray-500 mt-0.5">Cancer Insurance</div>
                                    )}
                                  </div>
                                  <Select 
                                    value={formData.benefitAmount} 
                                    onValueChange={(value) => setFormData(prev => ({ 
                                      ...prev, 
                                      benefitAmount: value 
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select benefit amount" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5000">$5,000</SelectItem>
                                      <SelectItem value="10000">$10,000</SelectItem>
                                      <SelectItem value="15000">$15,000</SelectItem>
                                      <SelectItem value="20000">$20,000</SelectItem>
                                      <SelectItem value="25000">$25,000</SelectItem>
                                      <SelectItem value="30000">$30,000</SelectItem>
                                      <SelectItem value="50000">$50,000</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Cancer Insurance: Family Type */}
                              {requiredFields.familyType && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Coverage Type *</Label>
                                    {hasMultiplePlanTypes() && formData.selectedAdditionalOptions.includes('cancer') && (
                                      <div className="text-xs text-gray-500 mt-0.5">Cancer Insurance</div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant={formData.familyType === "individual" ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, familyType: "individual" }))}
                                      className="flex-1"
                                    >
                                      Individual
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={formData.familyType === "family" ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, familyType: "family" }))}
                                      className="flex-1"
                                    >
                                      Family
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Cancer Insurance: Carcinoma In Situ Coverage */}
                              {requiredFields.carcinomaInSitu && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Carcinoma In Situ Coverage *</Label>
                                    {hasMultiplePlanTypes() && formData.selectedAdditionalOptions.includes('cancer') && (
                                      <div className="text-xs text-gray-500 mt-0.5">Cancer Insurance</div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant={formData.carcinomaInSitu === false ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, carcinomaInSitu: false }))}
                                      className="flex-1"
                                    >
                                      No
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={formData.carcinomaInSitu === true ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, carcinomaInSitu: true }))}
                                      className="flex-1"
                                    >
                                      Yes
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Cancer Insurance: Premium Mode */}
                              {requiredFields.premiumMode && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Premium Payment *</Label>
                                    {hasMultiplePlanTypes() && formData.selectedAdditionalOptions.includes('cancer') && (
                                      <div className="text-xs text-gray-500 mt-0.5">Cancer Insurance</div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant={formData.premiumMode === "monthly" ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, premiumMode: "monthly" }))}
                                      className="flex-1"
                                    >
                                      Monthly
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={formData.premiumMode === "annual" ? "default" : "outline"}
                                      onClick={() => setFormData(prev => ({ ...prev, premiumMode: "annual" }))}
                                      className="flex-1"
                                    >
                                      Annual
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Dental Insurance: Covered Members */}
                              {requiredFields.coveredMembers && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Number of Covered Members *</Label>
                                    {hasMultiplePlanTypes() && formData.selectedAdditionalOptions.includes('dental') && (
                                      <div className="text-xs text-gray-500 mt-0.5">Dental Insurance</div>
                                    )}
                                  </div>
                                  <Select 
                                    value={formData.coveredMembers} 
                                    onValueChange={(value) => setFormData(prev => ({ 
                                      ...prev, 
                                      coveredMembers: value 
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select number of members" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 (Individual)</SelectItem>
                                      <SelectItem value="2">2 (Couple)</SelectItem>
                                      <SelectItem value="3">3 (Small Family)</SelectItem>
                                      <SelectItem value="4">4 (Family)</SelectItem>
                                      <SelectItem value="5">5+ (Large Family)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Final Expense: Desired Face Value */}
                              {requiredFields.desiredFaceValue && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Desired Coverage Amount *</Label>
                                    {hasMultiplePlanTypes() && formData.selectedAdditionalOptions.includes('final-expense') && (
                                      <div className="text-xs text-gray-500 mt-0.5">Final Expense Life Insurance</div>
                                    )}
                                  </div>
                                  <Select 
                                    value={formData.desiredFaceValue} 
                                    onValueChange={(value) => setFormData(prev => ({ 
                                      ...prev, 
                                      desiredFaceValue: value 
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select coverage amount" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5000">$5,000</SelectItem>
                                      <SelectItem value="10000">$10,000</SelectItem>
                                      <SelectItem value="15000">$15,000</SelectItem>
                                      <SelectItem value="20000">$20,000</SelectItem>
                                      <SelectItem value="25000">$25,000</SelectItem>
                                      <SelectItem value="30000">$30,000</SelectItem>
                                      <SelectItem value="50000">$50,000</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Final Expense: Underwriting Type */}
                              {requiredFields.underwritingType && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Underwriting Preference *</Label>
                                    {hasMultiplePlanTypes() && formData.selectedAdditionalOptions.includes('final-expense') && (
                                      <div className="text-xs text-gray-500 mt-0.5">Final Expense Life Insurance</div>
                                    )}
                                  </div>
                                  <Select 
                                    value={formData.underwritingType} 
                                    onValueChange={(value) => setFormData(prev => ({ 
                                      ...prev, 
                                      underwritingType: value 
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select underwriting type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="No Preference">No Preference (Show All Options)</SelectItem>
                                      <SelectItem value="Guaranteed">Guaranteed Issue (No Health Questions)</SelectItem>
                                      <SelectItem value="Simplified">Simplified Issue (Few Health Questions)</SelectItem>
                                      <SelectItem value="Full">Full Underwriting (Medical Exam Required)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>

                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
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
