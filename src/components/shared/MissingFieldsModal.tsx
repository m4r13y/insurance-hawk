import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface QuoteFormData {
  age: number | '';
  zipCode: string;
  gender: 'male' | 'female' | '';
  tobaccoUse: boolean | null;
  email?: string;
  firstName?: string;
  effectiveDate?: string;
  familyType?: 'individual' | 'family' | '';
  carcinomaInSitu?: boolean | null;
  premiumMode?: 'monthly' | 'annual' | '';
  coveredMembers?: string;
  desiredFaceValue?: string;
  benefitAmount?: string;
  state?: string;
}

interface MissingFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: QuoteFormData) => Promise<void>;
  categoryId: string;
  categoryName: string;
  missingFields: string[];
  initialFormData?: Partial<QuoteFormData>;
}

export function MissingFieldsModal({
  isOpen,
  onClose,
  onSubmit,
  categoryId,
  categoryName,
  missingFields,
  initialFormData = {}
}: MissingFieldsModalProps) {
  const [formInputs, setFormInputs] = useState<QuoteFormData>({
    age: '',
    zipCode: '',
    gender: '',
    tobaccoUse: null,
    familyType: '',
    carcinomaInSitu: null,
    premiumMode: '',
    coveredMembers: '',
    desiredFaceValue: '',
    benefitAmount: '',
    state: '',
    ...initialFormData
  });

  // Update form inputs when modal opens with initial data
  useEffect(() => {
    if (isOpen) {
      setFormInputs(prev => ({
        age: '',
        zipCode: '',
        gender: '',
        tobaccoUse: null,
        familyType: '',
        carcinomaInSitu: null,
        premiumMode: '',
        coveredMembers: '',
        desiredFaceValue: '',
        benefitAmount: '',
        state: '',
        ...initialFormData // Override with any existing data
      }));
    }
  }, [isOpen]); // Only run when modal opens, not when initialFormData changes

  // Debug: Watch for unexpected modal closures
  useEffect(() => {
    console.log('MissingFieldsModal isOpen changed to:', isOpen);
  }, [isOpen]);

  // Helper function to get required fields for each plan type
  const getRequiredFields = (category: string): string[] => {
    switch (category) {
      case 'advantage':
      case 'drug-plan':
      case 'dental':
      case 'hospital-indemnity':
      case 'final-expense':
        return ['zipCode'];
      case 'cancer':
        return ['age', 'gender', 'tobaccoUse'];
      case 'medigap':
      default:
        return ['age', 'zipCode', 'gender', 'tobaccoUse'];
    }
  };

  // Helper function to get additional required fields for specific plan types
  const getAdditionalFields = (category: string): string[] => {
    switch (category) {
      case 'cancer':
        return ['familyType', 'carcinomaInSitu', 'premiumMode', 'benefitAmount', 'state'];
      case 'dental':
        return ['coveredMembers'];
      case 'final-expense':
        return ['desiredFaceValue'];
      default:
        return [];
    }
  };

  // Check if we have all required data to generate quotes for a category
  const validateRequiredData = (category: string, data: QuoteFormData): { isValid: boolean; missing: string[] } => {
    const requiredFields = getRequiredFields(category);
    const additionalFields = getAdditionalFields(category);
    const allRequired = [...requiredFields, ...additionalFields];
    
    const missing = allRequired.filter(field => {
      const value = data[field as keyof QuoteFormData];
      return value === '' || value === null || value === undefined;
    });

    return {
      isValid: missing.length === 0,
      missing
    };
  };

  // Calculate missing fields internally based on category and current form data
  const calculatedMissingFields = (() => {
    const validation = validateRequiredData(categoryId, formInputs);
    return validation.missing;
  })();

  // Use calculated missing fields if missingFields prop is empty, otherwise use the prop
  const actualMissingFields = missingFields.length > 0 ? missingFields : calculatedMissingFields;

  // Handle form submission
  const handleSubmit = async () => {
    const validation = validateRequiredData(categoryId, formInputs);
    
    if (validation.isValid) {
      await onSubmit(formInputs);
    }
  };

  // Get friendly field names for display
  const getFieldDisplayName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      age: 'Age',
      zipCode: 'ZIP Code',
      gender: 'Gender',
      tobaccoUse: 'Tobacco Use',
      familyType: 'Family Type',
      carcinomaInSitu: 'Carcinoma In Situ Benefit',
      premiumMode: 'Premium Payment Mode',
      coveredMembers: 'Number of Covered Members',
      desiredFaceValue: 'Desired Face Value',
      benefitAmount: 'Benefit Amount',
      state: 'State'
    };
    return fieldNames[field] || field;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Additional Information Required</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To generate quotes for{' '}
            <span className="font-medium">{categoryName}</span>
            , we need a bit more information:
          </p>
          
          <div className="space-y-3">
            {actualMissingFields.includes('age') && (
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formInputs.age}
                  onChange={(e) => setFormInputs(prev => ({ 
                    ...prev, 
                    age: e.target.value ? parseInt(e.target.value) : '' 
                  }))}
                />
              </div>
            )}
            
            {actualMissingFields.includes('zipCode') && (
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="Enter your ZIP code"
                  value={formInputs.zipCode}
                  onChange={(e) => setFormInputs(prev => ({ 
                    ...prev, 
                    zipCode: e.target.value 
                  }))}
                />
              </div>
            )}
            
            {actualMissingFields.includes('gender') && (
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formInputs.gender} 
                  onValueChange={(value) => setFormInputs(prev => ({ 
                    ...prev, 
                    gender: value as 'male' | 'female' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {actualMissingFields.includes('tobaccoUse') && (
              <div className="space-y-2">
                <Label>Tobacco Use</Label>
                <Select 
                  value={formInputs.tobaccoUse === null ? '' : formInputs.tobaccoUse.toString()} 
                  onValueChange={(value) => setFormInputs(prev => ({ 
                    ...prev, 
                    tobaccoUse: value === 'true' ? true : false 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Do you use tobacco?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {actualMissingFields.includes('state') && categoryId !== 'cancer' && (
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select 
                  value={formInputs.state} 
                  onValueChange={(value) => setFormInputs(prev => ({ 
                    ...prev, 
                    state: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
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
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Cancer Insurance specific fields */}
            {categoryId === 'cancer' && (
              <>
                {actualMissingFields.includes('state') && (
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select 
                      value={formInputs.state} 
                      onValueChange={(value) => setFormInputs(prev => ({ 
                        ...prev, 
                        state: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Cancer insurance is currently only available in Texas and Georgia
                    </p>
                  </div>
                )}
                
                {actualMissingFields.includes('familyType') && (
                  <div className="space-y-2">
                    <Label>Coverage Type</Label>
                    <Select 
                      value={formInputs.familyType} 
                      onValueChange={(value) => setFormInputs(prev => ({ 
                        ...prev, 
                        familyType: value as 'individual' | 'family' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select coverage type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {actualMissingFields.includes('carcinomaInSitu') && (
                  <div className="space-y-2">
                    <Label>Carcinoma In Situ Benefit</Label>
                    <Select 
                      value={formInputs.carcinomaInSitu === null || formInputs.carcinomaInSitu === undefined ? '' : formInputs.carcinomaInSitu.toString()} 
                      onValueChange={(value) => setFormInputs(prev => ({ 
                        ...prev, 
                        carcinomaInSitu: value === 'true' ? true : false 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose benefit percentage for carcinoma in situ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">25% of benefit amount</SelectItem>
                        <SelectItem value="true">100% of benefit amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {actualMissingFields.includes('premiumMode') && (
                  <div className="space-y-2">
                    <Label>Premium Payment Mode</Label>
                    <Select 
                      value={formInputs.premiumMode} 
                      onValueChange={(value) => setFormInputs(prev => ({ 
                        ...prev, 
                        premiumMode: value as 'monthly' | 'annual' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Bank Draft</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {actualMissingFields.includes('benefitAmount') && (
                  <div className="space-y-2">
                    <Label>Benefit Amount</Label>
                    <Select 
                      value={formInputs.benefitAmount} 
                      onValueChange={(value) => setFormInputs(prev => ({ 
                        ...prev, 
                        benefitAmount: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select benefit amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10000">$10,000</SelectItem>
                        <SelectItem value="25000">$25,000</SelectItem>
                        <SelectItem value="50000">$50,000</SelectItem>
                        <SelectItem value="75000">$75,000</SelectItem>
                        <SelectItem value="100000">$100,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
            
            {/* Dental Insurance specific fields */}
            {categoryId === 'dental' && actualMissingFields.includes('coveredMembers') && (
              <div className="space-y-2">
                <Label htmlFor="coveredMembers">Number of Covered Members</Label>
                <Input
                  id="coveredMembers"
                  placeholder="e.g., 1, 2, 3+"
                  value={formInputs.coveredMembers}
                  onChange={(e) => setFormInputs(prev => ({ 
                    ...prev, 
                    coveredMembers: e.target.value 
                  }))}
                />
              </div>
            )}
            
            {/* Final Expense specific fields */}
            {categoryId === 'final-expense' && actualMissingFields.includes('desiredFaceValue') && (
              <div className="space-y-2">
                <Label htmlFor="desiredFaceValue">Desired Coverage Amount</Label>
                <Select 
                  value={formInputs.desiredFaceValue} 
                  onValueChange={(value) => setFormInputs(prev => ({ 
                    ...prev, 
                    desiredFaceValue: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coverage amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000">$10,000</SelectItem>
                    <SelectItem value="15000">$15,000</SelectItem>
                    <SelectItem value="20000">$20,000</SelectItem>
                    <SelectItem value="25000">$25,000</SelectItem>
                    <SelectItem value="50000">$50,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Generate Quotes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Export helper functions for use in other components
export const getRequiredFields = (category: string): string[] => {
  switch (category) {
    case 'advantage':
    case 'drug-plan':
    case 'dental':
    case 'hospital-indemnity':
    case 'final-expense':
      return ['zipCode'];
    case 'cancer':
      return ['age', 'gender', 'tobaccoUse'];
    case 'medigap':
    default:
      return ['age', 'zipCode', 'gender', 'tobaccoUse'];
  }
};

export const getAdditionalFields = (category: string): string[] => {
  switch (category) {
    case 'cancer':
      return ['familyType', 'carcinomaInSitu', 'premiumMode', 'benefitAmount', 'state'];
    case 'dental':
      return ['coveredMembers'];
    case 'final-expense':
      return ['desiredFaceValue'];
    default:
      return [];
  }
};

export const validateRequiredData = (category: string, data: QuoteFormData): { isValid: boolean; missing: string[] } => {
  const requiredFields = getRequiredFields(category);
  const additionalFields = getAdditionalFields(category);
  const allRequired = [...requiredFields, ...additionalFields];
  
  const missing = allRequired.filter(field => {
    const value = data[field as keyof QuoteFormData];
    return value === '' || value === null || value === undefined;
  });

  return {
    isValid: missing.length === 0,
    missing
  };
};
