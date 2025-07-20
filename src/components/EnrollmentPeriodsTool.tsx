"use client";
import React, { useState } from "react";

export const EnrollmentPeriodsTool: React.FC = () => {
  const [dob, setDob] = useState("");
  const [iepResult, setIepResult] = useState<string>("");
  const [medigapResult, setMedigapResult] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [dobError, setDobError] = useState<string>("");

  function getIEPResult(birthDate: Date, note: string) {
    const eligibleMonth = new Date(birthDate.getFullYear() + 65, birthDate.getMonth(), 1);
    const startIEP = new Date(eligibleMonth); startIEP.setMonth(startIEP.getMonth() - 3);
    const endIEP = new Date(eligibleMonth); endIEP.setMonth(endIEP.getMonth() + 3);
    endIEP.setDate(new Date(endIEP.getFullYear(), endIEP.getMonth() + 1, 0).getDate());
    const format = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    return `
      <div class='grow text-left'>
        <div class='font-semibold text-black text-lg mb-2'>Initial Enrollment Period (IEP)</div>
        <div class='font-semibold text-green-700 text-lg mb-1'>${format(startIEP)} – ${format(endIEP)}</div>
        <div class='text-sm text-gray-500'>Enroll in Part A, Part B, Part D, or Medicare Advantage. This is your Initial Enrollment Period (IEP), a 7-month window based on your 65th birthday.</div>
        ${note}
      </div>
    `;
  }

  function getMedigapResult(birthDate: Date) {
    const eligibleMonth = new Date(birthDate.getFullYear() + 65, birthDate.getMonth(), 1);
    const medigapEnd = new Date(eligibleMonth); medigapEnd.setMonth(medigapEnd.getMonth() + 6);
    medigapEnd.setDate(new Date(medigapEnd.getFullYear(), medigapEnd.getMonth() + 1, 0).getDate());
    const format = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    return `
      <div class='grow text-left'>
        <div class='font-semibold text-black text-lg mb-2'>Medigap Open Enrollment</div>
        <div class='font-semibold text-green-700 text-lg mb-1'>${format(eligibleMonth)} – ${format(medigapEnd)}</div>
        <div class='text-sm text-gray-500'>Best time to get a Medicare Supplement without underwriting. This is your Medigap Open Enrollment, a 6-month window starting with your Part B eligibility.</div>
      </div>
    `;
  }

  function showEnrollmentWindows() {
    if (!dob) {
      setDobError("Please enter your birthdate.");
      setIepResult("");
      setMedigapResult("");
      setShowResult(false);
      return;
    }
    let birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    if (age < 18 || age > 99) {
      setDobError("Please enter a birthdate for age 18 to 99.");
      setIepResult("");
      setMedigapResult("");
      setShowResult(false);
      return;
    }
    setDobError("");
    let note = "";
    if (birthDate.getDate() === 1) {
      birthDate.setMonth(birthDate.getMonth() - 1);
      note = "<p class='text-sm text-gray-500'>* Since your birthday is on the 1st, Medicare considers you eligible a month earlier.</p>";
    }
    setIepResult(getIEPResult(birthDate, note));
    setMedigapResult(getMedigapResult(birthDate));
    setShowResult(true);
  }

  return (
    <>
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-4">
        <h4 className="text-start text-lg font-semibold mb-2">Medicare Enrollment Periods</h4>
        <p className="text-center text-sm mb-6">Enter your birthdate to see when you can enroll in Medicare and Medigap.</p>
        <div className="mb-2">
          <label htmlFor="enroll_dob" className="block font-medium mb-1">Date of Birth:</label>
          <input
            type="date"
            id="enroll_dob"
            className="w-full p-2 border rounded"
            value={dob}
            onChange={e => {
              setDob(e.target.value);
              setDobError("");
            }}
          />
          {dobError && <div className="text-red-600 text-sm mt-1">{dobError}</div>}
        </div>
        <div className="text-center mt-8">
          <button
            type="button"
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            aria-haspopup="dialog"
            aria-expanded={showResult}
            aria-controls="enroll-modal"
            onClick={showEnrollmentWindows}
            disabled={dob === "" || dobError !== ""}
          >
            Show My Enrollment Periods
          </button>
        </div>
      </div>
      {showResult && (
        <div id="enroll-modal" className="fixed inset-0 z-80 overflow-x-hidden overflow-y-auto flex items-center justify-center bg-black bg-opacity-40" role="dialog" tabIndex={-1} aria-labelledby="enroll-modal-label">
          <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-100 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs pointer-events-auto">
              <div className="p-6 sm:p-7">
                <div className="text-center">
                  <h3 id="enroll-modal-label" className="block text-xl sm:text-2xl font-semibold text-gray-800 my-2">Your Medicare Enrollment Periods</h3>
                  <div className="max-w-sm mx-auto mb-6">
                  </div>
                  <hr className="my-4 border-gray-200" />
                  {/* Feature row for Initial Enrollment Period (IEP) */}
                  <div className="flex gap-x-7 py-5 first:pt-0 last:pb-0 items-start">
                    <svg className="shrink-0 mt-1 size-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <div dangerouslySetInnerHTML={{ __html: iepResult }} />
                  </div>
                  <hr className="border-gray-200" />
                  {/* Feature row for Medigap Open Enrollment */}
                  <div className="flex gap-x-7 py-5 first:pt-0 last:pb-0 items-start">
                    <svg className="shrink-0 mt-1 size-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 17v-2a4 4 0 018 0v2M9 17H7a2 2 0 01-2-2v-5a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2"/></svg>
                    <div dangerouslySetInnerHTML={{ __html: medigapResult }} />
                  </div>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-end items-center gap-x-4 p-6 sm:px-7">
                <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50" onClick={() => setShowResult(false)}>
                  Close
                </button>
                <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none" onClick={() => alert('You will be reminded at your enrollment period!')}>
                  Remind Me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
