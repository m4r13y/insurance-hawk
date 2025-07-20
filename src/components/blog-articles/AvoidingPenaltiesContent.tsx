
import React from "react";
import { PartDPenaltyEstimator } from "@/components/PartDPenaltyEstimator";
import { PartBPenaltyEstimator } from "@/components/PartBPenaltyEstimator";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { ActionButtons } from "@/components/ActionButtons";
import { BlogContent } from "@/components/BlogContent";
import { ToolCard } from "@/components/ToolCard";
import { EnrollmentPeriodsTool } from "@/components/EnrollmentPeriodsTool";

export function AvoidingPenaltiesContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      {/* Content */}
      <BlogContent>
        {/* Header */}
        <BlogHeader
          title="Medicare Late Enrollment Penalties: What They Are and How to Avoid Them"
          category="Medicare"
          date="July 19, 2025"
          intro="Missing your Medicare enrollment window can cost you — not just in stress, but in real money. Medicare has several late enrollment penalties that can stick with you for life. They’re not one-time fees. They’re monthly surcharges added to your premium for as long as you have that part of Medicare."
          breadcrumbLabel="Resources"
        />
        {/* Section Navigation - Tool Cards */}
        <nav className="my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            href="#enrollment-periods"
            icon={
              <svg className="size-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            }
            title="Medicare Enrollment Periods"
            description="Find your enrollment window and Medigap eligibility."
          />
          <ToolCard
            href="#part-b-penalty"
            icon={
              <svg className="size-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
            title="Part B Penalty Estimator"
            description="Estimate your monthly penalty for late Part B enrollment."
          />
          <ToolCard
            href="#part-d-penalty"
            icon={
              <svg className="size-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 018 0v2M9 17H7a2 2 0 01-2-2v-5a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
            }
            title="Part D Penalty Estimator"
            description="Calculate your penalty for missing drug coverage."
          />
        </nav>
      {/* Medicare Enrollment Periods Calculator */}
      <section id="enrollment-periods" className="pt-12 pb-8 border-t border-gray-200 dark:border-neutral-700 grid xl:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col justify-around">
              <div className="max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
                  <p className="mb-2">The good news is, most of these penalties are easy to avoid if you understand the rules and act early.</p>
                  <p className="mb-2">In this article, we’ll break down the three main late enrollment penalties, who they apply to, and what you can do to make sure you’re protected.</p>
              </div>
          </div>
          <div>
              <EnrollmentPeriodsTool />
          </div>
      </section>

      {/* Part B Penalties */}
      <section id="part-b-penalty" className="pt-12 pb-8 border-t border-gray-200 dark:border-neutral-700 grid xl:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col justify-around">
              <div className="max-w-md mx-auto">
                  <h2 className="text-xl font-bold mb-2">Part B Late Enrollment Penalty</h2>
                  <p className="mb-2">If you don’t sign up for Medicare Part B when you’re first eligible and don’t qualify for a Special Enrollment Period, you’ll face a penalty.</p>
                  <p className="mb-2">Your Part B premium increases by 10% for every 12-month period you were eligible but didn’t enroll. This penalty is added to your monthly premium for life.</p>
                  <p className="mb-2">This usually happens when someone delays enrolling because they feel healthy or didn’t realize their employer coverage wasn’t creditable. It also happens if someone misses their Initial Enrollment Period and doesn’t qualify for a special enrollment window.</p>
              </div>
          </div>
          <div>
              <PartBPenaltyEstimator />
          </div>
      </section>

      {/* Part D Penalty */}
      <section id="part-d-penalty" className="pt-12 pb-8 border-t border-gray-200 dark:border-neutral-700 grid xl:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col justify-around">
              <div className="max-w-md mx-auto">
                  <h2 className="text-xl font-bold mb-2">Part D Late Enrollment Penalty</h2>
                  <p className="mb-2">If you don’t have creditable prescription drug coverage when you’re first eligible for Medicare and you wait more than 63 days to get it, you’ll face a penalty.</p>
                  <p className="mb-2">The penalty is 1% of the national base premium for each full month you didn’t have drug coverage. In 2025, the base premium is around $35, so if you go 12 months without coverage, that’s about a 12% monthly surcharge added to your drug plan permanently.</p>
                  <p className="mb-2">This often happens when people think they don’t need a Part D plan because they’re not taking medications. But if you’re eligible for Medicare and don’t have other creditable drug coverage, you still need a plan to avoid this fee.</p>
              </div>
          </div>
          <div>
              <PartDPenaltyEstimator />
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

        {/* Badges/Tags/Buttons */}
        <ActionButtons
          badges={[
            { tag: "Plan" },
            { tag: "Web development" },
            { tag: "Free" },
            { tag: "Team" },
          ]}
          likes={875}
          comments={16}
        />
      {/* End Badges/Tags/Buttons */}
      </BlogContent>
    {/* Sidebar */}
    <BlogSidebar
      author={{
        name: "Jonathan Hawkins",
        avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77",
        bio: "CFP | Medicare Specialist",
      }}
      mediaLinks={[
        { title: "Enrollment Periods Explained", imageUrl: "https://placehold.co/320x320.png", href: "/dashboard/resources/enrollment-periods" },
        { title: "How to Handle Medicare If You’re Working After 65", imageUrl: "https://placehold.co/320x320.png", href: "/dashboard/resources/working-past-65" },
        { title: "How Medicare Drug Plans Work", imageUrl: "https://placehold.co/320x320.png", href: "/dashboard/resources/drug-plans-explained" }
      ]}
    />
    </div>
  );
}
