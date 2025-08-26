
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function PdpProsConsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="PDP Pros & Cons"
          category="Medicare"
          date="July 22, 2025"
          intro="Learn the pros an cons for Prescription Drug Plans."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Medicare Part D Pros and Cons Explained" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">The Case for Medicare Part D Plans</h2>
            <p>Standalone Part D plans work with Original Medicare to provide prescription drug coverage. They're not perfect, but they offer important advantages.</p>

            <h2 className="text-xl font-bold">Pros of Part D Plans</h2>
            
            <h3 className="text-lg font-semibold">1. Work With Any Medicare Coverage</h3>
            <p>Part D plans complement Original Medicare and Medigap perfectly. You keep your doctor choice and coverage flexibility.</p>
            <p>Unlike Medicare Advantage drug coverage, Part D doesn't restrict your healthcare providers.</p>

            <h3 className="text-lg font-semibold">2. Nationwide Coverage</h3>
            <p>Part D plans work anywhere in the United States. Perfect if you travel or spend time in different states.</p>
            <p>No worries about network restrictions when you're away from home.</p>

            <h3 className="text-lg font-semibold">3. $2,000 Annual Cap in 2025</h3>
            <p>The new out-of-pocket maximum provides real protection against catastrophic drug costs.</p>
            <p>Once you spend $2,000 on covered medications, you pay nothing more for the rest of the year.</p>

            <h3 className="text-lg font-semibold">4. Wide Range of Options</h3>
            <p>Most areas have 20+ Part D plans to choose from. You can find a plan that covers your specific medications at reasonable costs.</p>

            <h3 className="text-lg font-semibold">5. Flexibility to Change Plans</h3>
            <p>Switch Part D plans every year during Open Enrollment without penalty. Easy to adapt as your medication needs change.</p>

            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Part D vs Medicare Advantage Drug Coverage</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Feature</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Standalone Part D</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Medicare Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Doctor Choice</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Any Medicare provider</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Plan network only</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Travel Coverage</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Nationwide</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Limited to service area</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Plan Changes</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Drug plan only</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Entire health plan</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold">Cons of Part D Plans</h2>
            
            <h3 className="text-lg font-semibold">1. Additional Monthly Premium</h3>
            <p>Part D plans add another bill to your Medicare costs. Typical premiums range from $30-$60 per month.</p>
            <p>Medicare Advantage plans often include drug coverage at no additional premium.</p>

            <h3 className="text-lg font-semibold">2. Coverage Gap Complexity</h3>
            <p>Even with the $2,000 cap, understanding how Part D coverage phases work can be confusing.</p>
            <p>Deductibles, initial coverage periods, and catastrophic coverage create complex cost calculations.</p>

            <h3 className="text-lg font-semibold">3. Formulary Restrictions</h3>
            <p>Not all Part D plans cover every medication. Some drugs require prior authorization or step therapy.</p>
            <p>Your preferred medication might not be covered or could be expensive on certain plans.</p>

            <h3 className="text-lg font-semibold">4. Late Enrollment Penalties</h3>
            <p>Skip Part D and face lifelong penalties if you enroll later without creditable coverage.</p>
            <p>The penalty is 1% of the national base premium for each month you go without coverage.</p>

            <h3 className="text-lg font-semibold">5. Annual Plan Changes</h3>
            <p>Your Part D plan can change its formulary, costs, and pharmacy networks each year.</p>
            <p>What works great this year might be expensive or inadequate next year.</p>

            <h2 className="text-xl font-bold">Who Benefits Most from Part D Plans?</h2>
            
            <h3 className="text-lg font-semibold">Original Medicare Users</h3>
            <p>If you have Original Medicare with or without Medigap, Part D is usually your best drug coverage option.</p>

            <h3 className="text-lg font-semibold">Frequent Travelers</h3>
            <p>Part D coverage works nationwide, unlike Medicare Advantage plans with limited service areas.</p>

            <h3 className="text-lg font-semibold">People Who Want Provider Choice</h3>
            <p>Part D doesn't restrict which doctors or hospitals you can use for medical care.</p>

            <h3 className="text-lg font-semibold">Those With Expensive Medications</h3>
            <p>The $2,000 out-of-pocket cap provides valuable protection for people with high drug costs.</p>

            <h2 className="text-xl font-bold">Who Might Consider Alternatives?</h2>
            
            <h3 className="text-lg font-semibold">Budget-Conscious Consumers</h3>
            <p>Medicare Advantage plans often include drug coverage at lower total monthly costs.</p>

            <h3 className="text-lg font-semibold">People Who Take Few Medications</h3>
            <p>If you only take one or two generic drugs, Medicare Advantage might be more cost-effective.</p>

            <h3 className="text-lg font-semibold">Those Who Want Simplicity</h3>
            <p>Medicare Advantage combines medical and drug coverage in one plan with one card and one customer service number.</p>

            <h2 className="text-xl font-bold">Cost Comparison Example</h2>
            <p>Let's compare costs for someone taking two common medications:</p>

            <h3 className="text-lg font-semibold">Scenario: 68-year-old with diabetes and high blood pressure</h3>
            <p>Medications: Metformin (generic) and Lisinopril (generic)</p>

            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Annual Cost Comparison</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Option</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Premiums</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Drug Costs</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Part D Plan</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$480</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$240</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$720</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Medicare Advantage</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$0</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$360</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$360</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">No Coverage</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$0</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$600</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$600</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold">Tips for Choosing Part D Plans</h2>
            
            <h3 className="text-lg font-semibold">1. Use Medicare's Plan Finder</h3>
            <p>Enter your specific medications to compare actual costs across available plans.</p>
            <p>Don't just look at premiums—total annual cost is what matters.</p>

            <h3 className="text-lg font-semibold">2. Check Your Pharmacy</h3>
            <p>Make sure your preferred pharmacy is in the plan's network. Out-of-network pharmacies cost significantly more.</p>

            <h3 className="text-lg font-semibold">3. Consider Mail Order</h3>
            <p>Many plans offer lower costs for 90-day supplies through mail-order pharmacies.</p>

            <h3 className="text-lg font-semibold">4. Read the Fine Print</h3>
            <p>Check for prior authorization requirements, quantity limits, and step therapy rules on your medications.</p>

            <h2 className="text-xl font-bold">Common Part D Mistakes</h2>
            
            <h3 className="text-lg font-semibold">Choosing Based on Premium Alone</h3>
            <p>The cheapest premium might have the highest drug costs. Always calculate total annual expenses.</p>

            <h3 className="text-lg font-semibold">Not Reviewing Annually</h3>
            <p>Plans change their formularies and costs each year. What worked last year might be expensive this year.</p>

            <h3 className="text-lg font-semibold">Ignoring Generic Alternatives</h3>
            <p>Generic drugs can save hundreds per year compared to brand names. Ask your doctor about alternatives.</p>

            <h2 className="text-xl font-bold">The Bottom Line on Part D</h2>
            <p>Part D plans offer valuable prescription drug protection, especially with the new $2,000 out-of-pocket cap.</p>
            <p>They work best for people who want to keep Original Medicare and maintain maximum flexibility in their healthcare choices.</p>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Key takeaway:</strong> Part D plans aren't perfect, but they provide essential protection against high drug costs while preserving your freedom to choose any Medicare provider.
            </blockquote>

            <h2 className="text-xl font-bold">Making Your Decision</h2>
            <p>Consider Part D if you:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Want to keep your current doctors</li>
                <li>Travel frequently or live in multiple states</li>
                <li>Take expensive medications</li>
                <li>Prefer predictable medical coverage with Original Medicare + Medigap</li>
            </ul>

            <p>Consider Medicare Advantage if you:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Want to minimize monthly premiums</li>
                <li>Take few or no medications</li>
                <li>Don't mind network restrictions</li>
                <li>Want all-in-one coverage simplicity</li>
            </ul>

            <p>Remember, you can change your mind each year during Open Enrollment. Start with what makes sense for your current situation and adjust as needed.</p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "PDP" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/pdp-pros-cons"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "How Medicare Drug Plans Work", imageUrl: "https://placehold.co/320x320.png", href: "/resources/drug-plans-explained" },
          { title: "Compare PDP Plans", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-pdp-plans" }
        ]}
      />
    </div>
  );
}

