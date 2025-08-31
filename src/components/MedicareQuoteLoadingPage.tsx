"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MagnifyingGlassIcon, 
  LockClosedIcon, 
  TokensIcon, 
  FileTextIcon,
  CheckCircledIcon,
  ReloadIcon,
  StarIcon,
  HeartIcon,
  GearIcon,
  ClipboardIcon,
  FileIcon,
  IdCardIcon,
  PlusIcon
} from "@radix-ui/react-icons";

interface MedicareQuoteLoadingPageProps {
  loadingItems?: string[]; // Specific items being loaded
  zipCode?: string;
  age?: string;
  selectedCategories?: string[];
  onComplete?: () => void;
  // New props for dynamic progress
  externalProgress?: number; // Progress from 0-100
  currentLoadingStep?: string; // Current step being processed
  useExternalProgress?: boolean; // Whether to use external progress or internal timer
  onStepComplete?: (stepId: string) => void; // Callback when a step completes
  // Real-time step tracking
  completedQuoteTypes?: string[]; // Array of completed quote types (e.g., ['Plan F', 'Plan G'])
  currentQuoteType?: string; // Currently processing quote type
  totalExpectedQuotes?: number; // Total number of quotes expected
}

const loadingSteps = [
  { id: 1, text: "Finding Plan F Quotes", icon: StarIcon, duration: 2000 },
  { id: 2, text: "Finding Plan G Quotes", icon: LockClosedIcon, duration: 2000 },
  { id: 3, text: "Finding Plan N Quotes", icon: HeartIcon, duration: 2000 },
  { id: 4, text: "Finding Medicare Advantage Quotes", icon: HeartIcon, duration: 2000 },
  { id: 5, text: "Finalizing your personalized quotes", icon: CheckCircledIcon, duration: 1500 }
];

const tips = [
  "Compare plans carefully as benefits and costs vary by carrier",
  "Check if your doctors are in the plan's network before enrolling", 
  "Many plans offer extra benefits like dental, vision, or wellness programs",
  "You have a guaranteed issue period when you first become eligible for Medicare"
];

