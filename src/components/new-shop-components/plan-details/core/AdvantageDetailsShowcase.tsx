"use client";
import React, { useMemo } from 'react';
import { CMSStarRating } from '@/components/ui/cms-star-rating';

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
  }, [quotes]);

  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const selectedQuote = useMemo(() => quotes.find(q => q.id === selectedPlanId) || null, [quotes, selectedPlanId]);

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
          <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">Key Benefits</h2>
          {!selectedQuote && (
            <div className="text-xs text-slate-400 bg-slate-900/40 border border-slate-800/60 rounded-md p-4">Select a plan above to view key in-network benefit cost sharing.</div>
          )}
          {selectedQuote && (
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
