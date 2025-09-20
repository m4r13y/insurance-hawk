"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { getAvailableDailyBenefits as getAvailableDailyBenefitsFromQuote, getAdditionalRiders, getPremiumForDailyBenefit, shouldShowMainBenefitSelection, getAvailableRiderOptions, calculateTotalPremium as calculateTotalPremiumSimplified } from '@/utils/simplifiedHospitalIndemnityBenefits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { abbreviateHospitalRider } from '@/utils/abbreviateHospitalRider';

export interface HospitalIndemnityConfigurationPanelProps {
  companyName: string;
  quotes: OptimizedHospitalIndemnityQuote[]; // filtered to company already
  onPlanBuilt?: (config: any) => void;
}

interface RiderSelection { riderName: string; selectedOption: any; grouped?: boolean; variant?: string; }

// Helper to simplify plan names similar to original builder logic
const simplifyPlanName = (name: string): string => {
  return name
    .replace(/\s+with\s+GPO\s+Rider/gi, '')
    .replace(/\s+with\s+Automatic\s+Benefit\s+Increase\s+Rider/gi, '')
    .replace(/\s*-\s*(Core|Preferred|Premier|Elite)\s+Option\s+\d+/gi, '')
    .replace(/\s+(Elite|Core|Premier|Preferred)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const HospitalIndemnityConfigurationPanel: React.FC<HospitalIndemnityConfigurationPanelProps> = ({ companyName, quotes, onPlanBuilt }) => {
  const planOptions = useMemo(() => {
    const names = [...new Set(quotes.map(q => q.planName).filter(Boolean) as string[])];
    const simplified = names.map(simplifyPlanName);
    return [...new Set(simplified)];
  }, [quotes]);

  const [selectedPlanOption, setSelectedPlanOption] = useState<string>('');
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>('');
  const [selectedBenefitDays, setSelectedBenefitDays] = useState<number | null>(null);
  const [selectedDailyBenefit, setSelectedDailyBenefit] = useState<number | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<RiderSelection[]>([]);

  // Derive tier options
  const planTiers = useMemo(() => {
    if (!selectedPlanOption) return [] as string[];
    const base = selectedPlanOption.toLowerCase();
    const tiers = new Set<string>();
    quotes.forEach(q => {
      const lower = q.planName.toLowerCase();
      if (lower.includes(base)) {
        const m = q.planName.match(/\b(Core|Preferred|Premier|Elite)\b/i);
        if (m) tiers.add(m[1]);
      }
    });
    return Array.from(tiers).sort((a,b)=>['Core','Premier','Preferred','Elite'].indexOf(a)-['Core','Premier','Preferred','Elite'].indexOf(b));
  }, [selectedPlanOption, quotes]);

  // Filter quotes matching base plan (option + tier)
  const matchingQuotes = useMemo(() => {
    if (!selectedPlanOption) return [] as OptimizedHospitalIndemnityQuote[];
    return quotes.filter(q => {
      const baseMatch = q.planName.toLowerCase().includes(selectedPlanOption.toLowerCase());
      const tierOk = !selectedPlanTier || q.planName.includes(selectedPlanTier);
      return baseMatch && tierOk;
    });
  }, [quotes, selectedPlanOption, selectedPlanTier]);

  // Benefit days
  const availableBenefitDays = useMemo(() => {
    const set = new Set<number>();
    matchingQuotes.forEach(q => {
      const m = q.planName.match(/(\d+)\s*(?:benefit\s*)?days?/i);
      if (m) set.add(parseInt(m[1]));
    });
    return Array.from(set).sort((a,b)=>a-b);
  }, [matchingQuotes]);

  // Daily benefits list (take from first matching quote & util)
  const availableDailyBenefits = useMemo(() => {
    if (!matchingQuotes.length) return [] as number[];
    let pool = matchingQuotes;
    if (selectedBenefitDays) {
      pool = pool.filter(q => {
        const m = q.planName.match(/(\d+)\s*(?:benefit\s*)?days?/i);
        return m && parseInt(m[1]) === selectedBenefitDays;
      });
    }
    if (!pool.length) return [];
    return getAvailableDailyBenefitsFromQuote(pool[0]);
  }, [matchingQuotes, selectedBenefitDays]);

  // Select a representative quote for premium calculation
  const currentQuote = useMemo(() => {
    if (!matchingQuotes.length || !selectedDailyBenefit) return null;
    // prefer quote supporting selected daily benefit
    const candidate = matchingQuotes.find(q => getAvailableDailyBenefitsFromQuote(q).includes(selectedDailyBenefit)) || matchingQuotes[0];
    return candidate;
  }, [matchingQuotes, selectedDailyBenefit]);

  const riders = useMemo(() => currentQuote ? (getAdditionalRiders(currentQuote) || []) : [], [currentQuote]);

  const showMainBenefitSelection = useMemo(() => {
    if (!currentQuote) return true; // until selection
    return shouldShowMainBenefitSelection(currentQuote);
  }, [currentQuote]);

  // Auto-select defaults
  useEffect(() => {
    if (!selectedPlanOption && planOptions.length === 1) setSelectedPlanOption(planOptions[0]);
  }, [planOptions, selectedPlanOption]);
  useEffect(() => {
    if (selectedPlanOption) {
      setSelectedPlanTier('');
      setSelectedBenefitDays(null);
      setSelectedDailyBenefit(null);
      setSelectedRiders([]);
    }
  }, [selectedPlanOption]);
  useEffect(() => {
    if (!selectedDailyBenefit && availableDailyBenefits.length === 1) setSelectedDailyBenefit(availableDailyBenefits[0]);
  }, [availableDailyBenefits, selectedDailyBenefit]);

  const totalPremium = useMemo(() => {
    if (!currentQuote || !selectedDailyBenefit) return null;
    let premium = getPremiumForDailyBenefit(currentQuote, selectedDailyBenefit);
    selectedRiders.forEach(r => { if (r.selectedOption?.rate) premium += r.selectedOption.rate; });
    return premium;
  }, [currentQuote, selectedDailyBenefit, selectedRiders]);

  // Emit build result
  useEffect(() => {
    if (!onPlanBuilt) return;
    if (!currentQuote || !selectedDailyBenefit) return;
    const config = {
      companyName,
      planOption: selectedPlanOption,
      planTier: selectedPlanTier || null,
      benefitDays: selectedBenefitDays,
      dailyBenefit: selectedDailyBenefit,
      riders: selectedRiders,
      totalPremium,
      quote: currentQuote
    };
    onPlanBuilt(config);
  }, [onPlanBuilt, currentQuote, selectedPlanOption, selectedPlanTier, selectedBenefitDays, selectedDailyBenefit, selectedRiders, totalPremium, companyName]);

  const toggleRider = (rider: any, checked: boolean) => {
    setSelectedRiders(prev => {
      if (!checked) return prev.filter(p => p.riderName !== rider.name);
      // choose first option as default
      const option = (getAvailableRiderOptions(rider) || rider.benefitOptions || [])[0];
      return [...prev, { riderName: rider.name, selectedOption: option }];
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Plan Configuration – {companyName}</CardTitle></CardHeader>
        <CardContent className="space-y-5 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium uppercase text-slate-500">Plan Option</label>
              <Select value={selectedPlanOption} onValueChange={setSelectedPlanOption}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select plan option" /></SelectTrigger>
                <SelectContent>{planOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {planTiers.length>0 && (
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase text-slate-500">Plan Tier</label>
                <Select value={selectedPlanTier} onValueChange={setSelectedPlanTier}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>{planTiers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {availableBenefitDays.length>0 && (
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase text-slate-500">Benefit Days</label>
                <Select value={selectedBenefitDays?.toString()||''} onValueChange={v=> setSelectedBenefitDays(parseInt(v))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>{availableBenefitDays.map(d => <SelectItem key={d} value={d.toString()}>{d} days</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {showMainBenefitSelection && (
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase text-slate-500">Daily Benefit</label>
                <Select value={selectedDailyBenefit?.toString()||''} onValueChange={v=> setSelectedDailyBenefit(parseInt(v))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{availableDailyBenefits.map(b => <SelectItem key={b} value={b.toString()}>${b}/day</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-medium uppercase text-slate-500">Riders</div>
            {(!riders || riders.length===0) && <div className="text-[12px] text-slate-500">No riders available for this configuration.</div>}
            <div className="flex flex-wrap gap-2">
              {riders.map(r => {
                const checked = selectedRiders.some(sr => sr.riderName === r.name);
                return (
                  <button key={r.name} type="button" onClick={()=> toggleRider(r, !checked)} className={`text-[11px] px-2 py-1 rounded-full border transition ${checked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'}`}>{abbreviateHospitalRider(r.name)}</button>
                );
              })}
            </div>
            {selectedRiders.length>0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedRiders.map(r => <span key={r.riderName} className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200">{abbreviateHospitalRider(r.riderName)}</span>)}
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-2 text-[13px]">
            <div className="font-medium">Summary</div>
            <ul className="text-slate-600 dark:text-slate-300 space-y-1 text-[12px]">
              <li><span className="font-medium">Plan:</span> {selectedPlanOption || '—'} {selectedPlanTier && <span>({selectedPlanTier})</span>}</li>
              <li><span className="font-medium">Daily Benefit:</span> {selectedDailyBenefit ? `$${selectedDailyBenefit}/day` : '—'}</li>
              {selectedBenefitDays && <li><span className="font-medium">Benefit Days:</span> {selectedBenefitDays}</li>}
              <li><span className="font-medium">Riders:</span> {selectedRiders.length ? selectedRiders.map(r => abbreviateHospitalRider(r.riderName)).join(', ') : 'None'}</li>
              <li><span className="font-medium">Est. Premium:</span> {totalPremium != null ? `$${totalPremium.toFixed(2)}` : '—'}</li>
            </ul>
            <div>
              <Button disabled={!currentQuote || !selectedDailyBenefit} onClick={()=>{ if(onPlanBuilt && currentQuote && selectedDailyBenefit){ onPlanBuilt({ companyName, planOption: selectedPlanOption, planTier: selectedPlanTier||null, benefitDays: selectedBenefitDays, dailyBenefit: selectedDailyBenefit, riders: selectedRiders, totalPremium, quote: currentQuote }); } }} size="sm">Build Plan</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalIndemnityConfigurationPanel;