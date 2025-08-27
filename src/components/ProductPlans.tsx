import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { InfoCircledIcon, VideoIcon } from '@radix-ui/react-icons'

interface Plan {
  id: string
  name: string
  description: string
  isPopular?: boolean
  premiumRange?: string
  features: string[]
}

interface ProductPlansProps {
  plans: Plan[]
  selectedPlan: string | null
  onPlanSelect: (planId: string) => void
  categoryName: string
}

export default function ProductPlans({ 
  plans, 
  selectedPlan, 
  onPlanSelect,
  categoryName 
}: ProductPlansProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  return (
    <div className="lg:w-96 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Mobile Section Headers */}
        <div className="lg:hidden">
          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plans Available</h3>
            <Badge variant="outline" className="text-xs">
              {plans.length} Options
            </Badge>
          </div>

          {/* Mobile: Horizontal scroll for plan cards */}
          <div className="lg:space-y-4 lg:block flex gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex-shrink-0 w-72 lg:w-full cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? "ring-2 ring-blue-600 border-primary"
                    : "hover:border-blue-300"
                }`}
                onClick={() => onPlanSelect(plan.id)}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        {plan.isPopular && (
                          <Badge className="bg-warning/20 text-warning text-xs border-warning/30">
                            Popular
                          </Badge>
                        )}
                      </div>
                      {plan.premiumRange && (
                        <div className="text-sm font-semibold text-primary">
                          {plan.premiumRange}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      {/* Info Button */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <InfoCircledIcon className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle>{plan.name} Details</SheetTitle>
                            <SheetDescription>
                              Complete information about this {categoryName.toLowerCase()} plan
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                            {plan.premiumRange && (
                              <div>
                                <h4 className="font-semibold mb-2">Premium Range</h4>
                                <p className="text-sm text-primary font-medium">{plan.premiumRange}</p>
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold mb-2">Key Features</h4>
                              <ul className="space-y-1">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-success mt-0.5">•</span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>

                      {/* Quote Button */}
                      <Button size="sm" className="h-8 text-xs" onClick={(e) => e.stopPropagation()}>
                        Quote
                      </Button>
                      
                      {/* Video Button */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <VideoIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <CardDescription className="text-sm leading-relaxed">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-card-foreground">Key Features:</div>
                    <div className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-success text-xs mt-0.5">✓</span>
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedPlan(expandedPlan === plan.id ? null : plan.id)
                          }}
                          className="text-xs text-primary hover:text-primary/80 font-medium"
                        >
                          {expandedPlan === plan.id ? 'Show Less' : `+${plan.features.length - 3} More`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Info Content */}
                  {expandedPlan === plan.id && plan.features.length > 3 && (
                    <div className="space-y-1 pt-2 border-t border-border">
                      {plan.features.slice(3).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-success text-xs mt-0.5">✓</span>
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
