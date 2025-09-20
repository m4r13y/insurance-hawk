"use client";
import React, { useMemo } from 'react';
import { CMSStarRating } from '@/components/ui/cms-star-rating';
import { getBenefitStatusDisplay } from '@/utils/benefit-status';
import { getBenefitData } from '@/utils/medicare-advantage-data';
import { getBenefitIcon } from '@/utils/benefit-icons';
import { formatBenefitText } from '@/components/medicare-shop/advantage/benefit-formatter';

interface NormalizedAdvantageQuote {
  id: string;
  category: string;
  carrier: { id: string; name: string };
  pricing: { monthly: number };
  plan: { key: string; display: string };
  metadata?: {
    starRating?: number;
    medicalDeductible?: string;
    drugDeductible?: string;
    primaryCare?: string;
    specialist?: string;
    otc?: string;
    moop?: string;
    zeroPremiumLIS?: boolean;
    partBReduction?: string;
    drugBenefitType?: string;
    effectiveDate?: string;
    county?: string;
    state?: string;
    gapCoverage?: boolean;
    benefits?: Array<{
      benefit_type: string;
      full_description: string;
      summary_description?: { in_network?: string; out_network?: string };
      pd_view_display: boolean;
    }>;
  };
}

interface AdvantageDetailsShowcaseProps {
  carrierName: string;
  quotes: NormalizedAdvantageQuote[];
  onClose: () => void;
}

