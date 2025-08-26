
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function TopPlanGAddonsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Top Plan G Add-ons"
          category="Medicare"
          date="July 22, 2025"
          intro="See what people frequently pair with their Plan G."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Best Medigap Plan G Add-ons and Supplements" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Why Plan G Holders Need Add-on Coverage</h2>
            <p>Plan G covers almost all Medicare gaps except the Part B deductible. While it's excellent medical coverage, it doesn't address many healthcare-related expenses.</p>
            <p>Smart add-ons fill the biggest remaining gaps without duplicating your existing comprehensive coverage.</p>

            <h2 className="text-xl font-bold">Top Priority Add-ons for Plan G</h2>
            
            <h3 className="text-lg font-semibold">1. Dental Insurance</h3>
            <p>This is the most important gap for Plan G holders. Medicare and Plan G provide zero coverage for routine dental care.</p>
            
            <h4 className="text-base font-semibold">What Good Dental Plans Cover</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Preventive (100% coverage):</strong> Cleanings, exams, X-rays</li>
                <li><strong>Basic (70-80% coverage):</strong> Fillings, extractions, periodontal care</li>
                <li><strong>Major (50% coverage):</strong> Crowns, bridges, dentures</li>
            </ul>

            <h4 className="text-base font-semibold">Cost vs Benefit Analysis</h4>
            <p>Monthly premiums: $30-$50. Annual maximums: $1,000-$2,500.</p>
            <p>If you need a crown ($1,200) and two cleanings ($300), dental insurance saves you money even in year one.</p>

            <h3 className="text-lg font-semibold">2. Vision Coverage</h3>
            <p>Plan G covers medically necessary eye care but not routine vision services or eyewear.</p>
            
            <h4 className="text-base font-semibold">Typical Vision Benefits</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Annual comprehensive eye exam</li>
                <li>$150-$300 allowance for frames</li>
                <li>Coverage for standard lenses</li>
                <li>Discounts on upgrades and contacts</li>
            </ul>

            <h4 className="text-base font-semibold">When Vision Coverage Makes Sense</h4>
            <p>If you wear glasses or contacts, vision coverage usually pays for itself. Monthly premiums of $20-$35 are often less than one pair of glasses per year.</p>

            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Plan G Add-on Priority Ranking</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-border dark:border-neutral-700 p-3 text-left font-semibold">Add-on Type</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Priority</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Monthly Cost</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-left font-semibold">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Dental Insurance</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">High</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$30-$50</td>
                    <td className="border border-border dark:border-neutral-700 p-2">Everyone with natural teeth</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Vision Coverage</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">Medium</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$20-$35</td>
                    <td className="border border-border dark:border-neutral-700 p-2">Glasses/contact wearers</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Long-Term Care</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">High</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$200-$400</td>
                    <td className="border border-border dark:border-neutral-700 p-2">People under 70</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Hearing Aids</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">Medium</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$25-$45</td>
                    <td className="border border-border dark:border-neutral-700 p-2">Those with hearing loss</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold">3. Long-Term Care Insurance</h3>
            <p>This represents the largest potential financial risk not covered by Plan G. Medicare only covers short-term skilled nursing care.</p>
            
            <h4 className="text-base font-semibold">Long-Term Care Options</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Traditional LTC insurance:</strong> Pays for nursing home, assisted living, or home care</li>
                <li><strong>Hybrid life/LTC policies:</strong> Life insurance with LTC benefits</li>
                <li><strong>Annuities with care riders:</strong> Investment vehicle with care benefits</li>
            </ul>

            <h4 className="text-base font-semibold">Cost and Timing Considerations</h4>
            <p>Apply while healthy. Premiums increase significantly with age and health issues.</p>
            <p>A 65-year-old might pay $2,500/year for $150/day benefits. A 75-year-old could pay $4,000+ for the same coverage.</p>

            <h3 className="text-lg font-semibold">4. Hearing Aid Coverage</h3>
            <p>Medicare covers hearing tests but not hearing aids. Quality devices cost $2,000-$6,000 per pair.</p>
            
            <h4 className="text-base font-semibold">Hearing Aid Benefits</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Annual hearing evaluations</li>
                <li>Allowances for digital hearing aids</li>
                <li>Professional fitting and adjustments</li>
                <li>Replacement batteries and accessories</li>
            </ul>

            <h2 className="text-xl font-bold">Medium Priority Add-ons</h2>
            
            <h3 className="text-lg font-semibold">Cancer Insurance</h3>
            <p>While Plan G covers cancer treatment costs, cancer insurance provides cash for non-medical expenses.</p>
            
            <h4 className="text-base font-semibold">What Cancer Insurance Covers</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Lump sum cash payment upon diagnosis</li>
                <li>Income replacement during treatment</li>
                <li>Transportation to specialty facilities</li>
                <li>Experimental treatments not covered by Medicare</li>
            </ul>

            <h3 className="text-lg font-semibold">International Travel Insurance</h3>
            <p>Plan G includes limited foreign emergency coverage. Separate travel insurance provides broader protection.</p>
            
            <h4 className="text-base font-semibold">When Travel Insurance Helps</h4>
            <ul className="list-disc pl-6 space-y-2">
                <li>Extended international trips</li>
                <li>Medical evacuation coverage</li>
                <li>Trip cancellation due to health issues</li>
                <li>Coverage in countries Medicare doesn't cover</li>
            </ul>

            <h2 className="text-xl font-bold">Lower Priority Add-ons for Plan G</h2>
            
            <h3 className="text-lg font-semibold">Hospital Indemnity Plans</h3>
            <p>Since Plan G covers most hospital costs, these provide limited additional value.</p>
            <p>Consider only if you want extra cash for comfort items or family expenses during hospital stays.</p>

            <h3 className="text-lg font-semibold">Critical Illness Insurance</h3>
            <p>Plan G covers medical treatment for critical illnesses. These plans mainly help with income replacement.</p>

            <h3 className="text-lg font-semibold">Accident Insurance</h3>
            <p>Plan G already covers accident-related medical costs. Limited additional benefit for most people.</p>

            <h2 className="text-xl font-bold">Smart Shopping Strategies</h2>
            
            <h3 className="text-lg font-semibold">Start With the Biggest Gaps</h3>
            <p>Dental coverage should be your first add-on. It's needed regularly and Medicare provides zero coverage.</p>

            <h3 className="text-lg font-semibold">Calculate Break-Even Points</h3>
            <p>For each add-on, calculate how much you'd need to use annually to justify the premium cost.</p>
            
            <h4 className="text-base font-semibold">Example: Vision Coverage</h4>
            <p>Premium: $25/month ($300/year)</p>
            <p>Break-even: One pair of glasses ($300) or eye exam ($150) plus contacts ($150)</p>

            <h3 className="text-lg font-semibold">Consider Waiting Periods</h3>
            <p>Many add-ons have waiting periods for major services. Enroll early to avoid delays when you need care.</p>

            <h2 className="text-xl font-bold">Bundling vs Individual Policies</h2>
            
            <h3 className="text-lg font-semibold">Bundled Package Pros</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Potential multi-policy discounts</li>
                <li>Single bill and customer service</li>
                <li>Coordinated benefits and claims</li>
            </ul>

            <h3 className="text-lg font-semibold">Individual Policy Pros</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Shop for best value in each category</li>
                <li>Customize coverage levels</li>
                <li>Change one policy without affecting others</li>
            </ul>

            <h2 className="text-xl font-bold">Age-Based Add-on Strategies</h2>
            
            <h3 className="text-lg font-semibold">Ages 65-70: Foundation Building</h3>
            <p>Focus on: Dental, vision, and long-term care insurance (while premiums are lower)</p>

            <h3 className="text-lg font-semibold">Ages 70-75: Health Maintenance</h3>
            <p>Add: Hearing aid coverage if needed, consider cancer insurance</p>

            <h3 className="text-lg font-semibold">Ages 75+: Practical Needs</h3>
            <p>Focus on: Services you actually use rather than adding new coverage</p>

            <h2 className="text-xl font-bold">Budget Planning for Add-ons</h2>
            <p>Add-on premiums can quickly accumulate. A comprehensive package might cost:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Dental: $40/month</li>
                <li>Vision: $25/month</li>
                <li>Hearing aids: $35/month</li>
                <li>Long-term care: $250/month</li>
                <li><strong>Total: $350/month additional</strong></li>
            </ul>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Budget tip:</strong> Start with 1-2 add-ons that address your immediate needs. You can always add more coverage later as your budget allows.
            </blockquote>

            <h2 className="text-xl font-bold">Enrollment Timing and Health Requirements</h2>
            
            <h3 className="text-lg font-semibold">No Health Questions</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Most dental and vision plans</li>
                <li>Basic hearing aid coverage</li>
            </ul>

            <h3 className="text-lg font-semibold">Limited Health Questions</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Cancer insurance</li>
                <li>Hospital indemnity plans</li>
            </ul>

            <h3 className="text-lg font-semibold">Full Medical Underwriting</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Long-term care insurance</li>
                <li>Some critical illness plans</li>
            </ul>

            <h2 className="text-xl font-bold">Making the Right Add-on Choices</h2>
            <p>As a Plan G holder, you already have excellent medical coverage. Your add-ons should focus on services Medicare excludes entirely.</p>
            <p>Dental coverage is almost always worth it. Vision coverage makes sense if you wear glasses. Long-term care insurance is important but expensive.</p>
            <p>Avoid add-ons that duplicate your existing Plan G benefits. Focus on genuine gaps in your healthcare protection.</p>

            <h2 className="text-xl font-bold">Plan G Add-on Success Strategy</h2>
            <p>Start with dental coverage—it's the biggest gap and most frequently needed.</p>
            <p>Add vision coverage if you wear glasses or contacts.</p>
            <p>Consider long-term care insurance while you're healthy and premiums are lower.</p>
            <p>Evaluate other add-ons based on your specific health needs and budget.</p>
            <p>Remember: Plan G provides excellent medical coverage. Your add-ons should complement, not duplicate, this strong foundation.</p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Plan G" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/top-plan-g-addons"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Medigap Rate Increases", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medigap-rate-increases" },
          { title: "Cancer Insurance with a Medicare Supplement Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/cancer-plans-with-medigap" }
        ]}
      />
    </div>
  );
}

