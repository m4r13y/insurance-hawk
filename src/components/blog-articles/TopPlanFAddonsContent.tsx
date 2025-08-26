
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function TopPlanFAddonsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Top Plan F Add-ons"
          category="Medicare"
          date="July 22, 2025"
          intro="See what people frequently pair with their Plan F."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Top Medigap Plan F Add-ons and Supplements" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Important Note About Plan F Availability</h2>
            <p>Medicare Plan F is no longer available to new Medicare beneficiaries as of January 1, 2020. If you already have Plan F, you can keep it.</p>
            <p>This guide is for existing Plan F holders looking to enhance their coverage with additional benefits.</p>

            <h2 className="text-xl font-bold">Why Consider Add-ons to Plan F?</h2>
            <p>Plan F covers most Medicare gaps, but it doesn't address everything. Add-on coverage can fill remaining holes in your healthcare protection.</p>
            <p>Since you already have comprehensive coverage, focus on benefits that Plan F and Medicare don't provide.</p>

            <h2 className="text-xl font-bold">Top Add-on Options for Plan F Holders</h2>
            
            <h3 className="text-lg font-semibold">1. Dental Insurance</h3>
            <p>Medicare and Plan F don't cover routine dental care. This is often the biggest gap for seniors.</p>
            
            <h4 className="text-base font-semibold">What Dental Plans Cover</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Preventive care: cleanings, exams, X-rays</li>
                <li>Basic services: fillings, extractions</li>
                <li>Major services: crowns, bridges, dentures</li>
            </ul>

            <h4 className="text-base font-semibold">Typical Costs</h4>
            <p>Monthly premiums: $25-$60. Annual maximums usually range from $1,000-$2,500.</p>

            <h3 className="text-lg font-semibold">2. Vision Coverage</h3>
            <p>Plan F covers eye exams related to medical conditions but not routine vision care.</p>
            
            <h4 className="text-base font-semibold">Vision Benefits Include</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Annual eye exams</li>
                <li>Eyeglass frames and lenses</li>
                <li>Contact lenses</li>
                <li>Discounts on vision correction surgery</li>
            </ul>

            <h4 className="text-base font-semibold">Typical Costs</h4>
            <p>Monthly premiums: $15-$30. Usually includes annual allowances for frames and lenses.</p>

            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Popular Add-on Benefits for Plan F</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-border dark:border-neutral-700 p-3 text-left font-semibold">Add-on Type</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Monthly Cost</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Annual Benefit</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Priority Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Dental</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$25-$60</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$1,000-$2,500</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">High</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Vision</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$15-$30</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$200-$400</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">Medium</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Hearing Aids</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$20-$40</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$1,000-$3,000</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">Medium</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Hospital Indemnity</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$30-$70</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$36,500+</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">Low</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold">3. Hearing Aid Coverage</h3>
            <p>Medicare covers hearing tests but not hearing aids. Quality hearing aids can cost $2,000-$6,000 per pair.</p>
            
            <h4 className="text-base font-semibold">Hearing Aid Benefits</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Coverage for digital hearing aids</li>
                <li>Hearing evaluations</li>
                <li>Fitting and adjustment services</li>
                <li>Batteries and accessories</li>
            </ul>

            <h3 className="text-lg font-semibold">4. Long-Term Care Insurance</h3>
            <p>Plan F doesn't cover long-term care costs. This is potentially the largest financial risk for seniors.</p>
            
            <h4 className="text-base font-semibold">Long-Term Care Options</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Traditional long-term care insurance</li>
                <li>Hybrid life insurance with LTC benefits</li>
                <li>Annuities with care riders</li>
            </ul>

            <h4 className="text-base font-semibold">Cost Considerations</h4>
            <p>Premiums vary widely based on age, health, and benefits. Expect $2,000-$5,000+ annually for meaningful coverage.</p>

            <h3 className="text-lg font-semibold">5. Cancer Insurance</h3>
            <p>While Plan F covers cancer treatment costs, it doesn't address income loss or non-medical expenses.</p>
            
            <h4 className="text-base font-semibold">Cancer Insurance Benefits</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Lump sum cash payment upon diagnosis</li>
                <li>Transportation and lodging benefits</li>
                <li>Income replacement during treatment</li>
                <li>Experimental treatment coverage</li>
            </ul>

            <h2 className="text-xl font-bold">Lower Priority Add-ons for Plan F</h2>
            
            <h3 className="text-lg font-semibold">Hospital Indemnity Plans</h3>
            <p>Since Plan F already covers Medicare gaps, hospital indemnity provides limited additional value.</p>
            <p>Consider only if you want extra cash for non-medical expenses during hospital stays.</p>

            <h3 className="text-lg font-semibold">Critical Illness Insurance</h3>
            <p>Plan F covers medical costs for critical illnesses. These plans mainly help with income replacement.</p>

            <h3 className="text-lg font-semibold">Accident Insurance</h3>
            <p>Plan F covers accident-related medical costs. Accident insurance might provide some cash benefits but isn't usually necessary.</p>

            <h2 className="text-xl font-bold">How to Prioritize Add-on Coverage</h2>
            
            <h3 className="text-lg font-semibold">Step 1: Assess Your Current Gaps</h3>
            <p>Look at expenses not covered by Medicare and Plan F:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>How much do you spend on dental care annually?</li>
                <li>Do you need glasses or contacts?</li>
                <li>Have you experienced hearing loss?</li>
                <li>What's your long-term care plan?</li>
            </ul>

            <h3 className="text-lg font-semibold">Step 2: Calculate Return on Investment</h3>
            <p>Compare annual premiums to potential benefits. If you pay $400/year for dental coverage with a $1,500 maximum, you need $400+ in dental expenses to break even.</p>

            <h3 className="text-lg font-semibold">Step 3: Consider Your Budget</h3>
            <p>Add-on premiums can quickly add up. Prioritize coverage for expenses you can't easily handle out-of-pocket.</p>

            <h2 className="text-xl font-bold">Bundling vs Individual Policies</h2>
            
            <h3 className="text-lg font-semibold">Advantages of Bundling</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Potential premium discounts</li>
                <li>Single bill and customer service contact</li>
                <li>Simplified claims processes</li>
            </ul>

            <h3 className="text-lg font-semibold">Advantages of Individual Policies</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Shop for best value in each category</li>
                <li>Flexibility to change individual coverages</li>
                <li>Avoid paying for benefits you don't need</li>
            </ul>

            <h2 className="text-xl font-bold">Special Considerations for Plan F Holders</h2>
            
            <h3 className="text-lg font-semibold">You're Already Well-Covered</h3>
            <p>Plan F provides excellent medical coverage. Focus add-ons on non-medical benefits rather than additional medical insurance.</p>

            <h3 className="text-lg font-semibold">Consider Future Availability</h3>
            <p>Since Plan F is no longer available to new Medicare beneficiaries, hold onto your coverage. It may become more valuable over time.</p>

            <h3 className="text-lg font-semibold">Budget for Premium Increases</h3>
            <p>Plan F premiums will likely increase over time. Make sure you can afford both Plan F and any add-ons long-term.</p>

            <h2 className="text-xl font-bold">Enrollment Timing and Rules</h2>
            
            <h3 className="text-lg font-semibold">Dental and Vision</h3>
            <p>Usually available year-round with immediate or short waiting periods.</p>

            <h3 className="text-lg font-semibold">Long-Term Care</h3>
            <p>Requires medical underwriting. Apply while you're healthy.</p>

            <h3 className="text-lg font-semibold">Cancer and Critical Illness</h3>
            <p>Often have waiting periods and health questions. Earlier enrollment is better.</p>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Key advice:</strong> As a Plan F holder, you have excellent medical coverage. Focus add-ons on services Medicare doesn't cover rather than duplicating existing benefits.
            </blockquote>

            <h2 className="text-xl font-bold">Making Smart Add-on Decisions</h2>
            <p>Don't feel pressured to buy every available add-on. Plan F already provides comprehensive medical coverage.</p>
            <p>Focus on the 1-2 add-ons that address your biggest gaps or concerns. Dental coverage is often the highest priority since it's expensive and commonly needed.</p>
            <p>Remember that you can always add more coverage later, but it's harder to reduce coverage you don't need.</p>

            <h2 className="text-xl font-bold">The Bottom Line for Plan F Holders</h2>
            <p>Your Plan F coverage handles most medical expenses well. Smart add-ons focus on services Medicare excludes entirely.</p>
            <p>Dental coverage should be your top priority, followed by vision if you wear glasses. Long-term care coverage is important but expensive.</p>
            <p>Avoid add-ons that duplicate your existing excellent medical coverage. Instead, focus on areas where you have genuine gaps in protection.</p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Plan F" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/top-plan-f-addons"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Medigap Rate Increases", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medigap-rate-increases" },
          { title: "Medicare Beginner's Guide", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medicare-beginners-guide" }
        ]}
      />
    </div>
  );
}

