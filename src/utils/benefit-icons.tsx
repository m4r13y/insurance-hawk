import React from 'react';
import { 
  FaStethoscope, FaHospital, FaAmbulance, FaPhone, FaEye, FaHeadphones, FaBrain, FaWalking,
  FaPills, FaHeart, FaCar, FaUtensils, FaDumbbell, FaSyringe, FaVials, FaChartLine,
  FaShieldAlt, FaBolt, FaGlobe, FaMapMarkerAlt, FaGift, FaCalendarAlt,
  FaUserMd, FaBuilding, FaCreditCard, FaDollarSign, FaClipboardList, FaTruck,
  FaThermometerHalf, FaBandAid, FaBroadcastTower, FaTooth, FaGamepad, FaFlask, FaHandHoldingMedical
} from "react-icons/fa";

// Icon mapping for each benefit type
export const getBenefitIcon = (benefitType: string): React.ReactNode => {
  const iconMap: Record<string, JSX.Element> = {
    'Additional Telehealth Services': <FaPhone className="w-4 h-4" />,
    'Ambulance': <FaAmbulance className="w-4 h-4" />,
    'Annual Physical Exam': <FaUserMd className="w-4 h-4" />,
    'Comprehensive Dental Service': <FaTooth className="w-4 h-4" />,
    'Defined Supplemental Benefits': <FaGift className="w-4 h-4" />,
    'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': <FaVials className="w-4 h-4" />,
    'Dialysis Services': <FaHandHoldingMedical className="w-4 h-4" />,
    'Doctor\'s office visits': <FaStethoscope className="w-4 h-4" />,
    'Emergency Care': <FaAmbulance className="w-4 h-4" />,
    'Foot care (podiatry services)': <FaWalking className="w-4 h-4" />,
    'Health Plan Deductible': <FaDollarSign className="w-4 h-4" />,
    'Hearing services': <FaHeadphones className="w-4 h-4" />,
    'Inpatient Hospital': <FaHospital className="w-4 h-4" />,
    'Meal Benefit': <FaUtensils className="w-4 h-4" />,
    'Medical Equipment': <FaFlask className="w-4 h-4" />,
    'Medicare Part B': <FaClipboardList className="w-4 h-4" />,
    'Mental health care': <FaBrain className="w-4 h-4" />,
    'Non Opioid Pain Management': <FaBandAid className="w-4 h-4" />,
    'Opioid Treatment Services': <FaBandAid className="w-4 h-4" />,
    'Optional Supplemental Benefits': <FaGift className="w-4 h-4" />,
    'Otc Items': <FaPills className="w-4 h-4" />,
    'Other Deductibles': <FaDollarSign className="w-4 h-4" />,
    'Outpatient Hospital': <FaBuilding className="w-4 h-4" />,
    'Outpatient prescription drugs': <FaPills className="w-4 h-4" />,
    'Outpatient rehabilitation': <FaChartLine className="w-4 h-4" />,
    'Preventive Care': <FaShieldAlt className="w-4 h-4" />,
    'Preventive Dental Service': <FaTooth className="w-4 h-4" />,
    'Skilled Nursing Facility (SNF)': <FaBuilding className="w-4 h-4" />,
    'Transportation': <FaCar className="w-4 h-4" />,
    'Transportation Services': <FaCar className="w-4 h-4" />,
    'Vision': <FaEye className="w-4 h-4" />,
    'Wellness Programs': <FaHeart className="w-4 h-4" />,
    'Worldwide Emergency Urgent Coverage': <FaGlobe className="w-4 h-4" />
  };
  
  return iconMap[benefitType] || <FaClipboardList className="w-4 h-4" />;
};
