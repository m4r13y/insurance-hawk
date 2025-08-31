// Test script to verify hospital indemnity field requirements
const testFormData = {
  planCategories: [],
  selectedAdditionalOptions: ['hospital'],
  medicareStatus: "browsing",
  newMedicareChoice: "",
  currentMedicareType: "",
  supplementAction: "",
  advantageAction: "",
  doctors: [],
  medications: [],
  currentPlan: "",
  age: "",
  gender: "",
  zipCode: "",
  state: "",
  tobaccoUse: null,
  benefitAmount: "",
  familyType: "",
  carcinomaInSitu: null,
  premiumMode: "",
  coveredMembers: "",
  desiredFaceValue: "",
  underwritingType: ""
};

// Simulate the getRequiredFields function logic
function getRequiredFields() {
  const fields = {
    zipCode: false,
    state: false,
    gender: false,
    age: false,
    tobaccoUse: false,
    benefitAmount: false,
    familyType: false,
    carcinomaInSitu: false,
    premiumMode: false,
    coveredMembers: false,
    desiredFaceValue: false,
    desiredRate: false,
    underwritingType: false
  }

  // Check selected plan categories
  const hasAdvantage = testFormData.planCategories.includes('advantage')
  const hasMedigap = testFormData.planCategories.includes('medigap')
  const hasPartD = testFormData.planCategories.includes('partd')
  
  // Check selected additional options
  const hasDental = testFormData.selectedAdditionalOptions.includes('dental')
  const hasCancer = testFormData.selectedAdditionalOptions.includes('cancer')
  const hasHospital = testFormData.selectedAdditionalOptions.includes('hospital')
  const hasFinalExpense = testFormData.selectedAdditionalOptions.includes('final-expense')

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

  return fields
}

console.log('🏥 Testing Hospital Indemnity Field Requirements');
console.log('Selected options:', testFormData.selectedAdditionalOptions);

const requiredFields = getRequiredFields();
console.log('Required fields:', requiredFields);

// Check if all required hospital indemnity fields are present
const hospitalRequiredFields = ['zipCode', 'age', 'gender', 'tobaccoUse'];
const actualRequiredFields = Object.keys(requiredFields).filter(key => requiredFields[key]);

console.log('\n📋 Hospital Indemnity API Requirements Check:');
console.log('Expected fields:', hospitalRequiredFields);
console.log('Actual required fields:', actualRequiredFields);

let allRequiredFieldsPresent = true;
hospitalRequiredFields.forEach(field => {
  const isPresent = requiredFields[field];
  console.log(`- ${field}: ${isPresent ? '✅' : '❌'}`);
  if (!isPresent) allRequiredFieldsPresent = false;
});

console.log('\n🎯 Result:', allRequiredFieldsPresent ? '✅ All required fields are present!' : '❌ Missing required fields');
