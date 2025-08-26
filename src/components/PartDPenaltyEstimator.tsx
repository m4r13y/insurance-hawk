"use client";
import React, { useState } from "react";

export function PartDPenaltyEstimator() {
  const [monthsLate, setMonthsLate] = useState("");
  const [result, setResult] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [monthsError, setMonthsError] = useState("");

  function calculatePenalty() {
    const months = parseInt(monthsLate);
    const basePremium = 36.78; // 2025 base beneficiary premium
    if (isNaN(months) || months < 0 || months > 600) {
      setResult("<p class='text-red-600'>Please enter a valid number of months.</p>");
      setShowResult(true);
      return;
    }
    if (months <= 2) {
      setResult(`
        <div class='grow text-left'>
          <div class='font-semibold text-green-700 text-lg mb-1'>No penalty</div>
          <div class='text-base text-gray-500'>You enrolled within the grace period. No penalty applies.</div>
        </div>
      `);
      setShowResult(true);
      return;
    }
    const rawPenalty = basePremium * 0.01 * months;
    const roundedPenalty = Math.round(rawPenalty * 10) / 10;
    setResult(`
      <div class='grow text-left'>
        <div class='text-base text-gray-500  mb-1'>${months} month(s) without coverage</div>
        <div class='font-semibold text-lg text-black mb-2'>Penalty: <span class='font-semibold text-red-600'>$${roundedPenalty.toFixed(2)}</span> added to your monthly premium.</div>
        <div class='text-base text-gray-500'>* This penalty lasts as long as you have Medicare drug coverage.</div>
      </div>
    `);
    setShowResult(true);
  }

  return (
    <>
      <div className="max-w-md mx-auto p-6 bg-card rounded-xl shadow-md border border-gray-100 mt-4">
        <h4 className="text-start text-xl font-semibold mb-4">Part D Penalty Estimator</h4>
        <div className="mb-2">
          <label htmlFor="dmonthsLate" className="block font-medium mb-2">How many months did you go without drug coverage?</label>
      <input
        type="number"
        id="dmonthsLate"
        min="0"
        max="600"
        placeholder="e.g. 14"
        className="w-full p-2 border border-blue-600 rounded text-black focus:ring-blue-600 focus:border-blue-600"
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
      {monthsError && <div className="text-red-600 text-sm mt-1">{monthsError}</div>}
        </div>
        <div className="text-center mt-8">
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          aria-haspopup="dialog"
          aria-expanded={showResult}
          aria-controls="partd-modal"
          onClick={calculatePenalty}
            disabled={monthsLate === "" || monthsError !== ""}
        >
          Show My Penalty
        </button>
        </div>
      </div>
      {showResult && (
        <div id="partd-modal" className="fixed inset-0 z-80 overflow-x-hidden overflow-y-auto flex items-center justify-center bg-black bg-opacity-40" role="dialog" tabIndex={-1} aria-labelledby="partd-modal-label">
          <div className="mt-0 opacity-100 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div className="bg-card border border-border rounded-xl shadow-2xs pointer-events-auto">
              <div className="p-6 sm:p-7">
                <div className="text-center">
                  <h3 id="partd-modal-label" className="block text-xl sm:text-2xl font-semibold text-gray-800 my-2">Your Part D Penalty</h3>
                  <div className="max-w-sm mx-auto mb-6"></div>
                  <hr className="my-4 border-border" />
                  {/* Feature row for Part D Penalty */}
                  <div className="flex gap-x-7 py-5 first:pt-0 last:pb-0 items-start">
                    <svg className="shrink-0 mt-1 size-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 17v-2a4 4 0 018 0v2M9 17H7a2 2 0 01-2-2v-5a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2"/></svg>
                    <div dangerouslySetInnerHTML={{ __html: result }} />
                  </div>
                </div>
              </div>
              <hr className="border-border" />
              <div className="flex justify-end items-center gap-x-4 p-6 sm:px-7">
                <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-border bg-card text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50" onClick={() => setShowResult(false)}>
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
