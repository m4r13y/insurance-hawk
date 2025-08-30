"use client";

import React, { useState, useEffect } from "react";
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
  ReloadIcon
} from "@radix-ui/react-icons";

interface MedicareQuoteLoadingPageProps {
  quoteType: 'medigap' | 'advantage' | 'both';
  zipCode?: string;
  age?: string;
  selectedCategories?: string[];
  onComplete?: () => void;
}

const loadingSteps = {
  medigap: [
    { id: 1, text: "Analyzing your location and age", icon: MagnifyingGlassIcon, duration: 2000 },
    { id: 2, text: "Searching licensed carriers in your area", icon: LockClosedIcon, duration: 3000 },
    { id: 3, text: "Calculating real-time Medigap premiums", icon: TokensIcon, duration: 2500 },
    { id: 4, text: "Comparing plan benefits and coverage", icon: FileTextIcon, duration: 2000 },
    { id: 5, text: "Finalizing your personalized quotes", icon: CheckCircledIcon, duration: 1500 }
  ],
  advantage: [
    { id: 1, text: "Locating Medicare Advantage plans in your area", icon: MagnifyingGlassIcon, duration: 2500 },
    { id: 2, text: "Verifying plan availability for 2025", icon: LockClosedIcon, duration: 2000 },
    { id: 3, text: "Analyzing costs and benefits", icon: TokensIcon, duration: 3000 },
    { id: 4, text: "Checking doctor and hospital networks", icon: FileTextIcon, duration: 2500 },
    { id: 5, text: "Preparing your comparison results", icon: CheckCircledIcon, duration: 2000 }
  ],
  both: [
    { id: 1, text: "Analyzing your Medicare needs", icon: MagnifyingGlassIcon, duration: 2000 },
    { id: 2, text: "Searching Medicare Supplement plans", icon: LockClosedIcon, duration: 2500 },
    { id: 3, text: "Finding Medicare Advantage options", icon: TokensIcon, duration: 2500 },
    { id: 4, text: "Calculating premiums and benefits", icon: FileTextIcon, duration: 2500 },
    { id: 5, text: "Comparing all your options", icon: CheckCircledIcon, duration: 2000 },
    { id: 6, text: "Preparing your personalized results", icon: CheckCircledIcon, duration: 1500 }
  ]
};

const quoteTypeLabels = {
  medigap: "Medicare Supplement",
  advantage: "Medicare Advantage", 
  both: "Medicare Plans"
};

const tips = {
  medigap: [
    "Medigap plans are standardized - Plan F covers the same benefits regardless of the carrier",
    "You have a guaranteed issue period when you first become eligible for Medicare",
    "Compare premiums carefully as benefits are standardized but costs vary by carrier"
  ],
  advantage: [
    "Medicare Advantage plans often include prescription drug coverage",
    "Check if your doctors are in the plan's network before enrolling", 
    "Many plans offer extra benefits like dental, vision, or wellness programs"
  ],
  both: [
    "Medicare Supplement and Medicare Advantage are two different ways to get Medicare coverage",
    "You can only have one or the other - not both at the same time",
    "Compare costs, networks, and benefits to find what works best for you"
  ]
};

export default function MedicareQuoteLoadingPage({ 
  quoteType, 
  zipCode, 
  age, 
  selectedCategories,
  onComplete 
}: MedicareQuoteLoadingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  const steps = loadingSteps[quoteType];
  const currentTips = tips[quoteType];

  useEffect(() => {
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
        runStep(stepIndex + 1);
      }, stepDuration);
    };

    runStep(0);

    return () => {
      clearTimeout(stepTimeout);
      clearInterval(progressInterval);
    };
  }, [steps, onComplete]);

  // Rotate tips every 3 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % currentTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [currentTips.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <ReloadIcon className="w-8 h-8 text-primary animate-spin" />
          <Badge variant="secondary" className="text-sm">
            {quoteTypeLabels[quoteType]} Quotes
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Finding Your Perfect Plans
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl">
          We're searching through hundreds of plans from licensed carriers to find the best options for your needs.
        </p>

        {(zipCode || age) && (
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            {zipCode && <span>📍 {zipCode}</span>}
            {age && <span>👤 Age {age}</span>}
          </div>
        )}

        {selectedCategories && selectedCategories.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category === 'medigap' ? 'Medicare Supplement' : 
                 category === 'advantage' ? 'Medicare Advantage' : category}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Progress Section */}
      <Card className="w-full max-w-2xl mb-8">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Step */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
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