const AdvantageDetailsShowcase: React.FC<AdvantageDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  const summary = useMemo(() => {
    if (!quotes.length) return null;
    const prices = quotes.map(q => q.pricing.monthly);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    let star: number | undefined; let medDed: string | undefined; let drugDed: string | undefined;
    quotes.forEach(q => {
      if (typeof q.metadata?.starRating === 'number' && star == null) star = q.metadata.starRating;
      if (q.metadata?.medicalDeductible && !medDed) medDed = q.metadata.medicalDeductible;
      if (q.metadata?.drugDeductible && !drugDed) drugDed = q.metadata.drugDeductible;
    });
    return { min, max, star, medDed, drugDed };
  }, [quotes])

  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const selectedQuote = useMemo(() => quotes.find(q => q.id === selectedPlanId) || null, [quotes, selectedPlanId]);

  // Benefit category definitions (mirrors legacy benefits-overview grouping)
  const outpatientServices = [
    "Doctor's office visits",
    'Annual Physical Exam',
    'Preventive Care',
    'Outpatient Hospital',
    'Outpatient rehabilitation',
    'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)',
    'Additional Telehealth Services',
    'Emergency Care',
    'Ambulance'
  ];
  const inpatientFacility = [
    'Inpatient Hospital',
    'Skilled Nursing Facility (SNF)',
    'Dialysis Services',
    'Medical Equipment',
    'Health Plan Deductible',
    'Other Deductibles',
    'Medicare Part B',
    'Non Opioid Pain Management',
    'Opioid Treatment Services'
  ];
  const specialtyBenefits = [
    'Vision',
    'Hearing services',
    'Mental health care',
    'Foot care (podiatry services)',
    'Comprehensive Dental Service',
    'Preventive Dental Service',
    'Transportation',
    'Transportation Services',
    'Wellness Programs',
    'Meal Benefit',
    'Otc Items',
    'Defined Supplemental Benefits',
    'Optional Supplemental Benefits',
    'Worldwide Emergency Urgent Coverage'
  ];

  const pharmaceuticalType = 'Outpatient prescription drugs';

  // Helper to build benefit objects for a given category using selectedQuote metadata.benefits
  const createBenefitCards = (categoryBenefits: string[]) => {
    if (!selectedQuote?.metadata?.benefits) return [] as any[];
    const displayNameMap: Record<string,string> = {
      'Comprehensive Dental Service': 'Dental (Comprehensive)',
      'Preventive Dental Service': 'Dental (Preventive)',
      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Diagnostic Services'
    };
    const descriptionMap: Record<string,string> = {
      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Costs may differ if received in outpatient surgery setting'
    };
    const planBenefitTypes = selectedQuote.metadata.benefits.map(b => b.benefit_type);
    // Build a minimal legacy-shaped object for existing utility functions that expect plan.benefits
    const legacyPlan: any = { benefits: selectedQuote.metadata.benefits };
    return planBenefitTypes
      .filter(bt => bt !== pharmaceuticalType && categoryBenefits.includes(bt))
      .map((bt, i) => {
        const statusDisplay = getBenefitStatusDisplay(legacyPlan, bt);
        const benefitData = statusDisplay.status === 'covered' ? getBenefitData(legacyPlan, bt) : 'Not Available';
        const benefit = selectedQuote.metadata?.benefits?.find(b => b.benefit_type.toLowerCase() === bt.toLowerCase());
        return {
          benefitType: bt,
            displayName: displayNameMap[bt] || bt,
            description: descriptionMap[bt],
            index: `${bt}-${i}`,
            statusDisplay,
            benefitData,
            benefit
        };
      });
  };

  const inpatientCards = createBenefitCards(inpatientFacility);
  const outpatientCards = createBenefitCards(outpatientServices);
  const specialtyCards = createBenefitCards(specialtyBenefits);

  const pharmaBenefit = selectedQuote?.metadata?.benefits?.find(b => b.benefit_type === pharmaceuticalType);

  return (
    <div className="space-y-10">
      {summary && (
        <header className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-100 mb-1">{carrierName}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div>Premium Range <span className="text-slate-200">${summary.min.toFixed(2)}</span>{summary.max !== summary.min && <> – <span className="text-slate-200">${summary.max.toFixed(2)}</span></>}</div>
                {summary.medDed && <div>Medical Deductible <span className="text-slate-200">{summary.medDed}</span></div>}
                {summary.drugDed && <div>Drug Deductible <span className="text-slate-200">{summary.drugDed}</span></div>}
                {summary.star != null && <div className="flex items-center gap-1"><CMSStarRating rating={summary.star} showText={false} /><span className="text-xs">{summary.star} Stars</span></div>}
              </div>
            </div>
            <button onClick={onClose} className="text-xs px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300">Back</button>
          </div>
        </header>
      )}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">Plan Variants</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-800/70">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Plan Name</th>
                  <th className="text-left py-2 px-3 font-medium">Plan Key</th>
                  <th className="text-left py-2 px-3 font-medium">Monthly Premium</th>
                  <th className="text-left py-2 px-3 font-medium">Medical Deductible</th>
                  <th className="text-left py-2 px-3 font-medium">Drug Deductible</th>
                  <th className="text-left py-2 px-3 font-medium">Star Rating</th>
                  <th className="text-left py-2 px-3 font-medium">Effective Date</th>
                  <th className="text-left py-2 px-3 font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {quotes
                  .slice()
                  .sort((a,b)=>a.pricing.monthly - b.pricing.monthly)
                  .map(q => {
                    const active = q.id === selectedPlanId;
                    return (
                      <tr
                        key={q.id}
                        onClick={() => setSelectedPlanId(q.id)}
                        className={`cursor-pointer border-t border-slate-800/60 hover:bg-slate-800/50 transition ${active ? 'bg-slate-800/70 ring-1 ring-blue-400/40' : ''}`}
                        aria-selected={active}
                      >
                        <td className="py-2 px-3 text-slate-100 font-medium">{q.plan.display}</td>
                        <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">{q.plan.key}</td>
                        <td className="py-2 px-3 text-slate-100">${q.pricing.monthly.toFixed(2)}</td>
                        <td className="py-2 px-3 text-slate-300">{q.metadata?.medicalDeductible || '—'}</td>
                        <td className="py-2 px-3 text-slate-300">{q.metadata?.drugDeductible || '—'}</td>
                        <td className="py-2 px-3"><CMSStarRating rating={q.metadata?.starRating} showText={false} /></td>
                        <td className="py-2 px-3 text-slate-400">{q.metadata?.effectiveDate || '—'}</td>
                        <td className="py-2 px-3 text-slate-400">{q.metadata?.state || '—'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mt-14">
          <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">All Plan Benefits</h2>
          {!selectedQuote && (
            <div className="text-xs text-slate-400 bg-slate-900/40 border border-slate-800/60 rounded-md p-4">Select a plan above to view full benefit coverage details.</div>
          )}
          {selectedQuote && (
            <div className="space-y-10">
              {/* Summary snapshot row (retain quick glance cards) */}
              <div className="grid md:grid-cols-3 gap-5">
                <BenefitCard label="Primary Care" value={selectedQuote.metadata?.primaryCare} />
                <BenefitCard label="Specialist" value={selectedQuote.metadata?.specialist} />
                <BenefitCard label="OTC Allowance" value={selectedQuote.metadata?.otc} />
                <BenefitCard label="Medical Deductible" value={selectedQuote.metadata?.medicalDeductible} />
                <BenefitCard label="Drug Deductible" value={selectedQuote.metadata?.drugDeductible} />
                <BenefitCard label="MOOP" value={selectedQuote.metadata?.moop} />
                {selectedQuote.metadata?.partBReduction && <BenefitCard label="Part B Reduction" value={selectedQuote.metadata?.partBReduction} />}
                {selectedQuote.metadata?.gapCoverage != null && <BenefitCard label="Gap Coverage" value={selectedQuote.metadata?.gapCoverage ? 'Yes' : 'No'} />}
              </div>

              {/* Pharmaceutical (full width) */}
              {pharmaBenefit && (
                <div className="border border-slate-800/60 rounded-lg bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 mb-3 text-slate-200 font-semibold text-sm">
                    {getBenefitIcon(pharmaceuticalType)}
                    <span>{pharmaceuticalType}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-2">
                    {formatBenefitText(pharmaBenefit.full_description)}
                  </div>
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-3">
                {/* Inpatient/Facility */}
                <BenefitCategory title="Inpatient / Facility" cards={inpatientCards} />
                {/* Outpatient */}
                <BenefitCategory title="Outpatient Services" cards={outpatientCards} />
                {/* Specialty */}
                <BenefitCategory title="Specialty & Other" cards={specialtyCards} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const BenefitCard: React.FC<{ label: string; value?: string | number | boolean }> = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 flex flex-col gap-2 min-h-[90px]">
      <div className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{label}</div>
      <div className="text-sm font-semibold text-slate-100 truncate" title={String(value ?? '—')}>{value != null && value !== '' ? value : '—'}</div>
    </div>
  );
};

export default AdvantageDetailsShowcase;

// Category section component
const BenefitCategory: React.FC<{ title: string; cards: any[] }> = ({ title, cards }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{title}</h3>
      {cards.length === 0 && (
        <div className="text-[11px] text-slate-500 italic">No benefits in this category.</div>
      )}
      <div className="space-y-3">
        {cards.map(({ benefitType, displayName, description, statusDisplay, benefitData, benefit, index }) => (
          <div key={index} className="rounded-md border border-slate-800/60 bg-slate-900/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {getBenefitIcon(benefitType)}
                <span className="text-sm font-medium text-slate-100">{displayName}</span>
              </div>
              <div className="flex items-center gap-2">{statusDisplay.icon}</div>
            </div>
            {description && <div className="mt-1 text-[11px] text-slate-500 italic leading-snug">{description}</div>}
            {benefit && (
              <div className="mt-2 space-y-2 text-[11px] leading-relaxed text-slate-300">
                {benefit.summary_description?.in_network && (
                  <div className="bg-slate-800/50 p-2 rounded">
                    <strong className="text-slate-200">In-Network:</strong>
                    <div className="mt-1">{formatBenefitText(benefit.summary_description.in_network)}</div>
                  </div>
                )}
                {benefit.summary_description?.out_network && (
                  <div className="bg-slate-800/50 p-2 rounded">
                    <strong className="text-slate-200">Out-of-Network:</strong>
                    <div className="mt-1">{formatBenefitText(benefit.summary_description.out_network)}</div>
                  </div>
                )}
                {!benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                  <div className="bg-slate-800/40 p-2 rounded">
                    {formatBenefitText(benefitData)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
