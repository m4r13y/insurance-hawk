// Shared abbreviation logic for Hospital Indemnity rider / benefit names.
// Extracted from SimplifiedHospitalIndemnityPlanBuilder to ensure consistent display
// across cards, selection lists, and builder configuration.

export function abbreviateHospitalRider(riderName: string): string {
  if (!riderName) return '';
  const abbreviations: Record<string,string> = {
    'Ambulance Services Rider': 'Ambulance',
    'Ambulance Ben': 'Ambulance',
    'Ambulance -': 'Ambulance',
    'Ambulance': 'Ambulance',
    'ER & Urgent Care Benefit Rider': 'Emergency Care',
    'ER/Urgent Care': 'Emergency Care',
    'Emergency Room Visit due to accident or injury': 'Emergency Care',
    'OP Therapy & Medical Devices Rider': 'Therapy',
    'OP Therapy 1': 'Therapy',
    'OP Therapy 2': 'Therapy',
    'Physical Therapy Rider': 'Therapy',
    'Outpatient Surgery Rider': 'Surgery',
    'OP Surgery': 'Surgery',
    'Hospital Confinement Benefits': 'Hospital Stay',
    'Hospital Admission': 'Hospital Stay',
    'Skilled Nursing Facility Benefits 1': 'Skilled Nursing',
    'Skilled Nursing Facility Benefits 2': 'Skilled Nursing',
    'Dental, Vision & Hearing Rider': 'Dental & Vision',
    'Lump Sum Hospital Benefit': 'Lump Sum',
    'Wellness Benefit': 'Wellness'
  };
  if (abbreviations[riderName]) return abbreviations[riderName];
  let abbreviated = riderName
    .replace(/\s+Rider\s*$/gi, '')
    .replace(/\s+\d+\s*$/g, '')
    .replace(/\bServices?\b/gi, '')
    .replace(/\bBenefit(s)?\b/gi, '')
    .replace(/\bOutpatient\b/gi, 'OP')
    .replace(/\bEmergency Room\b/gi, 'Emergency')
    .replace(/\bSkilled Nurse\b/gi, 'Skilled Nursing')
    .replace(/\s+/g, ' ')
    .trim();
  if (abbreviated.length > 15) {
    const words = abbreviated.split(' ');
    if (words.length > 2) abbreviated = words.slice(0,2).join(' ');
    else if (abbreviated.length > 15) abbreviated = abbreviated.substring(0,12);
  }
  return abbreviated;
}