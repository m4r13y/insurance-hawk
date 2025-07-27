"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


interface MedigapQuoteDetailsModalProps {
  open: boolean;
  onClose: () => void;
  quote: any | null;
}

const MedigapQuoteDetailsModal: React.FC<MedigapQuoteDetailsModalProps> = ({ open, onClose, quote }) => {
  if (!quote) return null;

  // Support both 'full_name' and 'name_full' for compatibility
  const getBeforeComma = (str?: string) => {
    if (!str) return '';
    const idx = str.indexOf(',');
    return idx === -1 ? str : str.slice(0, idx);
  };
  const carrierName = getBeforeComma(quote.carrier?.name);
  const carrierFullRaw = typeof quote.carrier?.full_name === 'string' ? quote.carrier.full_name : (typeof quote.carrier?.name_full === 'string' ? quote.carrier.name_full : undefined);
  const carrierFull = carrierFullRaw && carrierFullRaw !== quote.carrier?.name ? getBeforeComma(carrierFullRaw) : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>Medigap Quote Details</DialogTitle>
      <DialogContent className="space-y-3">
        <div>
          <div className="text-base font-semibold text-gray-900 dark:text-white">{carrierName}</div>
          {carrierFull && (
            <div className="text-xs text-gray-500 dark:text-neutral-400">{carrierFull}</div>
          )}
        </div>
        <div>
          <span className="font-medium">Plan:</span> {quote.plan_name}
        </div>
        <div>
          <span className="font-medium">Monthly Premium:</span> ${quote.monthly_premium?.toFixed(2) ?? quote.premium?.toFixed(2)}
        </div>
        {quote.am_best_rating && (
          <div>
            <span className="font-medium">AM Best Rating:</span> {quote.am_best_rating}
          </div>
        )}
        {quote.plan_type && (
          <div>
            <span className="font-medium">Plan Type:</span> {quote.plan_type}
          </div>
        )}
        {quote.discounts && Array.isArray(quote.discounts) && quote.discounts.length > 0 && (
          <div>
            <span className="font-medium">Discounts:</span>
            <ul className="list-disc ml-5">
              {quote.discounts.map((d: any, i: number) => (
                <li key={i}>{d.name}: {d.value}{d.type === 'percent' ? '%' : ''}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Add more fields as needed */}
      </DialogContent>
      <DialogFooter>
        <Button onClick={onClose} variant="outline">Close</Button>
      </DialogFooter>
    </Dialog>
  );
};

export { MedigapQuoteDetailsModal };
