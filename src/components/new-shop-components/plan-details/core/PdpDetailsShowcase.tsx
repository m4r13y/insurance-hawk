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
    // Rich tier rows for carousel: { tier: 'Tier 1', tierType: 'Preferred Generic', rows: [{ pharmacyType, thirty, sixty, ninety }] }
    // Stored under adapter metadata as tierCarousel (non-standard field) via adapter extraction.
    // @ts-ignore
    tierCarousel?: Array<{ tier: string; tierType: string; rows: Array<{ pharmacyType: string; thirty: string; sixty: string; ninety: string }> }>; 
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
            // Prefer rich carousel data if available
            // @ts-ignore
            const carousel = selectedQuote.metadata?.tierCarousel as NormalizedDrugPlanQuote['metadata']['tierCarousel'];
            if (carousel && carousel.length) {
              return <TierCarousel carousel={carousel} />;
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
            return <SimpleTierSummary tierSource={tierSource} />;
          })()}
        </section>
      </div>
    </div>
  );
};

// --- Internal Components ----------------------------------------------------

interface TierCarouselProps { carousel: NonNullable<NonNullable<NormalizedDrugPlanQuote['metadata']>['tierCarousel']>; }
const TierCarousel: React.FC<TierCarouselProps> = ({ carousel }) => {
  const [index, setIndex] = React.useState(0);
  const [showAll, setShowAll] = React.useState(false);
  const active = carousel[index];
  const announceRef = React.useRef<HTMLDivElement | null>(null);

  const normalizeVal = (v: string) => {
    if (!v || /not supported|not covered/i.test(v)) return '—';
    const trimmed = v.trim();
    if (/^\$?\d+(\.\d{2})?$/.test(trimmed.replace(/\s/g,''))) {
      return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
    }
    if (/^\d+%$/.test(trimmed.replace(/\s/g,''))) return trimmed.replace(/\s/g,'');
    return trimmed; // leave percentages like 25% or values like 38%
  };

  const classify = (v: string) => /%$/.test(v) ? 'text-amber-300' : v.startsWith('$') ? 'text-emerald-300' : 'text-slate-300';

  const next = React.useCallback(() => setIndex(i => (i + 1) % carousel.length), [carousel.length]);
  const prev = React.useCallback(() => setIndex(i => (i - 1 + carousel.length) % carousel.length), [carousel.length]);

  React.useEffect(()=>{
    if (announceRef.current) announceRef.current.textContent = `${active.tier} ${active.tierType}`;
  },[active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
  };

  const renderTable = (tierObj: typeof carousel[number]) => (
    <div key={tierObj.tier} className="overflow-x-auto rounded-lg border border-slate-800/70">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-900/60 text-slate-300 uppercase tracking-wide">
          <tr>
            <th className="text-left py-2 px-3 font-medium">Pharmacy Type</th>
            <th className="text-left py-2 px-3 font-medium">30 Days</th>
            <th className="text-left py-2 px-3 font-medium">60 Days</th>
            <th className="text-left py-2 px-3 font-medium">90 Days</th>
          </tr>
        </thead>
        <tbody>
          {tierObj.rows.map((r, i)=>(
            <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-800/40">
              <td className="py-2 px-3 text-slate-200 font-medium">{r.pharmacyType}</td>
              {['thirty','sixty','ninety'].map((k,j)=>{
                // @ts-ignore
                const rawVal = r[k] as string; const val = normalizeVal(rawVal); const cls = classify(val);
                return <td key={j} className={`py-2 px-3 ${cls}`}>{val}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4 outline-none focus:ring-2 focus:ring-blue-500/40 rounded-md" onKeyDown={onKey} tabIndex={0} aria-label="Drug tier carousel">
      <div ref={announceRef} aria-live="polite" className="sr-only" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 bg-slate-800/60 rounded-md px-4 py-2 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <span>{active.tier} <span className="text-slate-400">({active.tierType})</span></span>
            <TooltipIcon />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={carousel.length<=1} className="text-xs px-2 py-1 rounded bg-slate-700/50 disabled:opacity-40 hover:bg-slate-600/60" aria-label="Previous tier">Prev</button>
            <button onClick={next} disabled={carousel.length<=1} className="text-xs px-2 py-1 rounded bg-slate-700/50 disabled:opacity-40 hover:bg-slate-600/60" aria-label="Next tier">Next</button>
          </div>
        </div>
        <button onClick={()=>setShowAll(s=>!s)} className="text-xs px-3 py-2 rounded bg-slate-700/50 hover:bg-slate-600/60 h-full" aria-pressed={showAll} aria-label="Toggle show all tiers">{showAll ? 'Collapse' : 'Show All'}</button>
      </div>
      {showAll ? (
        <div className="space-y-6">
          {carousel.map(t => (
            <div key={t.tier} className="space-y-2">
              <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{t.tier} <span className="text-slate-500 normal-case">({t.tierType})</span></div>
              {renderTable(t)}
            </div>
          ))}
        </div>
      ) : renderTable(active)}
      <div className="flex items-center justify-center gap-1">
        {carousel.map((_, i)=>(
          <button key={i} onClick={()=>setIndex(i)} className={`w-2 h-2 rounded-full ${i===index ? 'bg-blue-400' : 'bg-slate-600'}`} aria-label={`Go to ${carousel[i].tier}`}/>
        ))}
        <span className="text-[10px] text-slate-500 ml-2">{index+1} / {carousel.length}</span>
      </div>
    </div>
  );
};

const SimpleTierSummary: React.FC<{ tierSource: NonNullable<NormalizedDrugPlanQuote['metadata']>['drugTiers'] }> = ({ tierSource }) => (
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
        {tierSource!.map((t,i)=>(
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

// Tooltip icon component (simple) explaining columns
const TooltipIcon: React.FC = () => {
  const [open,setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={()=>setOpen(o=>!o)} aria-label="Tier cost sharing info" className="w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-slate-700/70 text-slate-300 hover:bg-slate-600/70">i</button>
      {open && (
        <div role="tooltip" className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 w-64 text-[11px] leading-relaxed bg-slate-900/90 border border-slate-700 rounded-md p-3 shadow-lg">
          Values show typical cost sharing for a 30/60/90 day supply at Preferred vs Standard retail and Mail Order pharmacies. Percentages are coinsurance; dollar amounts are copays. “—” means not covered or not supported.
        </div>
      )}
    </div>
  );
};

export default PdpDetailsShowcase;
