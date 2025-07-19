
import React from "react";
export const metadata = {
  title: "Avoid Medicare Late Enrollment Penalties: A Complete Guide",
  description: "Learn about the different Medicare late enrollment penalties, how much they cost, and simple steps you can take to avoid them.",
  keywords: ["Medicare Late Enrollment Penalties", "Medicare penalties", "Medicare enrollment", "Medicare Part B penalty", "Medicare Part D penalty"]
};

export default function BlogArticlePage() {
  return (
    <div className="max-w-[85rem] px-12 sm:px-6 lg:px-8 mx-auto">
      <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-8">
        {/* Content */}
        <div className="lg:col-span-2">
          <div className="py-12 lg:pe-12">
            <div className="space-y-8">
              {/* Header */}
              <div className="mb-8 pb-6 border-b border-gray-200 dark:border-neutral-700">
                <a className="inline-flex items-center gap-x-1.5 text-sm text-gray-600 decoration-2 hover:underline focus:outline-hidden focus:underline dark:text-blue-500" href="#">
                  <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Back to Blog
                </a>
                <h1 className="text-3xl font-bold lg:text-5xl dark:text-white mt-4 mb-2">Medicare Late Enrollment Penalties: What They Are and How to Avoid Them</h1>
                <div className="flex items-center gap-x-5 mb-2">
                  <a className="inline-flex items-center gap-1.5 py-1 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800" href="#">Medicare</a>
                  <p className="text-xs sm:text-sm text-gray-800 dark:text-neutral-200">July 19, 2025</p>
                </div>
                <p className="text-lg text-gray-800 dark:text-neutral-200">Missing your Medicare enrollment window can cost you — not just in stress, but in real money. Medicare has several late enrollment penalties that can stick with you for life. They’re not one-time fees. They’re monthly surcharges added to your premium for as long as you have that part of Medicare.</p>
              </div>
              {/* Section Navigation - Tool Cards */}
              <nav className="my-8 flex flex-wrap gap-4 justify-center">
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                  {/* Tool Cards */}
                  <a href="#enrollment-periods" className="bg-white rounded-xl shadow-lg border border-blue-100 hover:border-blue-300 transition p-8 flex flex-col items-center text-center">
                    <svg className="mb-3 size-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="font-semibold text-lg mb-1">Medicare Enrollment Periods</span>
                    <span className="text-sm text-gray-500">Find your enrollment window and Medigap eligibility.</span>
                  </a>
                  <a href="#part-b-penalty" className="bg-white rounded-xl shadow-lg border border-blue-100 hover:border-blue-300 transition p-8 flex flex-col items-center text-center">
                    <svg className="mb-3 size-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-semibold text-lg mb-1">Part B Penalty Estimator</span>
                    <span className="text-sm text-gray-500">Estimate your monthly penalty for late Part B enrollment.</span>
                  </a>
                  <a href="#part-d-penalty" className="bg-white rounded-xl shadow-lg border border-blue-100 hover:border-blue-300 transition p-8 flex flex-col items-center text-center">
                    <svg className="mb-3 size-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 018 0v2M9 17H7a2 2 0 01-2-2v-5a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
                    <span className="font-semibold text-lg mb-1">Part D Penalty Estimator</span>
                    <span className="text-sm text-gray-500">Calculate your penalty for missing drug coverage.</span>
                  </a>
                </div>
                {/*<a href="#avoid-penalties" className="px-6 py-3 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-hidden focus:bg-blue-100 font-medium transition shadow">How to Avoid Penalties</a>
              */}
              </nav>
            {/* Medicare Enrollment Periods Calculator */}
            <section id="enrollment-periods" className="pt-12 pb-8 border-t border-gray-200 dark:border-neutral-700 flex justify-stretch gap-12">
                <div className="w-7/12 flex flex-col justify-around">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
                        <p className="mb-2">The good news is, most of these penalties are easy to avoid if you understand the rules and act early.</p>
                        <p className="mb-2">In this article, we’ll break down the three main late enrollment penalties, who they apply to, and what you can do to make sure you’re protected.</p>
                    </div>
                </div>
                <div className="w-5/12">
                    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-4">
                        <h4 className="text-start text-lg font-semibold mb-2">Medicare Enrollment Periods</h4>
                        <div className="mb-2">
                            <label htmlFor="enroll_dob" className="block font-medium mb-1">Date of Birth:</label>
                            <input type="date" id="enroll_dob" className="w-full p-2 border rounded" />
                        </div>
                        <div className="flex justify-center">
                            <button className="w-full mt-8 py-2 bg-blue-700 text-white rounded">Show My Enrollment Periods</button>
                        </div>
                        <div id="enroll_results" className="mt-4 p-3 border rounded bg-gray-50" style={{display: 'none'}}></div>
                    </div>
                </div>
            </section>

            {/* Part B Penalties */}
            <section id="part-b-penalty" className="pt-12 pb-8 border-t border-gray-200 dark:border-neutral-700 flex justify-stretch gap-12">
                <div className="w-7/12 flex flex-col justify-around">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-xl font-bold mb-2">Part B Late Enrollment Penalty</h2>
                        <p className="mb-2">If you don’t sign up for Medicare Part B when you’re first eligible and don’t qualify for a Special Enrollment Period, you’ll face a penalty.</p>
                        <p className="mb-2">Your Part B premium increases by 10% for every 12-month period you were eligible but didn’t enroll. This penalty is added to your monthly premium for life.</p>
                        <p className="mb-2">This usually happens when someone delays enrolling because they feel healthy or didn’t realize their employer coverage wasn’t creditable. It also happens if someone misses their Initial Enrollment Period and doesn’t qualify for a special enrollment window.</p>
                    </div>
                </div>
                <div className="w-5/12">
                    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-4">
                        <h4 className="text-start text-lg font-semibold mb-4">Part B Penalty Estimator</h4>
                        <div className="mb-2">
                            <label htmlFor="bmonthsLate" className="block font-medium mb-2">How many months did you delay?</label>
                            <input type="number" id="bmonthsLate" min="0" max="600" placeholder="e.g. 29" className="w-full p-2 border rounded" />
                        </div>
                        <div className="flex justify-center">
                            <button className="w-full mt-8 py-2 bg-blue-700 text-white rounded">Calculate Penalty</button>
                        </div>
                        <div id="bPenaltyResult" className="mt-4 p-3 border rounded bg-gray-50" style={{display: 'none'}}></div>
                    </div>
                </div>
            </section>

            {/* Part D Penalty */}
            <section id="part-d-penalty" className="pt-12 pb-8 border-t border-gray-200 dark:border-neutral-700 flex justify-stretch gap-12">
                <div className="w-7/12 flex flex-col justify-around">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-xl font-bold mb-2">Part D Late Enrollment Penalty</h2>
                        <p className="mb-2">If you don’t have creditable prescription drug coverage when you’re first eligible for Medicare and you wait more than 63 days to get it, you’ll face a penalty.</p>
                        <p className="mb-2">The penalty is 1% of the national base premium for each full month you didn’t have drug coverage. In 2025, the base premium is around $35, so if you go 12 months without coverage, that’s about a 12% monthly surcharge added to your drug plan permanently.</p>
                        <p className="mb-2">This often happens when people think they don’t need a Part D plan because they’re not taking medications. But if you’re eligible for Medicare and don’t have other creditable drug coverage, you still need a plan to avoid this fee.</p>
                    </div>
                </div>
                <div className="w-5/12">
                    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-4">
                        <h4 className="text-start text-lg font-semibold mb-2">Part D Penalty Estimator</h4>
                    <div className="mb-2">
                        <label htmlFor="pdpmonthsLate" className="block font-medium mb-1">Months without creditable coverage:</label>
                        <input type="number" id="pdpmonthsLate" min="0" max="999" placeholder="e.g. 14" className="w-full p-2 border rounded" />
                    </div>
                        <div className="flex justify-center">
                            <button className="w-full mt-8 py-2 bg-blue-700 text-white rounded">Calculate Penalty</button>
                        </div>
                        <div id="penaltyDisplay" className="mt-4 p-3 border rounded bg-gray-50" style={{display: 'none'}}></div>
                    </div>
                </div>
            </section>


              <section id="avoid-penalties" className="py-8 border-t border-gray-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold my-4">How to Avoid Late Enrollment Penalties</h2>
                <ul className="list-disc pl-6 mb-4">
                  <li>Enroll during your Initial Enrollment Period (IEP): This is the 7-month window around your 65th birthday (3 months before, the month of, and 3 months after).</li>
                  <li>If you’re still working, make sure your coverage is creditable: Employer coverage can delay the need for Part B and Part D, but it must meet Medicare’s standards. Not all plans do.</li>
                  <li>Keep records of your prior coverage: If you delay enrollment due to employer coverage, make sure to get proof from your employer showing your coverage was creditable.</li>
                  <li>Consider enrolling in a $0 premium Part D plan: Even if you’re not taking medications, this keeps you penalty-free and protects against future costs.</li>
                </ul>
                <p className="mb-2">Need Help Timing Your Enrollment?<br />If you’re unsure when you should enroll or whether your current coverage qualifies, don’t guess. We’ll walk you through the exact deadlines and make sure you’re protected from unnecessary penalties.<br />We’ve helped hundreds of people avoid costly mistakes, and we’d be happy to do the same for you.</p>
                <button className="my-8 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold">Schedule Your Medicare Review</button>
              </section>

              
              {/* Badges/Tags */}
              <div className="pt-8 flex justify-between">
              <div className="mb-2 flex justify-end">
                <a className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" href="#">Plan</a>
                <a className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" href="#">Web development</a>
                <a className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" href="#">Free</a>
                <a className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" href="#">Team</a>
              </div>
              {/* End Badges/Tags */}
              {/* Like, Comment, Share Buttons */}
              <div className="flex justify-end items-center gap-x-1.5 mb-4">
                {/* Like Button */}
                <div className="hs-tooltip inline-block relative">
                  <button type="button" className="hs-tooltip-toggle flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200">
                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    875
                    <span className="hs-tooltip-content absolute z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded-md shadow-2xs dark:bg-black opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible">Like</span>
                  </button>
                </div>
                {/* Divider */}
                <div className="block h-3 border-e border-gray-300 mx-3 dark:border-neutral-600"></div>
                {/* Comment Button */}
                <div className="hs-tooltip inline-block relative">
                  <button type="button" className="hs-tooltip-toggle flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200">
                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                    16
                    <span className="hs-tooltip-content absolute z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded-md shadow-2xs dark:bg-black opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible">Comment</span>
                  </button>
                </div>
                {/* Divider */}
                <div className="block h-3 border-e border-gray-300 mx-3 dark:border-neutral-600"></div>
                {/* Share Button Dropdown */}
                <div className="hs-dropdown relative inline-flex">
                  <button id="hs-blog-article-share-dropdown" type="button" className="hs-dropdown-toggle flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                    Share
                  </button>
                  <div className="hs-dropdown-menu w-56 transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden mb-1 z-10 bg-gray-900 shadow-md rounded-xl p-2 dark:bg-black" role="menu" aria-orientation="vertical" aria-labelledby="hs-blog-article-share-dropdown">
                    <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-400 hover:bg-white/10 focus:outline-hidden focus:bg-white/10 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus:bg-neutral-900" href="#">
                      <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      Copy link
                    </a>
                    <div className="border-t border-gray-600 my-2 dark:border-neutral-800"></div>
                    <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-400 hover:bg-white/10 focus:outline-hidden focus:bg-white/10 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus:bg-neutral-900" href="#">
                      <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                      </svg>
                      Share on Twitter
                    </a>
                    <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-400 hover:bg-white/10 focus:outline-hidden focus:bg-white/10 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus:bg-neutral-900" href="#">
                      <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                      </svg>
                      Share on Facebook
                    </a>
                    <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-400 hover:bg-white/10 focus:outline-hidden focus:bg-white/10 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus:bg-neutral-900" href="#">
                      <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                      </svg>
                      Share on LinkedIn
                    </a>
                  </div>
                </div>
                {/* End Share Button Dropdown */}
              </div>
              {/* End Like, Comment, Share Buttons */}
              </div>
            </div>
          </div>
      </div>
      {/* Sidebar */}
      <div className="lg:col-span-1 lg:w-full lg:h-full bg-gradient-to-r from-gray-50 via-transparent to-transparent dark:from-neutral-800">
        <div className="sticky top-0 start-0 py-8 lg:ps-8">
          {/* Avatar Media */}
          <div className="group flex items-center gap-x-3 border-b border-gray-200 pb-8 mb-8 dark:border-neutral-700">
            <a className="block shrink-0 focus:outline-hidden" href="#">
              <img className="size-10 rounded-full" src="https://images.unsplash.com/photo-1669837401587-f9a4cfe3126e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80" alt="Avatar" />
            </a>
            <a className="group grow block focus:outline-hidden" href="">
              <h5 className="group-hover:text-gray-600 group-focus:text-gray-600 text-sm font-semibold text-gray-800 dark:group-hover:text-neutral-400 dark:group-focus:text-neutral-400 dark:text-neutral-200">
                Leyla Ludic
              </h5>
              <p className="text-sm text-gray-500 dark:text-neutral-500">
                UI/UX enthusiast
              </p>
            </a>
            <div className="grow">
              <div className="flex justify-end">
                <button type="button" className="py-1.5 px-2.5 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                  <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                  Follow
                </button>
              </div>
            </div>
          </div>
          {/* End Avatar Media */}
          <div className="space-y-6">
            {/* Media */}
            <a className="group flex items-center gap-x-6 focus:outline-hidden" href="#">
              <div className="grow">
                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 group-focus:text-blue-600 dark:text-neutral-200 dark:group-hover:text-blue-500 dark:group-focus:text-blue-500">
                  5 Reasons to Not start a UX Designer Career in 2022/2023
                </span>
              </div>
              <div className="shrink-0 relative rounded-lg overflow-hidden size-20">
                <img className="size-full absolute top-0 start-0 object-cover rounded-lg" src="https://images.unsplash.com/photo-1567016526105-22da7c13161a?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=80" alt="Blog Image" />
              </div>
            </a>
            {/* End Media */}
            {/* Media */}
            <a className="group flex items-center gap-x-6 focus:outline-hidden" href="#">
              <div className="grow">
                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 group-focus:text-blue-600 dark:text-neutral-200 dark:group-hover:text-blue-500 dark:group-focus:text-blue-500">
                  If your UX Portfolio has this 20% Well Done, it Will Give You an 80% Result
                </span>
              </div>
              <div className="shrink-0 relative rounded-lg overflow-hidden size-20">
                <img className="size-full absolute top-0 start-0 object-cover rounded-lg" src="https://images.unsplash.com/photo-1542125387-c71274d94f0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=80" alt="Blog Image" />
              </div>
            </a>
            {/* End Media */}
            {/* Media */}
            <a className="group flex items-center gap-x-6 focus:outline-hidden" href="#">
              <div className="grow">
                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 group-focus:text-blue-600 dark:text-neutral-200 dark:group-hover:text-blue-500 dark:group-focus:text-blue-500">
                  7 Principles of Icon Design
                </span>
              </div>
              <div className="shrink-0 relative rounded-lg overflow-hidden size-20">
                <img className="size-full absolute top-0 start-0 object-cover rounded-lg" src="https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=80" alt="Blog Image" />
              </div>
            </a>
            {/* End Media */}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
