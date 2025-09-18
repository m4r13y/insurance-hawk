"use client";
import React, { useMemo } from 'react';
import DrugPlanDetailsHeader from '../headers/DrugPlanDetailsHeader';
import { CMSStarRating } from '@/components/ui/cms-star-rating';

interface NormalizedDrugPlanQuote {
  id: string;
  category: string;
  carrier: { id: string; name: string };
  pricing: { monthly: number };
  plan: { key: string; display: string };
  metadata?: { 
    deductible?: number; 
    starRating?: number; 
    effectiveDate?: string; 
    state?: string; 
    // Optional pre-parsed tier cost sharing information (to be populated by future adapter enhancement)
    drugTiers?: Array<{ tier: string; preferred?: string | number; standard?: string | number; mailOrder?: string | number; notes?: string }>; 
  };
}

interface PdpDetailsShowcaseProps {
  carrierName: string;
  quotes: NormalizedDrugPlanQuote[];
  onClose: () => void;
}

const PdpDetailsShowcase: React.FC<PdpDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  const summary = useMemo(() => {
    if (!quotes.length) return null;
    const prices = quotes.map(q => q.pricing.monthly);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    let star: number | undefined; let deductible: number | undefined;
    quotes.forEach(q => {
      if (typeof q.metadata?.starRating === 'number') star = q.metadata.starRating;
      const d = q.metadata?.deductible; if (typeof d === 'number' && (deductible == null || d < deductible)) deductible = d;
    });
    return { min, max, star, deductible };
  }, [quotes]);

  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const selectedQuote = useMemo(() => quotes.find(q => q.id === selectedPlanId) || null, [quotes, selectedPlanId]);

  return (
    <div className="space-y-10">
      {summary && (
        <DrugPlanDetailsHeader
          carrierName={carrierName}
          min={summary.min}
          max={summary.max}
          star={summary.star}
          deductible={summary.deductible}
          onGoBack={onClose}
        />
      )}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-24">
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">Plan Variants</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-800/70">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Plan Name</th>
                  <th className="text-left py-2 px-3 font-medium">Plan Key</th>
                  <th className="text-left py-2 px-3 font-medium">Monthly Premium</th>
                  <th className="text-left py-2 px-3 font-medium">Deductible</th>
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
                        <td className="py-2 px-3 text-slate-300">{q.metadata?.deductible != null ? `$${q.metadata.deductible.toFixed(0)}` : '—'}</td>
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
          <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">Drug Tier Cost Sharing</h2>
          {(() => {
            // Only show once a plan is selected
            if (!selectedQuote) {
              return <div className="text-xs text-slate-400 bg-slate-900/40 border border-slate-800/60 rounded-md p-4">Select a plan above to view tier cost sharing details.</div>;
            }
            const tierSource = selectedQuote.metadata?.drugTiers;
            if (!tierSource || !tierSource.length) {
              // Placeholder tiers (common PDP tier structure) until real data is parsed.
              const placeholderTiers = [
                { tier: 'Tier 1 (Preferred Generic)', preferred: '—', standard: '—', mailOrder: '—', notes: '' },
                { tier: 'Tier 2 (Generic)', preferred: '—', standard: '—', mailOrder: '—', notes: '' },
                { tier: 'Tier 3 (Preferred Brand)', preferred: '—', standard: '—', mailOrder: '—', notes: '' },
                { tier: 'Tier 4 (Non‑Preferred Drug)', preferred: '—', standard: '—', mailOrder: '—', notes: '' },
                { tier: 'Tier 5 (Specialty Tier)', preferred: '—', standard: '—', mailOrder: '—', notes: '' },
                { tier: 'Tier 6 (Select Care / Insulin / Vaccines)', preferred: '—', standard: '—', mailOrder: '—', notes: '' },
              ];
              return (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400 bg-slate-900/40 border border-slate-800/60 rounded-md p-3 leading-relaxed">
                    Tier level cost sharing for this plan has not been parsed yet. Displaying a standard tier template. Once real data is available these rows will populate with copay / coinsurance values and notes.
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-800/70">
                    <table className="min-w-full text-sm opacity-70">
                      <thead className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium">Tier</th>
                          <th className="text-left py-2 px-3 font-medium">Preferred Pharmacy</th>
                          <th className="text-left py-2 px-3 font-medium">Standard Pharmacy</th>
                          <th className="text-left py-2 px-3 font-medium">Mail Order</th>
                          <th className="text-left py-2 px-3 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {placeholderTiers.map((t,i) => (
                          <tr key={i} className="border-t border-slate-800/60">
                            <td className="py-2 px-3 text-slate-300 font-medium">{t.tier}</td>
                            <td className="py-2 px-3 text-slate-500">—</td>
                            <td className="py-2 px-3 text-slate-500">—</td>
                            <td className="py-2 px-3 text-slate-500">—</td>
                            <td className="py-2 px-3 text-slate-600 text-xs">—</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
            return (
              <div className="overflow-x-auto rounded-lg border border-slate-800/70">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Tier</th>
                      <th className="text-left py-2 px-3 font-medium">Preferred Pharmacy</th>
                      <th className="text-left py-2 px-3 font-medium">Standard Pharmacy</th>
                      <th className="text-left py-2 px-3 font-medium">Mail Order</th>
                      <th className="text-left py-2 px-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierSource.map((t,i) => (
                      <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-slate-100 font-medium">{t.tier}</td>
                        <td className="py-2 px-3 text-slate-300">{t.preferred ?? '—'}</td>
                        <td className="py-2 px-3 text-slate-300">{t.standard ?? '—'}</td>
                        <td className="py-2 px-3 text-slate-300">{t.mailOrder ?? '—'}</td>
                        <td className="py-2 px-3 text-slate-400 text-xs max-w-xs whitespace-pre-wrap">{t.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
};

export default PdpDetailsShowcase;
