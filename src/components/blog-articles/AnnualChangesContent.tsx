
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function AnnualChangesContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Annual Changes"
          category="Medicare"
          date="July 22, 2025"
          intro="The meaning of annual changes and what to look for."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Medicare Changes for 2025 Explained" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">What's Different About Medicare in 2025?</h2>
            <p>Every October, Medicare announces changes for the next year. Some years bring big surprises. Others just small tweaks to costs and coverage.</p>
            <p>The good news? Most of the major changes for 2025 help people save money or get better benefits. Here's what matters most.</p>

            <h2 className="text-xl font-bold">Part B Premium Stays Steady</h2>
            <p>The standard Part B premium is $185 per month in 2025. That's only a $10 increase from 2024.</p>
            <p>Your actual premium might be different if you have higher income. Medicare charges extra for people making more than $103,000 (single) or $206,000 (married filing jointly).</p>
            
            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">2025 Part B Premiums by Income</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Single Income</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Married Filing Jointly</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Monthly Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$103,000 or less</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$206,000 or less</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$185</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$103,001–$129,000</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$206,001–$258,000</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$259.00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$129,001–$161,000</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$258,001–$322,000</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$370.90</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$161,001–$193,000</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$322,001–$386,000</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$482.80</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$193,000+</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">$386,000+</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$518.70</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold">The $2,000 Drug Cost Cap is Here</h2>
            <p>This is the biggest change for 2025. Your Part D drug costs are now capped at $2,000 per year.</p>
            <p>Once you hit that limit, you pay nothing more for covered prescriptions. No matter if your drugs normally cost $500 or $5,000 per month.</p>
            
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Real-world impact:</strong> If you take expensive medications, this cap could save you thousands. Some people were paying $10,000+ per year before this change.
            </blockquote>

            <h2 className="text-xl font-bold">Medicare Advantage Gets Better Benefits</h2>
            <p>Many Medicare Advantage plans added new benefits for 2025. Look for expanded dental coverage, vision benefits, and wellness programs.</p>
            <p>Some plans now cover things like hearing aids, over-the-counter items, and even home modifications for safety.</p>

            <h2 className="text-xl font-bold">Medigap Plans Stay the Same</h2>
            <p>No major changes to Medicare supplement plans this year. The standardized benefits remain the same across all insurance companies.</p>
            <p>Premiums might go up or down depending on your state and insurance company. Shop around during your birthday month if your state allows it.</p>

            <h2 className="text-xl font-bold">What Should You Do Before December 7?</h2>
            <p>Review your current coverage during Open Enrollment (October 15 to December 7). Even small changes could save you money or get you better benefits.</p>
            <p>Check if your doctors are still in-network. Make sure your prescriptions are covered at the same cost level. Look at total costs, not just premiums.</p>

            <h2 className="text-xl font-bold">Don't Wait Until the Last Minute</h2>
            <p>Changes you make during Open Enrollment start January 1, 2025. But don't wait until December to review your options.</p>
            <p>Plans get more popular as the deadline approaches. Some might even stop accepting new members if they get too full.</p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Advantage" }]}
            likes={0}
            comments={0}
            shareUrl="/resources/annual-changes"
          />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Enrollment Periods Explained", imageUrl: "https://placehold.co/320x320.png", href: "/resources/enrollment-periods" },
          { title: "How to Choose the Right Medicare Advantage Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-advantage-plans" },
          { title: "How Medicare Drug Plans Work", imageUrl: "https://placehold.co/320x320.png", href: "/resources/drug-plans-explained" }
        ]}
      />
    </div>
  );
}