export default function MedicareQuoteLoadingPage({ 
  loadingItems = [],
  zipCode, 
  age, 
  selectedCategories,
  onComplete,
  externalProgress,
  currentLoadingStep,
  useExternalProgress = false,
  onStepComplete,
  completedQuoteTypes = [],
  currentQuoteType,
  totalExpectedQuotes = 0
}: MedicareQuoteLoadingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Generate dynamic steps based on loadingItems if provided
  const getDynamicSteps = () => {
    if (loadingItems.length === 0) {
      // If no specific items, return default steps
      return loadingSteps;
    }

    // Create steps for all loading items dynamically
    const dynamicSteps = [];
    
    // Create a step for each loading item
    loadingItems.forEach((item, index) => {
      let stepText = "";
      let stepIcon = MagnifyingGlassIcon; // Default icon
      
      if (item.includes('Plan F')) {
        stepText = "Finding Plan F Quotes";
        stepIcon = StarIcon; // Premium comprehensive plan
      } else if (item.includes('Plan G')) {
        stepText = "Finding Plan G Quotes";
        stepIcon = LockClosedIcon; // Most popular, protective
      } else if (item.includes('Plan N')) {
        stepText = "Finding Plan N Quotes";
        stepIcon = HeartIcon; // Cost-effective, caring choice
      } else if (item.includes('Plan A')) {
        stepText = "Finding Plan A Quotes";
        stepIcon = IdCardIcon; // Basic coverage
      } else if (item.includes('Plan B')) {
        stepText = "Finding Plan B Quotes";
        stepIcon = PlusIcon; // Additional benefits
      } else if (item.includes('Plan C')) {
        stepText = "Finding Plan C Quotes";
        stepIcon = ClipboardIcon; // Comprehensive coverage
      } else if (item.includes('Plan D')) {
        stepText = "Finding Plan D Quotes";
        stepIcon = FileIcon; // Documentation/paperwork
      } else if (item.includes('Plan K')) {
        stepText = "Finding Plan K Quotes";
        stepIcon = TokensIcon; // Lower premium option
      } else if (item.includes('Plan L')) {
        stepText = "Finding Plan L Quotes";
        stepIcon = GearIcon; // Flexible option
      } else if (item.includes('Plan M')) {
        stepText = "Finding Plan M Quotes";
        stepIcon = LockClosedIcon; // Secure option
      } else if (item === 'Medicare Advantage Plans' || item.includes('Medicare Advantage')) {
        stepText = "Finding Medicare Advantage Quotes";
        stepIcon = HeartIcon; // Healthcare focus
      } else if (item === 'Supplement Plans') {
        stepText = "Finding Supplement Quotes";
        stepIcon = LockClosedIcon; // Protection/supplement coverage
      } else if (item === 'Drug Plans') {
        stepText = "Finding Drug Plan Quotes";
        stepIcon = TokensIcon; // Prescription/cost savings
      } else {
        // Generic step for any other item
        stepText = `Finding ${item}`;
        stepIcon = MagnifyingGlassIcon;
      }
      
      dynamicSteps.push({
        id: index + 1,
        text: stepText,
        icon: stepIcon,
        duration: 2000
      });
    });

    // Always add the final step
    dynamicSteps.push({
      id: dynamicSteps.length + 1,
      text: "Finalizing your personalized quotes",
      icon: CheckCircledIcon,
      duration: 1500
    });

    return dynamicSteps;
  };

  const steps = useMemo(() => getDynamicSteps(), [loadingItems]);
  const currentTips = tips;

  // Effect for real-time quote tracking (takes precedence over external progress)
  useEffect(() => {
    if (totalExpectedQuotes > 0 && completedQuoteTypes.length >= 0) {
      // Calculate progress based on completed quotes
      const completedCount = completedQuoteTypes.length;
      const totalQuoteSteps = steps.length - 1; // Exclude the "Finalizing" step
      
      // Update current step based on progress and completed quotes
      let stepIndex = 0;
      
      if (currentQuoteType) {
        // If we have a current quote type, find the matching step
        stepIndex = steps.findIndex(step => 
          step.text.toLowerCase().includes(currentQuoteType.toLowerCase()) ||
          (currentQuoteType === 'Medicare Advantage Plans' && step.text.includes('Medicare Advantage')) ||
          (currentQuoteType === 'Drug Plans' && step.text.includes('Drug Plan'))
        );
        if (stepIndex === -1) stepIndex = completedCount; // Default to completed count
      } else {
        // If no current quote type (parallel execution), determine based on progress
        if (completedCount >= totalExpectedQuotes) {
          // All quotes completed, show finalizing step
          stepIndex = steps.length - 1;
        } else if (completedCount === 0) {
          // No quotes completed yet, show first step as active
          stepIndex = 0;
        } else {
          // Some quotes completed, show next step as active
          stepIndex = Math.min(completedCount, totalQuoteSteps - 1);
        }
      }
      
      setCurrentStep(Math.max(0, stepIndex));
      
      // Calculate smooth progress with intra-step progression
      let smoothProgress = 0;
      if (totalExpectedQuotes > 0) {
        // Base progress from completed quotes (not total steps)
        const baseProgress = (completedCount / totalExpectedQuotes) * 100;
        
        // Add intra-step progress if we're currently processing quotes
        if (completedCount < totalExpectedQuotes) {
          // Add partial progress for ongoing processing (assume 25% progress for active step)
          const intraStepProgress = (1 / totalExpectedQuotes) * 25; // 25% of one step
          smoothProgress = baseProgress + intraStepProgress;
        } else {
          smoothProgress = baseProgress;
        }
        
        // Ensure we don't exceed 100% until all quotes are actually complete
        if (completedCount >= totalExpectedQuotes) {
          smoothProgress = 100;
        } else {
          smoothProgress = Math.min(smoothProgress, 95); // Cap at 95% until all complete
        }
      }
      
      setProgress(smoothProgress);
      
      // Update completed steps
      const newCompletedSteps = new Set<string>();
      completedQuoteTypes.forEach((quoteType, index) => {
        // Find matching step for each completed quote type
        const matchingStepIndex = steps.findIndex(step => 
          step.text.toLowerCase().includes(quoteType.toLowerCase()) ||
          (quoteType === 'Medicare Advantage Plans' && step.text.includes('Medicare Advantage')) ||
          (quoteType === 'Drug Plans' && step.text.includes('Drug Plan'))
        );
        if (matchingStepIndex !== -1) {
          newCompletedSteps.add(steps[matchingStepIndex].id.toString());
        }
      });
      setCompletedSteps(newCompletedSteps);
      
      // Check if all quotes are complete
      if (completedCount >= totalExpectedQuotes && smoothProgress >= 100 && onComplete) {
        setTimeout(() => onComplete(), 500);
      }
    }
  }, [completedQuoteTypes, currentQuoteType, totalExpectedQuotes, steps, onComplete]);

  // Effect for external progress control (fallback when real-time data not available)
  useEffect(() => {
    // Only use external progress if we don't have real-time quote tracking
    if (useExternalProgress && typeof externalProgress === 'number' && totalExpectedQuotes === 0) {
      setProgress(Math.min(Math.max(externalProgress, 0), 100));
      
      // Calculate current step based on progress
      const stepIndex = Math.floor((externalProgress / 100) * steps.length);
      setCurrentStep(Math.min(stepIndex, steps.length - 1));
      
      // Check if we've completed the loading
      if (externalProgress >= 100 && onComplete) {
        setTimeout(() => onComplete(), 500);
      }
    }
  }, [externalProgress, useExternalProgress, steps.length, onComplete, totalExpectedQuotes]);

  // Effect for external step control
  useEffect(() => {
    if (useExternalProgress && currentLoadingStep) {
      const stepIndex = steps.findIndex(step => 
        step.text.toLowerCase().includes(currentLoadingStep.toLowerCase()) ||
        step.id.toString() === currentLoadingStep
      );
      
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
        
        // Mark previous steps as completed
        const newCompletedSteps = new Set<string>();
        for (let i = 0; i < stepIndex; i++) {
          newCompletedSteps.add(steps[i].id.toString());
        }
        setCompletedSteps(newCompletedSteps);
      }
    }
  }, [currentLoadingStep, useExternalProgress, steps]);

  // Original timer-based effect (only runs when not using external progress)
  useEffect(() => {
    if (useExternalProgress) return; // Skip timer-based progress when using external
    
    let stepTimeout: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        // Loading complete
        if (onComplete) {
          setTimeout(() => onComplete(), 500);
        }
        return;
      }

      setCurrentStep(stepIndex);
      
      // Mark previous steps as completed
      const newCompletedSteps = new Set<string>();
      for (let i = 0; i < stepIndex; i++) {
        newCompletedSteps.add(steps[i].id.toString());
      }
      setCompletedSteps(newCompletedSteps);
      
      // Notify parent component about step change
      if (onStepComplete) {
        onStepComplete(steps[stepIndex].id.toString());
      }
      
      // Animate progress for this step
      const stepDuration = steps[stepIndex].duration;
      const progressIncrement = (100 / steps.length) / (stepDuration / 50);
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + progressIncrement;
          if (newProgress >= ((stepIndex + 1) * 100) / steps.length) {
            clearInterval(progressInterval);
            return ((stepIndex + 1) * 100) / steps.length;
          }
          return newProgress;
        });
      }, 50);

      stepTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        // Mark current step as completed
        setCompletedSteps(prev => new Set([...prev, steps[stepIndex].id.toString()]));
        runStep(stepIndex + 1);
      }, stepDuration);
    };

    runStep(0);

    return () => {
      clearTimeout(stepTimeout);
      clearInterval(progressInterval);
    };
  }, [steps, onComplete, useExternalProgress, onStepComplete]);

  // Rotate tips every 3 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % currentTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [currentTips.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] max-w-4xl mx-auto p-6">
      {/* Progress Section */}
      <Card className="w-full max-w-2xl mb-8">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <motion.span 
                  className="font-medium"
                  key={Math.round(progress)}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeInOut",
                    type: "tween"
                  }}
                />
              </div>
            </div>

            {/* Current Step */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = useExternalProgress ? 
                  completedSteps.has(step.id.toString()) : 
                  index < currentStep;
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0.3, scale: 0.95 }}
                    animate={{ 
                      opacity: isActive ? 1 : (isCompleted ? 0.7 : 0.3),
                      scale: isActive ? 1 : 0.95
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircledIcon className="w-4 h-4" />
                      ) : (
                        <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                    
                    <span className={`font-medium ${
                      isActive ? 'text-foreground' : 
                      isCompleted ? 'text-muted-foreground' :
                      'text-muted-foreground'
                    }`}>
                      {step.text}
                    </span>

                    {isActive && (
                      <div className="ml-auto flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            💡 Did You Know?
          </h3>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-muted-foreground leading-relaxed"
            >
              {currentTips[currentTip]}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center gap-1 mt-4">
            {currentTips.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTip ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Message */}
      <p className="text-sm text-muted-foreground text-center mt-6 max-w-lg">
        This typically takes 10-15 seconds. We're ensuring you get the most accurate and up-to-date pricing available.
      </p>
    </div>
  );
}
