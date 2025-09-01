import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ResetIcon, PlusIcon, UpdateIcon, CheckIcon, StarFilledIcon } from "@radix-ui/react-icons";
import MedicareNavigationTabs from "@/components/MedicareNavigationTabs";

interface QuoteFormData {
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
  state?: string;
}

interface MedicareShopLayoutProps {
  children: React.ReactNode;
  hasQuotes: boolean;
  cartCount: number;
  selectedFlowCategories: string[];
  activeCategory: string;
  selectedCategory: string;
  productCategories: any[];
  onCategoryToggle: (category: 'medigap' | 'advantage' | 'drug-plan' | 'dental' | 'cancer' | 'hospital-indemnity' | 'final-expense') => void;
  onCategorySelect: (category: string) => void;
  onReset: () => void;
  // New props for quote generation
  quoteFormData?: QuoteFormData;
  onGenerateQuotes?: (category: string, formData: QuoteFormData) => Promise<void>;
  loadingCategories?: string[];
  completedQuoteTypes?: string[];
}

export default function MedicareShopLayout({
  children,
  hasQuotes,
  cartCount,
  selectedFlowCategories,
  activeCategory,
  selectedCategory,
  productCategories,
  onCategoryToggle,
  onCategorySelect,
  onReset,
  quoteFormData,
  onGenerateQuotes,
  loadingCategories = [],
  completedQuoteTypes = []
}: MedicareShopLayoutProps) {
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
  const [selectedCategoryForQuote, setSelectedCategoryForQuote] = useState<string>('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
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
    state: ''
  });

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
        return ['familyType', 'carcinomaInSitu', 'premiumMode', 'state'];
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

  // Check if a category is completed based on completedQuoteTypes
  const isCategoryCompleted = (category: string): boolean => {
    const categoryMapping: Record<string, string[]> = {
      'medigap': ['Supplement Plans', 'Plan F', 'Plan G', 'Plan N'],
      'advantage': ['Medicare Advantage Plans'],
      'drug-plan': ['Drug Plans'],
      'dental': ['Dental Insurance'],
      'cancer': ['Cancer Insurance'],
      'hospital-indemnity': ['Hospital Indemnity'],
      'final-expense': ['Final Expense Life']
    };
    
    const expectedCompletionTypes = categoryMapping[category] || [];
    return expectedCompletionTypes.some(type => completedQuoteTypes.includes(type));
  };

  // Get display content for category button (name, spinner, or checkmark)
  const getCategoryButtonContent = (category: string, displayName: string) => {
    const isLoading = loadingCategories.includes(category);
    const isCompleted = isCategoryCompleted(category);
    
    if (isLoading) {
      return <UpdateIcon className="h-4 w-4 animate-spin" />;
    }
    
    if (isCompleted) {
      return displayName;
    }
    
    return displayName;
  };

  // Filter categories to only show those without quotes AND not completed
  const availableCategories = productCategories.filter(category => {
    return category.plans.length === 0 && !isCategoryCompleted(category.id); // Only show categories with no quotes and not completed
  });

  // Check if we should show the "More Quotes" button at all
  const shouldShowMoreButton = availableCategories.length > 0;

  // Close dropdown when all available categories are either loading or completed
  useEffect(() => {
    if (showMoreCategories) {
      const allCategoriesProcessed = availableCategories.length === 0;
      if (allCategoriesProcessed) {
        // Add a small delay for better UX when the last category completes
        const timer = setTimeout(() => {
          setShowMoreCategories(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [availableCategories.length, showMoreCategories]);

  // Auto-close dropdown after 3 seconds if there are loading categories
  useEffect(() => {
    if (showMoreCategories && loadingCategories.length > 0) {
      const timer = setTimeout(() => {
        setShowMoreCategories(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showMoreCategories, loadingCategories.length]);

  // SIMPLE APPROACH: Prevent background scroll when modals are open
  useEffect(() => {
    const hasOpenModal = showMoreCategories || showMissingFieldsModal;
    
    if (hasOpenModal) {
      // Disable background scrolling
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original scrolling
        document.body.style.overflow = originalStyle;
      };
    }
  }, [showMoreCategories, showMissingFieldsModal]);

  // Handle category selection and quote generation
  const handleCategoryQuoteGeneration = async (category: string) => {
    if (!quoteFormData || !onGenerateQuotes) {
      // Fallback to regular category selection if no quote generation available
      onCategorySelect(category);
      setShowMoreCategories(false);
      return;
    }

    const validation = validateRequiredData(category, quoteFormData);
    
    if (validation.isValid) {
      // We have all required data, generate quotes immediately
      await onGenerateQuotes(category, quoteFormData);
      setShowMoreCategories(false);
    } else {
      // Show modal with missing fields
      setSelectedCategoryForQuote(category);
      setMissingFields(validation.missing);
      
      // Pre-fill form with existing data
      setFormInputs({
        ...formInputs,
        ...quoteFormData
      });
      
      setShowMissingFieldsModal(true);
      setShowMoreCategories(false);
    }
  };

  // Handle form submission from missing fields modal
  const handleMissingFieldsSubmit = async () => {
    const validation = validateRequiredData(selectedCategoryForQuote, formInputs);
    
    if (validation.isValid && onGenerateQuotes) {
      // Close the modal first
      setShowMissingFieldsModal(false);
      
      // Keep the dropdown open to show loading/completion states
      setShowMoreCategories(true);
      
      // Generate quotes with the same flow
      await onGenerateQuotes(selectedCategoryForQuote, formInputs);
      
      // Clear selection after quote generation
      setSelectedCategoryForQuote('');
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
      state: 'State'
    };
    return fieldNames[field] || field;
  };

  // Determine button text based on number of quote types generated
  const getMoreQuotesButtonText = () => {
    if (selectedFlowCategories.length === 1) {
      return "More Quotes";
    }
    return "+";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Show Shopping Header Only When There Are Quotes */}
      {hasQuotes && (
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Cart Summary */}
            <div className="flex items-center gap-4">
              {cartCount > 0 && (
                <Badge variant="outline" className="px-3 py-1">
                  {cartCount} plan{cartCount !== 1 ? 's' : ''} selected
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Type Controls - Single Row Layout */}
      {hasQuotes && (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left Side - Reset Button and Plan Toggle */}
            <div className="flex items-center gap-3">
              {/* Reset Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    title="Clear all quotes and start over"
                  >
                    <ResetIcon className="h-4 w-4" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all your quotes, form data, and filters. You'll need to start over from the beginning. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Plan Type Toggle - Now includes all insurance types */}
              {(selectedFlowCategories.includes('medigap') || selectedFlowCategories.includes('advantage') || selectedFlowCategories.includes('drug-plan') || 
                selectedFlowCategories.includes('dental') || selectedFlowCategories.includes('cancer') || selectedFlowCategories.includes('hospital-indemnity') || 
                selectedFlowCategories.includes('final-expense')) && selectedFlowCategories.length > 1 && (
                <div className="flex items-center gap-2 p-1 bg-background rounded-lg border flex-wrap">
                  {selectedFlowCategories.includes('medigap') && (
                    <Button
                      variant={activeCategory === 'medigap' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onCategoryToggle('medigap')}
                      className="flex-1 min-w-fit"
                    >
                      {getCategoryButtonContent('medigap', 'Medicare Supplement')}
                    </Button>
                  )}
                  {selectedFlowCategories.includes('advantage') && (
                    <Button
                      variant={activeCategory === 'advantage' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onCategoryToggle('advantage')}
                      className="flex-1 min-w-fit"
                    >
                      {getCategoryButtonContent('advantage', 'Medicare Advantage')}
                    </Button>
                  )}
                  {selectedFlowCategories.includes('drug-plan') && (
                    <Button
                      variant={activeCategory === 'drug-plan' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onCategoryToggle('drug-plan')}
                      className="flex-1 min-w-fit"
                    >
                      {getCategoryButtonContent('drug-plan', 'Drug Plans')}
                    </Button>
                  )}
                  {selectedFlowCategories.includes('dental') && (
                    <Button
                      variant={activeCategory === 'dental' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onCategoryToggle('dental')}
                      className="flex-1 min-w-fit"
                    >
                      {getCategoryButtonContent('dental', 'Dental')}
                    </Button>
                  )}
                  {selectedFlowCategories.includes('cancer') && (
                    <Button
                      variant={activeCategory === 'cancer' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onCategoryToggle('cancer')}
                      className="flex-1 min-w-fit"
                    >
                      {getCategoryButtonContent('cancer', 'Cancer')}
                    </Button>
                  )}
                  {selectedFlowCategories.includes('hospital-indemnity') && (
                    <Button
                      variant={activeCategory === 'hospital-indemnity' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onCategoryToggle('hospital-indemnity')}
                      className="flex-1 min-w-fit"
                    >
                      {getCategoryButtonContent('hospital-indemnity', 'Hospital')}
                    </Button>
                  )}
                  {selectedFlowCategories.includes('final-expense') && (
                    <Button
                      variant={activeCategory === 'final-expense' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onCategoryToggle('final-expense')}
                      className="flex-1 min-w-fit"
                    >
                      {getCategoryButtonContent('final-expense', 'Final Expense')}
                    </Button>
                  )}
                </div>
              )}

              {/* More Quotes Button - Only show if there are categories without quotes */}
              {shouldShowMoreButton && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    title="Generate quotes for additional plan types"
                    onClick={() => setShowMoreCategories(true)}
                  >
                    {selectedFlowCategories.length === 1 ? (
                      "More Quotes"
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <Dialog open={showMoreCategories} onOpenChange={setShowMoreCategories}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Generate Additional Quotes</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                          Generate quotes for plan types you haven't quoted yet
                        </p>
                      </DialogHeader>
                      
                      <div className="space-y-3">
                        {/* Show currently loading categories */}
                        {loadingCategories.map((categoryId) => {
                          const categoryInfo = productCategories.find(cat => cat.id === categoryId);
                          if (!categoryInfo) return null;
                          
                          return (
                            <div
                              key={`loading-${categoryId}`}
                              className="w-full justify-start text-left h-auto p-3 border rounded-md bg-blue-50 dark:bg-blue-950"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col items-start">
                                  <span className="font-medium text-sm text-blue-700 dark:text-blue-300">
                                    {categoryInfo.name}
                                  </span>
                                  <span className="text-xs text-blue-600 dark:text-blue-400">
                                    Generating quotes...
                                  </span>
                                </div>
                                <UpdateIcon className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          );
                        })}

                        {/* Show recently completed categories with green check */}
                        {productCategories
                          .filter(category => 
                            isCategoryCompleted(category.id) && 
                            !loadingCategories.includes(category.id) &&
                            category.plans.length === 0
                          )
                          .map((category) => (
                            <div
                              key={`completed-${category.id}`}
                              className="w-full justify-start text-left h-auto p-3 border rounded-md bg-green-50 dark:bg-green-950"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col items-start">
                                  <span className="font-medium text-sm text-green-700 dark:text-green-300">
                                    {category.name}
                                  </span>
                                  <span className="text-xs text-green-600 dark:text-green-400">
                                    Quotes generated successfully!
                                  </span>
                                </div>
                                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                            </div>
                          ))
                        }

                        {/* Show available categories for quote generation */}
                        {availableCategories.map((category) => {
                          const isLoading = loadingCategories.includes(category.id);
                          const isCompleted = isCategoryCompleted(category.id);
                          
                          // Don't show if loading or completed (handled above)
                          if (isLoading || isCompleted) return null;
                          
                          return (
                            <Button
                              key={category.id}
                              variant="ghost"
                              className="w-full justify-start text-left h-auto p-3"
                              onClick={() => handleCategoryQuoteGeneration(category.id)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col items-start">
                                  <span className="font-medium text-sm">{category.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Click to generate quotes
                                  </span>
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                        
                        {/* Show message when all categories are processed */}
                        {availableCategories.length === 0 && loadingCategories.length === 0 && (
                          <div className="text-center py-4">
                            <div className="flex items-center justify-center mb-2">
                              <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                All Available Quotes Generated!
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              You have quotes for all available plan types
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>

            {/* Center - Empty space for balanced layout */}
            <div className="flex-1"></div>

            {/* Right Side - Navigation Tabs */}
            <div className="flex items-center">
              <MedicareNavigationTabs />
            </div>
          </div>
        </div>
      )}

      {children}
      
      {/* Missing Fields Modal */}
      <Dialog open={showMissingFieldsModal} onOpenChange={setShowMissingFieldsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Additional Information Required</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To generate quotes for{' '}
              <span className="font-medium">
                {availableCategories.find(cat => cat.id === selectedCategoryForQuote)?.name}
              </span>
              , we need a bit more information:
            </p>
            
            <div className="space-y-3">
              {missingFields.includes('age') && (
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
              
              {missingFields.includes('zipCode') && (
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
              
              {missingFields.includes('gender') && (
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
              
              {missingFields.includes('tobaccoUse') && (
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
              
              {missingFields.includes('state') && selectedCategoryForQuote !== 'cancer' && (
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
              {selectedCategoryForQuote === 'cancer' && (
                <>
                  {missingFields.includes('state') && (
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
                  
                  {missingFields.includes('familyType') && (
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
                  
                  {missingFields.includes('carcinomaInSitu') && (
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
                  
                  {missingFields.includes('premiumMode') && (
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
                </>
              )}
              
              {/* Dental Insurance specific fields */}
              {selectedCategoryForQuote === 'dental' && missingFields.includes('coveredMembers') && (
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
              {selectedCategoryForQuote === 'final-expense' && missingFields.includes('desiredFaceValue') && (
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
            <Button variant="outline" onClick={() => setShowMissingFieldsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleMissingFieldsSubmit}>
              Generate Quotes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
