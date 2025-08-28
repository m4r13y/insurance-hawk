"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckIcon, 
  StarFilledIcon,
  PersonIcon,
  BookmarkIcon,
  PlusIcon,
  InfoCircledIcon,
  Cross2Icon
} from '@radix-ui/react-icons';

interface PlanOption {
  id: string;
  name: string;
  monthlyPremium: number;
  deductible: string;
  features: string[];
  pros: string[];
  cons: string[];
  carrierName: string;
  planType: string;
  discounts?: Array<{
    name: string;
    type: 'percent' | 'dollar';
    value: number;
  }>;
}

interface AddOnOption {
  id: string;
  name: string;
  description: string;
  monthlyPremium: number;
  category: 'drug' | 'cancer' | 'dental' | 'vision' | 'life';
  popular?: boolean;
}

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  carrierName: string;
  planOptions: PlanOption[];
  addOnOptions: AddOnOption[];
  onSelectPlan: (plan: PlanOption, addOns: AddOnOption[]) => void;
}

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  carrierName,
  planOptions,
  addOnOptions,
  onSelectPlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(
    planOptions.length === 1 ? planOptions[0] : null
  );
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const calculateTotal = () => {
    const planCost = selectedPlan?.monthlyPremium || 0;
    const addOnsCost = selectedAddOns.reduce((sum, addOn) => sum + addOn.monthlyPremium, 0);
    return planCost + addOnsCost;
  };

  const handleAddOnToggle = (addOn: AddOnOption) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(item => item.id === addOn.id);
      if (exists) {
        return prev.filter(item => item.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const handleSelectNow = () => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan, selectedAddOns);
      onClose();
    }
  };

  const handleSaveForLater = () => {
    if (!accountData.firstName || !accountData.lastName || !accountData.email) {
      setShowAccountForm(true);
      return;
    }
    
    // TODO: Implement account creation and save functionality
    console.log('Saving for later:', { selectedPlan, selectedAddOns, accountData });
    onClose();
  };

  // Get only the most popular add-ons to keep it simple
  const popularAddOns = addOnOptions.filter(addon => 
    addon.popular || addon.category === 'drug' || addon.category === 'cancer'
  ).slice(0, 4);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Choose Your {carrierName} Plan
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Cross2Icon className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection */}
          <div>
            <h3 className="font-semibold mb-3">
              {planOptions.length > 1 ? 'Select Your Plan Version' : 'Your Selected Plan'}
            </h3>
            
            {planOptions.length === 1 ? (
              // Single plan - just show it
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{planOptions[0].name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Plan {planOptions[0].planType} • {planOptions[0].deductible}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        ${planOptions[0].monthlyPremium}/mo
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Multiple plans - let them choose
              <div className="space-y-3">
                {planOptions.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-border hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan?.id === plan.id 
                              ? 'bg-primary border-primary' 
                              : 'border-gray-300'
                          }`}>
                            {selectedPlan?.id === plan.id && (
                              <CheckIcon className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{plan.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Plan {plan.planType} • {plan.deductible}
                            </p>
                            {plan.discounts && plan.discounts.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {plan.discounts.slice(0, 2).map((discount, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {discount.type === 'percent' ? `${Math.round(discount.value * 100)}% off` : `$${discount.value} off`}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            ${plan.monthlyPremium}/mo
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Popular Add-ons */}
          {popularAddOns.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Recommended Add-ons</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your coverage with these popular additions
              </p>
              
              <div className="space-y-3">
                {popularAddOns.map((addOn) => (
                  <Card 
                    key={addOn.id} 
                    className={`cursor-pointer transition-all ${
                      selectedAddOns.find(item => item.id === addOn.id)
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-border hover:shadow-sm'
                    }`}
                    onClick={() => handleAddOnToggle(addOn)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={!!selectedAddOns.find(item => item.id === addOn.id)}
                            onChange={() => {}} // Handled by card click
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{addOn.name}</h4>
                              {addOn.popular && (
                                <Badge variant="secondary" className="text-xs">
                                  <StarFilledIcon className="w-3 h-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{addOn.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${addOn.monthlyPremium}/mo</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Summary and Actions */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Monthly Total</h3>
              <div className="text-2xl font-bold text-primary">
                ${calculateTotal()}/mo
              </div>
            </div>

            {selectedPlan && (
              <div className="text-sm text-muted-foreground mb-4">
                <div>✓ {selectedPlan.name} (${selectedPlan.monthlyPremium}/mo)</div>
                {selectedAddOns.map((addOn) => (
                  <div key={addOn.id}>✓ {addOn.name} (+${addOn.monthlyPremium}/mo)</div>
                ))}
              </div>
            )}

            {!showAccountForm ? (
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleSaveForLater}
                  className="flex items-center gap-2"
                  disabled={!selectedPlan}
                >
                  <BookmarkIcon className="w-4 h-4" />
                  Save for Later
                </Button>
                <Button 
                  onClick={handleSelectNow}
                  className="flex items-center gap-2 flex-1"
                  disabled={!selectedPlan}
                >
                  <PlusIcon className="w-4 h-4" />
                  Continue with This Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Save Your Selection</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a free account to save this plan and compare later
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <Input
                      id="firstName"
                      value={accountData.firstName}
                      onChange={(e) => setAccountData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      value={accountData.lastName}
                      onChange={(e) => setAccountData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAccountForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveForLater}
                    className="flex items-center gap-2 flex-1"
                    disabled={!accountData.firstName || !accountData.lastName || !accountData.email}
                  >
                    <PersonIcon className="w-4 h-4" />
                    Save Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectionModal;
