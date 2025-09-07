# Medicare Advantage Results Card Edits
Carefully make edits to the UI/UX of the Medicare Advantage results components used on the Medicare Shop when quotes are generated.

# General Edits
1. Move Plan Types options to the filter sidebar.
2. In place of the Plan Types (in the same row as 'Medicare Avdantage / Showing x-x of x plans' but on the right side), add two icons, one for list view and one for card view.
3. Set list view as the default view
4. When list view is active, show a dropdown next to the icons. The dropdown should show Column Options.
5. Add compare plan functionality for up to 3 plans. 
6. Change Add to Compare button icon
7. Add plan specific search functionality. Add a search icon as a small tab at the end of the tabs. When clicked, show a search bar and allow the user to search for specific details about that plan. 

## List View
 When a row is clicked, it should show an expanded view of that row. The other rows should remain collapsed unless clicked.

### List Table
1. Use a simple table to show details.

### Columns
The required columns (i.e. Plan Info) should be excluded from the dropdown options since they're always required.
#### Required Columns
1. Plan info (always first column)
- Plan Name (i.e. 'Humana Gold Plus (HMO)')
- Plan ID (i.e. 'H0028-043-001')
- Company Name (i.e. Humana)
- Plan Rating (Stars)
2. Monthly Premium (always 2nd to last column)
- Show Part B Giveback under monthly premium if applicable
3. Annual Cost (always last column)

#### Default Active Columns
1. Max Out-of-Pocket
- In-Network
- Combined (In-Network + Out-of-Network) (if applicable)
2. Drug Deductible

#### Other Column Options
1. Dental (checkmark or x if there's a benefit)
2. Medical Deductible (value)
3. Primary Care Co-pay (value)
4. Specialist Co-pay (value)
5. OTC benefit (value)
6. Vision (checkmark or x if there's a benefit)
7. Hearing (checkmark or x if there's a benefit)
8. Transport (checkmark or x if there's a benefit)

### Expanded Row (When table row is clicked)
Show the 4 tabs from the card view

## Card View
Show when the card view is active

### Card View Header
Instead of 'FREE' and 'MOOP', include the details from the required and default list view columns.

#### Overview Tab
1. Max Out-of-Pockets (In-Network, Combined)
2. Deductibles (Medical Deductible, Drug Deductible (Note excluded drug tiers if applicable))
3. Monthly Premium, Part B Giveback (if applicable), Annual Cost
4. Primary care copay, specialist copay.

#### Benefits Tab
1. Better filter and organization for categories (rather than putting most in the other category)
2. Move Prescription category /  Outpatient Prescription Drugs to the Prescriptions Tab

#### Prescriptions Tab
1. Add Details from the Prescription category on benefits tab

#### Resources Tab
1. Leave as is
