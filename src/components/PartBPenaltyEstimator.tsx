"use client";
import React, { useState } from "react";

export const PartBPenaltyEstimator: React.FC = () => {
  const [monthsLate, setMonthsLate] = useState("");
  const [result, setResult] = useState("");
  const [showResult, setShowResult] = useState(false);
  const basePremium = 185.00; // 2025 standard Part B premium

  const [monthsError, setMonthsError] = useState("");
  function calculatePenalty() {
    const months = parseInt(monthsLate);
    if (isNaN(months) || months < 0 || months > 600) {
      setResult("<p class='text-error'>Please enter a valid number of months (0-600).</p>");
      setShowResult(true);
      return;
    }
    const fullYearsLate = Math.floor(months / 12);
    if (fullYearsLate === 0) {
      setResult(`
        <div class='grow text-left'>
          <div class='font-semibold text-success text-lg mb-1'>No penalty</div>
          <div class='text-base text-muted-foreground'>You enrolled within 12 months of your eligibility. No penalty applies.</div>
        </div>
      `);
      setShowResult(true);
      return;
    }
    const penaltyPercent = 10 * fullYearsLate;
    const penaltyAmount = basePremium * (penaltyPercent / 100);
    const totalPremium = basePremium + penaltyAmount;
    setResult(`
      <div class='grow text-left'>
        <div class='text-base text-muted-foreground  mb-1'>${months} month(s) late (${fullYearsLate} year(s))</div>
        <div class='text-lg text-foreground mb-2'>Penalty: <span class='font-semibold text-destructive'>$${penaltyAmount.toFixed(2)}</span> (${penaltyPercent}% of standard premium)</div>
        <div class='font-semibold text-foreground text-lg mb-1'>New monthly Part B premium: <span class='text-destructive'>$${totalPremium.toFixed(2)}</span></div>
        <div class='text-base text-muted-foreground'>This penalty is permanent as long as you have Part B coverage.</div>
      </div>
    `);
    setShowResult(true);
  }
  return (
    <>
      <div className="max-w-md mx-auto p-6 bg-card rounded-xl shadow-md border border-border mt-4">
        <h4 className="text-start text-xl font-semibold mb-4">Part B Penalty Estimator</h4>
        <div className="mb-2">
          <label htmlFor="bmonthsLate" className="block font-medium mb-2">How many months did you delay?</label>
      <input
        type="number"
        id="bmonthsLate"
        min="0"
        max="600"
        placeholder="e.g. 29"
        className="w-full p-2 border border-primary rounded text-foreground focus:ring-blue-600 focus:border-primary"
        value={monthsLate}
        onChange={e => {
          setMonthsLate(e.target.value);
          const val = parseInt(e.target.value);
          if (isNaN(val) || val < 0 || val > 600) {
            setMonthsError("Please enter a valid number of months (0-600).");
          } else {
            setMonthsError("");
          }
        }}
      />
      {monthsError && <div className="text-error text-sm mt-1">{monthsError}</div>}
        </div>
        <div className="text-center mt-8">
          <button
            type="button"
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-hidden focus:bg-primary/80 disabled:opacity-50 disabled:pointer-events-none"
            aria-haspopup="dialog"
            aria-expanded={showResult}
            aria-controls="partb-modal"
            onClick={calculatePenalty}
            disabled={monthsLate === "" || monthsError !== ""}
          >
            Show My Penalty
          </button>
        </div>
      </div>
      {showResult && (
        <div id="partb-modal" className="fixed inset-0 z-80 overflow-x-hidden overflow-y-auto flex items-center justify-center bg-black bg-opacity-40" role="dialog" tabIndex={-1} aria-labelledby="partb-modal-label">
          <div className="mt-0 opacity-100 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div className="bg-card border border-border rounded-xl shadow-2xs pointer-events-auto">
              <div className="p-6 sm:p-7">
                <div className="text-center">
                  <h3 id="partb-modal-label" className="block text-xl sm:text-2xl font-semibold text-foreground my-2">Your Part B Penalty</h3>
                  <div className="max-w-sm mx-auto mb-6"></div>
                  <hr className="my-4 border-border" />
                  {/* Feature row for Part B Penalty */}
                  <div className="flex gap-x-7 py-5 first:pt-0 last:pb-0 items-start">
                    <svg className="shrink-0 mt-1 size-7 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/><path d="M6 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
                    <div dangerouslySetInnerHTML={{ __html: result }} />
                  </div>
                </div>
              </div>
              <hr className="border-border" />
              <div className="flex justify-end items-center gap-x-4 p-6 sm:px-7">
                <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-border bg-card text-foreground shadow-2xs hover:bg-accent focus:outline-hidden focus:bg-accent" onClick={() => setShowResult(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
