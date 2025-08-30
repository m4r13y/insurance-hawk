"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PlanComparisonModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  selectedPlans: string[];
}

export default function PlanComparisonModal({
  isOpen,
  onClose,
  selectedPlans
}: PlanComparisonModalProps) {
  if (!selectedPlans || selectedPlans.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedPlans.length === 1 
              ? `Plan ${selectedPlans[0]} Coverage Details`
              : `Plan Comparison: ${selectedPlans.join(', ')}`
            }
          </DialogTitle>
          <DialogDescription>
            {selectedPlans.length === 1
              ? `Understanding what's included in your selected Medigap Plan ${selectedPlans[0]}`
              : "Understanding the key differences between your selected Medigap plan types"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Plan Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-3 text-left font-semibold">Benefit</th>
                  {selectedPlans.includes('F') && (
                    <th className="border border-border p-3 text-center font-semibold bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">Plan F</th>
                  )}
                  {selectedPlans.includes('G') && (
                    <th className="border border-border p-3 text-center font-semibold bg-green-50/80 dark:bg-green-950/30 text-green-700 dark:text-green-300">Plan G</th>
                  )}
                  {selectedPlans.includes('N') && (
                    <th className="border border-border p-3 text-center font-semibold bg-purple-50/80 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">Plan N</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3 font-medium">Part A Deductible</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✓ Covered</td>}
                </tr>
                <tr>
                  <td className="border border-border p-3 font-medium">Part B Deductible ($240/yr)</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✗ You Pay</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✗ You Pay</td>}
                </tr>
                <tr>
                  <td className="border border-border p-3 font-medium">Part B Coinsurance</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✓ Covered</td>}
                </tr>
                <tr>
                  <td className="border border-border p-3 font-medium">Doctor Office Visits</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">$20 copay</td>}
                </tr>
                <tr>
                  <td className="border border-border p-3 font-medium">Emergency Room</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">$50 copay</td>}
                </tr>
                <tr>
                  <td className="border border-border p-3 font-medium">Part B Excess Charges</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✗ You Pay</td>}
                </tr>
                <tr>
                  <td className="border border-border p-3 font-medium">Hospital Coinsurance</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✓ Covered</td>}
                </tr>
                <tr>
                  <td className="border border-border p-3 font-medium">Skilled Nursing Facility</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✓ Covered</td>}
                </tr>
                <tr>
                  <td className="border border-border p-3 font-medium">Foreign Travel Emergency</td>
                  {selectedPlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                  {selectedPlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                  {selectedPlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✓ Covered</td>}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Key Differences Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedPlans.length === 1 ? "Plan Details" : "Key Differences"}
            </h3>
            <div className="grid gap-4 md:grid-cols-1">
              {selectedPlans.includes('F') && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Plan F - Most Comprehensive</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    <strong>Eligibility:</strong> Only available if you were eligible for Medicare before January 1, 2020.
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Covers all Medicare gaps including the Part B deductible. You'll have minimal out-of-pocket costs, 
                    but typically higher monthly premiums.
                  </p>
                </div>
              )}
              {selectedPlans.includes('G') && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Plan G - Popular Choice</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Similar to Plan F but you pay the annual Part B deductible ($240). 
                    Often the best value with lower premiums than Plan F while still providing excellent coverage.
                  </p>
                </div>
              )}
              {selectedPlans.includes('N') && (
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Plan N - Lower Premium Option</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Lower monthly premiums but includes small copays: $20 for doctor visits, $50 for ER visits. 
                    You also pay the Part B deductible and any excess charges. Good for those who don't visit doctors frequently.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cost Comparison */}
          {selectedPlans.length > 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Annual Cost Comparison Example</h3>
              <div className="text-sm text-muted-foreground mb-3">
                This example assumes 4 doctor visits and 1 ER visit per year, based on average premiums shown.
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {selectedPlans.includes('F') && (
                  <div className="p-3 rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                    <div className="font-semibold text-blue-800 dark:text-blue-200">Plan F</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Premium + minimal out-of-pocket costs</div>
                  </div>
                )}
                {selectedPlans.includes('G') && (
                  <div className="p-3 rounded border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                    <div className="font-semibold text-green-800 dark:text-green-200">Plan G</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Premium + $240 Part B deductible</div>
                  </div>
                )}
                {selectedPlans.includes('N') && (
                  <div className="p-3 rounded border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                    <div className="font-semibold text-purple-800 dark:text-purple-200">Plan N</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Premium + $240 deductible + $130 copays</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Important Notes</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• All Medigap plans cover the same standardized benefits - only costs vary by company</li>
              <li>• You can switch plans during certain periods, but may face medical underwriting</li>
              <li>• Plans don't include prescription drug coverage - you'll need a separate Part D plan</li>
              <li>• You can see any doctor who accepts Medicare - no network restrictions</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
