import React from "react";

interface Rider {
  id: string;
  name: string;
  description: string;
  price: number;
  selected?: boolean;
}

interface HospitalIndemnityQuoteCardProps {
  carrier: string;
  planName: string;
  baseBenefit: string;
  baseBenefitPrice: number;
  riders: Rider[];
  totalPremium: number;
  onSelect?: () => void;
  otherCompanies?: Array<{
    carrier: string;
    planName: string;
    price: number;
  }>;
  onRiderToggle?: (riderId: string) => void;
}

export const HospitalIndemnityQuoteCard: React.FC<HospitalIndemnityQuoteCardProps> = ({
  carrier,
  planName,
  baseBenefit,
  baseBenefitPrice,
  riders,
  totalPremium,
  onSelect,
  otherCompanies = [],
  onRiderToggle,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Card */}
      <div className="lg:col-span-2 overflow-hidden rounded-xl border">
        <div className="p-6">
          <h3 className="font-headline text-2xl sm:text-3xl">{carrier}</h3>
          <p className="text-muted-foreground">{planName}</p>
        </div>
        <div className="space-y-8 border-t p-6">
          <div>
            <label className="text-base font-semibold" htmlFor="base-benefit-select">
              Hospital Confinement Benefit
            </label>
            <button
              type="button"
              className="py-3 px-4 w-full flex items-center justify-between border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:focus:ring-neutral-600 transition-colors duration-200 mt-2 h-11"
              id="base-benefit-select"
              disabled
            >
              <span style={{ pointerEvents: "none" }}>
                {baseBenefit} (+${baseBenefitPrice.toFixed(2)}/mo)
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4 opacity-50 flex-shrink-0" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </div>
          <div className="bg-border h-[1px] w-full" />
          <div>
            <h4 className="font-semibold mb-4 text-base">Optional Riders</h4>
            <div className="space-y-4">
              {riders.map((rider, idx) => (
                <div key={rider.id} className="flex items-center rounded-md border bg-background p-4">
              <button
                type="button"
                role="switch"
                aria-checked={rider.selected ? "true" : "false"}
                aria-pressed={rider.selected ? "true" : "false"}
                value="on"
                className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${rider.selected ? 'bg-primary' : 'bg-input'}`}
                id={`rider-${idx}`}
                tabIndex={0}
                onClick={e => {
                  e.stopPropagation();
                  if (onRiderToggle) onRiderToggle(rider.id);
                }}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onRiderToggle) onRiderToggle(rider.id);
                  }
                }}
                aria-label={rider.selected ? `Deselect ${rider.name}` : `Select ${rider.name}`}
              >
                <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${rider.selected ? 'translate-x-5' : 'translate-x-0'}`}></span>
              </button>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-4 flex w-full cursor-pointer justify-between" htmlFor={`rider-${idx}`}>
                    <div className="flex-1">
                      <p className="font-medium">{rider.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{rider.description}</p>
                    </div>
                    <span className="whitespace-nowrap pl-4 font-semibold">+ ${rider.price.toFixed(2)}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex-col items-stretch gap-4 border-t bg-muted/30 p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Total Monthly Premium</p>
            <p className="font-headline text-3xl font-bold sm:text-4xl">${totalPremium.toFixed(2)}</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-x-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 shadow-sm hover:shadow-md dark:focus:bg-blue-500 px-6 py-3 text-base mt-4 w-full"
            onClick={onSelect}
          >
            Select This Plan
          </button>
        </div>
      </div>
      {/* Other Companies */}
      <div>
        <h3 className="font-headline text-xl font-semibold mb-4">Other Companies</h3>
        <div className="space-y-4">
          {otherCompanies.length === 0 ? (
            <div className="text-gray-500 text-sm italic">No other companies found for your criteria.</div>
          ) : (
            otherCompanies.map((company, idx) => (
              <div key={company.carrier + idx} className="flex-col h-full bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70 flex cursor-pointer items-center justify-between p-6 transition-colors hover:border-primary hover:bg-muted/50">
                <div>
                  <p className="text-lg font-semibold">{company.carrier}</p>
                  <p className="text-sm text-muted-foreground">{company.planName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${company.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">starts from</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
