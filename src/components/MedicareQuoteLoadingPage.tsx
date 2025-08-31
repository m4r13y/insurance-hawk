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
  // Enhanced progress tracking
  startedQuoteTypes?: string[]; // Array of quote types that have started loading
}

const loadingSteps = [
  { id: 1, text: "Finding Plan F Quotes", icon: StarIcon, duration: 2000 },
  { id: 2, text: "Finding Plan G Quotes", icon: LockClosedIcon, duration: 2000 },
  { id: 3, text: "Finding Plan N Quotes", icon: HeartIcon, duration: 2000 },
  { id: 4, text: "Finding Medicare Advantage Quotes", icon: HeartIcon, duration: 2000 }
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
  totalExpectedQuotes = 0,
  startedQuoteTypes = []
}: MedicareQuoteLoadingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  
  // Track individual step progress for each quote type
  const [stepProgress, setStepProgress] = useState<Map<string, number>>(new Map());

  // Helper function to get step status and progress
  const getStepStatus = (stepText: string) => {
    // Find matching quote type for this step
    const matchingQuoteType = startedQuoteTypes.find(quoteType => {
      const stepTextLower = stepText.toLowerCase();
      const quoteTypeLower = quoteType.toLowerCase();
      
      // Handle specific category to step text mapping
      if (quoteType === 'medigap' && stepTextLower.includes('supplement')) {
        return true;
      }
      if (quoteType === 'advantage' && stepTextLower.includes('medicare advantage')) {
        return true;
      }
      if (quoteType === 'drug-plan' && stepTextLower.includes('drug plan')) {
        return true;
      }
      if (quoteType === 'dental' && stepTextLower.includes('dental')) {
        return true;
      }
      if (quoteType === 'cancer' && stepTextLower.includes('cancer')) {
        return true;
      }
      if (quoteType === 'hospital-indemnity' && stepTextLower.includes('hospital')) {
        return true;
      }
      if (quoteType === 'final-expense' && stepTextLower.includes('final expense')) {
        return true;
      }
      // Handle individual plan quotes (Plan F, Plan G, etc.)
      if (quoteType === 'medigap' && stepTextLower.includes('plan ')) {
        return true;
      }
      return false;
    });

    // Debug logging to help troubleshoot
    if (stepText.includes('Supplement') || stepText.includes('Drug Plan')) {
      console.log(`🔍 Debug - Step: "${stepText}", Started Types:`, startedQuoteTypes, 'Matching:', matchingQuoteType);
    }

    const isCompleted = completedQuoteTypes.some(completed => {
      const stepTextLower = stepText.toLowerCase();
      const completedLower = completed.toLowerCase();
      
      if (completed === 'Medicare Advantage Plans' && stepTextLower.includes('medicare advantage')) {
        return true;
      }
      if (completed === 'Drug Plans' && stepTextLower.includes('drug plan')) {
        return true;
      }
      if (completed === 'Hospital Indemnity' && stepTextLower.includes('hospital')) {
        return true;
      }
      if (completed === 'Final Expense Life' && stepTextLower.includes('final expense')) {
        return true;
      }
      if (completed === 'Cancer Insurance' && stepTextLower.includes('cancer')) {
        return true;
      }
      if (completed === 'Dental Insurance' && stepTextLower.includes('dental')) {
        return true;
      }
      if (completed === 'Supplement Plans' && stepTextLower.includes('supplement')) {
        return true;
      }
      if (completed.startsWith('Plan ') && stepTextLower.includes(completedLower)) {
        return true;
      }
      return stepTextLower.includes(completedLower);
    });

    const isStarted = !!matchingQuoteType;
    
    return {
      isStarted,
      isCompleted,
      isActive: isStarted && !isCompleted,
      matchingQuoteType
    };
  };

  // Generate dynamic steps based on loadingItems if provided
  const getDynamicSteps = () => {
    if (loadingItems.length === 0) {
      // If no specific items, return default steps
      return loadingSteps;
    }

    // Create steps for all loading items dynamically
    const dynamicSteps: Array<{id: number, text: string, icon: any, duration: number}> = [];
    
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

    return dynamicSteps;
  };

  const steps = useMemo(() => getDynamicSteps(), [loadingItems]);
  const currentTips = tips;

  // Effect to manage progressive loading for active steps
  useEffect(() => {
    const intervals: Map<string, NodeJS.Timeout> = new Map();
    
    steps.forEach(step => {
      const status = getStepStatus(step.text);
      
      if (status.isActive && status.matchingQuoteType) {
        // Different loading characteristics for each category type
        const getLoadingConfig = (stepText: string) => {
          const text = stepText.toLowerCase();
          
          if (text.includes('supplement') || text.includes('plan f') || text.includes('plan g') || text.includes('plan n')) {
            // Medigap: Moderate speed, steady progress
            return {
              interval: 600,
              minIncrement: 1.5,
              maxIncrement: 3.5,
              startProgress: 20,
              variability: 'moderate'
            };
          } else if (text.includes('medicare advantage')) {
            // Medicare Advantage: Faster, more variable
            return {
              interval: 400,
              minIncrement: 2,
              maxIncrement: 4.5,
              startProgress: 15,
              variability: 'high'
            };
          } else if (text.includes('drug plan')) {
            // Drug Plans: Quick and efficient
            return {
              interval: 350,
              minIncrement: 2.5,
              maxIncrement: 5,
              startProgress: 30,
              variability: 'low'
            };
          } else if (text.includes('dental')) {
            // Dental: Slower, methodical
            return {
              interval: 750,
              minIncrement: 1,
              maxIncrement: 2.5,
              startProgress: 25,
              variability: 'low'
            };
          } else if (text.includes('cancer')) {
            // Cancer: Moderate speed, steady
            return {
              interval: 550,
              minIncrement: 1.5,
              maxIncrement: 3,
              startProgress: 20,
              variability: 'moderate'
            };
          } else if (text.includes('hospital')) {
            // Hospital Indemnity: Quick bursts
            return {
              interval: 450,
              minIncrement: 2,
              maxIncrement: 4,
              startProgress: 25,
              variability: 'high'
            };
          } else if (text.includes('final expense')) {
            // Final Expense: Steady, reliable
            return {
              interval: 650,
              minIncrement: 1.2,
              maxIncrement: 2.8,
              startProgress: 22,
              variability: 'low'
            };
          } else {
            // Default: Balanced approach
            return {
              interval: 500,
              minIncrement: 1.5,
              maxIncrement: 3.5,
              startProgress: 25,
              variability: 'moderate'
            };
          }
        };
        
        const config = getLoadingConfig(step.text);
        
        // Set initial progress
        setStepProgress(prev => {
          const newMap = new Map(prev);
          if (!newMap.has(step.text)) {
            newMap.set(step.text, config.startProgress);
          }
          return newMap;
        });
        
        // Start progressive loading for this step with unique characteristics
        const interval = setInterval(() => {
          setStepProgress(prev => {
            const newMap = new Map(prev);
            const currentProgress = newMap.get(step.text) || config.startProgress;
            
            // Calculate increment based on variability
            let increment;
            if (config.variability === 'high') {
              // More random, sometimes bigger jumps
              increment = Math.random() < 0.3 
                ? Math.random() * (config.maxIncrement - config.minIncrement) + config.minIncrement + 1
                : Math.random() * (config.maxIncrement - config.minIncrement) + config.minIncrement;
            } else if (config.variability === 'low') {
              // More consistent, smaller variations
              const midPoint = (config.minIncrement + config.maxIncrement) / 2;
              const variation = (config.maxIncrement - config.minIncrement) * 0.3;
              increment = midPoint + (Math.random() - 0.5) * variation;
            } else {
              // Moderate variability (default)
              increment = Math.random() * (config.maxIncrement - config.minIncrement) + config.minIncrement;
            }
            
            // Progressive loading: slowly increase to 92% max (never 100% until actually complete)
            const newProgress = Math.min(currentProgress + increment, 92);
            
            newMap.set(step.text, newProgress);
            return newMap;
          });
        }, config.interval);
        
        intervals.set(step.text, interval);
      } else if (status.isCompleted) {
        // Mark as 100% complete
        setStepProgress(prev => {
          const newMap = new Map(prev);
          newMap.set(step.text, 100);
          return newMap;
        });
      } else if (!status.isStarted) {
        // Reset to 0% if not started
        setStepProgress(prev => {
          const newMap = new Map(prev);
          newMap.set(step.text, 0);
          return newMap;
        });
      }
    });
    
    // Cleanup intervals
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [startedQuoteTypes, completedQuoteTypes, steps]);

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
        stepIndex = steps.findIndex(step => {
          const stepTextLower = step.text.toLowerCase();
          const currentTypeLower = currentQuoteType.toLowerCase();
          
          // Handle specific current quote type matching
          if (currentQuoteType === 'Medicare Advantage Plans' && stepTextLower.includes('medicare advantage')) {
            return true;
          }
          if (currentQuoteType === 'Drug Plans' && stepTextLower.includes('drug plan')) {
            return true;
          }
          if (currentQuoteType === 'Hospital Indemnity' && stepTextLower.includes('hospital')) {
            return true;
          }
          if (currentQuoteType === 'Final Expense Life' && stepTextLower.includes('final expense')) {
            return true;
          }
          if (currentQuoteType === 'Cancer Insurance' && stepTextLower.includes('cancer')) {
            return true;
          }
          if (currentQuoteType === 'Dental Insurance' && stepTextLower.includes('dental')) {
            return true;
          }
          // Handle supplement plans - when processing individual supplements
          if (currentTypeLower.includes('supplement') && stepTextLower.includes('supplement')) {
            return true;
          }
          // Handle individual supplement plans (Plan F, Plan G, etc.)
          if (currentQuoteType.startsWith('Plan ') && stepTextLower.includes(currentTypeLower)) {
            return true;
          }
          // General matching
          if (stepTextLower.includes(currentTypeLower)) {
            return true;
          }
          
          return false;
        });
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
        const matchingStepIndex = steps.findIndex(step => {
          const stepTextLower = step.text.toLowerCase();
          const quoteTypeLower = quoteType.toLowerCase();
          
          // Handle specific quote type matching
          if (quoteType === 'Medicare Advantage Plans' && stepTextLower.includes('medicare advantage')) {
            return true;
          }
          if (quoteType === 'Drug Plans' && stepTextLower.includes('drug plan')) {
            return true;
          }
          if (quoteType === 'Supplement Plans' && stepTextLower.includes('supplement')) {
            return true;
          }
          // Handle individual supplement plans (Plan F, Plan G, etc.)
          if (quoteType.startsWith('Plan ') && stepTextLower.includes(quoteTypeLower)) {
            return true;
          }
          // Handle other quote types by checking if step text contains the quote type
          if (stepTextLower.includes(quoteTypeLower)) {
            return true;
          }
          
          return false;
        });
        
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
      {/* Individual Progress Bars Section */}
      <Card className="w-full max-w-2xl mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center mb-6">Getting Your Quotes</h3>
            
            {/* Individual Progress Bar for Each Quote Type */}
            {steps.map((step, index) => {
              const status = getStepStatus(step.text);
              const Icon = step.icon;
              
              // Get individual progress for this step
              const individualProgress = stepProgress.get(step.text) || 0;

              // Different animation characteristics for each category
              const getAnimationDuration = (stepText: string, isCompleted: boolean) => {
                if (isCompleted) return 0.5; // Fast completion animation for all
                
                const text = stepText.toLowerCase();
                if (text.includes('drug plan')) return 0.8; // Quick, snappy
                if (text.includes('medicare advantage')) return 1.0; // Moderate
                if (text.includes('supplement') || text.includes('plan ')) return 1.3; // Steady
                if (text.includes('dental')) return 1.6; // Methodical
                if (text.includes('cancer')) return 1.1; // Balanced
                if (text.includes('hospital')) return 0.9; // Responsive
                if (text.includes('final expense')) return 1.4; // Deliberate
                return 1.2; // Default
              };

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all ${
                    status.isCompleted ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' :
                    status.isActive ? 'border-primary/30 bg-primary/5' :
                    'border-border bg-card'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      status.isCompleted ? 'bg-green-500 text-white' :
                      status.isActive ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {status.isCompleted ? (
                        <CheckCircledIcon className="w-4 h-4" />
                      ) : (
                        <Icon className={`w-4 h-4 ${status.isActive ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                    
                    <span className={`font-medium flex-1 ${
                      status.isCompleted ? 'text-green-700 dark:text-green-300' :
                      status.isActive ? 'text-foreground' : 
                      'text-muted-foreground'
                    }`}>
                      {step.text}
                    </span>

                    {/* Status Badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status.isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      status.isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {status.isCompleted ? 'Complete' : status.isActive ? 'Loading...' : 'Waiting'}
                    </div>
                  </div>

                  {/* Individual Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${
                        status.isCompleted ? 'text-green-600 dark:text-green-400' :
                        status.isActive ? 'text-primary' :
                        'text-muted-foreground'
                      }`}>
                        Progress
                      </span>
                      <motion.span 
                        className={`font-medium ${
                          status.isCompleted ? 'text-green-600 dark:text-green-400' :
                          status.isActive ? 'text-primary' :
                          'text-muted-foreground'
                        }`}
                        key={Math.round(individualProgress)}
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {Math.round(individualProgress)}%
                      </motion.span>
                    </div>
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          status.isCompleted ? 'bg-green-500' :
                          status.isActive ? 'bg-primary' :
                          'bg-muted-foreground/20'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${individualProgress}%` }}
                        transition={{ 
                          duration: getAnimationDuration(step.text, status.isCompleted), 
                          ease: "easeInOut",
                          type: "tween"
                        }}
                      />
                    </div>
                  </div>

                  {/* Loading Animation for Active Step */}
                  {status.isActive && !status.isCompleted && (
                    <div className="flex items-center gap-1 mt-2 justify-end">
                      {/* Vary the bounce animation timing based on category */}
                      {(() => {
                        const text = step.text.toLowerCase();
                        let baseDelay = 0.1;
                        let delayMultiplier = 1;
                        
                        if (text.includes('drug plan')) {
                          baseDelay = 0.08; // Faster bounce
                        } else if (text.includes('medicare advantage')) {
                          baseDelay = 0.12; // Slightly slower
                        } else if (text.includes('dental')) {
                          baseDelay = 0.15; // More deliberate
                        } else if (text.includes('cancer')) {
                          baseDelay = 0.11; // Moderate
                        } else if (text.includes('hospital')) {
                          baseDelay = 0.09; // Quick
                        } else if (text.includes('final expense')) {
                          baseDelay = 0.14; // Steady
                        }
                        
                        return (
                          <>
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${baseDelay}s` }}></div>
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${baseDelay * 2}s` }}></div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              );
            })}
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
