
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function ComparePdpPlansContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Compare PDP Plans"
          category="Medicare"
          date="July 22, 2025"
          intro="What to look for when shopping Prescription Drug Plans."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="How to Compare Medicare Part D Plans" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Why Comparing Drug Plans Matters</h2>
            <p>Not all Medicare Part D plans are the same. The plan that covers your neighbor's medications might not work well for yours.</p>
            <p>Each plan has its own list of covered drugs (called a formulary) and different costs. The wrong choice could cost you hundreds or thousands per year.</p>

            <h2 className="text-xl font-bold">What to Look for When Comparing Plans</h2>
            
            <h3 className="text-lg font-semibold">1. Are Your Medications Covered?</h3>
            <p>This is the most important factor. A plan is useless if it doesn't cover your drugs.</p>
            <p>Check each plan's formulary for all your medications. Don't assume similar drugs are covered the same way.</p>

            <h3 className="text-lg font-semibold">2. What Tier Are Your Drugs On?</h3>
            <p>Plans organize drugs into different cost levels called tiers. Lower tiers cost less.</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Tier 1:</strong> Generic drugs (lowest cost)</li>
                <li><strong>Tier 2:</strong> Preferred brand drugs</li>
                <li><strong>Tier 3:</strong> Non-preferred brand drugs</li>
                <li><strong>Tier 4:</strong> Specialty drugs (highest cost)</li>
            </ul>

            <h3 className="text-lg font-semibold">3. What Are the Copays?</h3>
            <p>Even if your drug is covered, you'll pay different amounts depending on the plan.</p>
            <p>Some plans charge a flat copay (like $10). Others charge coinsurance (like 25% of the drug cost).</p>

            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Sample Plan Comparison</caption>
                <thead className="bg-accent dark:bg-neutral-800">
                  <tr>
                    <th className="border border-border dark:border-neutral-700 p-3 text-left font-semibold">Drug Tier</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Plan A Cost</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Plan B Cost</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Plan C Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Tier 1 (Generic)</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$5 copay</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$10 copay</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">15% coinsurance</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Tier 2 (Preferred Brand)</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$25 copay</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$40 copay</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">25% coinsurance</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Tier 3 (Non-preferred)</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">$60 copay</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">45% coinsurance</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">50% coinsurance</td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Tier 4 (Specialty)</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">25% coinsurance</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">33% coinsurance</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">25% coinsurance</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold">Don't Forget About the Deductible</h2>
            <p>Many Part D plans have a yearly deductible. You pay full price for drugs until you meet it.</p>
            <p>In 2025, the maximum deductible is $590. Some plans have lower deductibles or no deductible at all.</p>

            <h3 className="text-lg font-semibold">Example: How Deductibles Affect Costs</h3>
            <p>Let's say you take a brand-name drug that costs $200 per month:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Plan with $0 deductible:</strong> You pay your copay from day one</li>
                <li><strong>Plan with $590 deductible:</strong> You pay $200/month for the first 3 months, then your copay starts</li>
            </ul>

            <h2 className="text-xl font-bold">Check Your Pharmacy Network</h2>
            <p>Not all pharmacies work with every Part D plan. Using an out-of-network pharmacy costs more.</p>
            <p>Make sure your preferred pharmacy is in the plan's network. Check both retail locations and mail-order options.</p>

            <h2 className="text-xl font-bold">Consider Total Annual Costs</h2>
            <p>Don't just look at monthly premiums. Calculate your total yearly costs including:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium × 12</li>
                <li>Annual deductible</li>
                <li>Expected drug copays for the year</li>
            </ul>

            <h3 className="text-lg font-semibold">Real Example</h3>
            <p>Plan A: $20/month premium, $590 deductible, $30 copay for your drug</p>
            <p>Plan B: $60/month premium, $0 deductible, $15 copay for your drug</p>
            <p>If you take one drug monthly:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Plan A total:</strong> $240 + $590 + $360 = $1,190</li>
                <li><strong>Plan B total:</strong> $720 + $0 + $180 = $900</li>
            </ul>
            <p>Plan B costs $40 more per month but saves $290 per year.</p>

            <h2 className="text-xl font-bold">The $2,000 Out-of-Pocket Cap</h2>
            <p>Starting in 2025, there's a $2,000 annual limit on what you pay for Part D drugs. Once you hit this amount, your drugs are free for the rest of the year.</p>
            <p>This cap makes expensive specialty medications more affordable. But you still want to minimize costs before reaching the cap.</p>

            <h2 className="text-xl font-bold">Special Rules and Restrictions</h2>
            
            <h3 className="text-lg font-semibold">Prior Authorization</h3>
            <p>Some drugs require approval from the plan before they'll cover them. This can delay getting your medication.</p>

            <h3 className="text-lg font-semibold">Quantity Limits</h3>
            <p>Plans might limit how much of a drug you can get at once. A 90-day supply might be cheaper than three 30-day fills.</p>

            <h3 className="text-lg font-semibold">Step Therapy</h3>
            <p>Some plans require you to try cheaper drugs first before covering more expensive options.</p>

            <h2 className="text-xl font-bold">Using Medicare's Plan Finder Tool</h2>
            <p>Go to Medicare.gov and use the Plan Finder tool. Enter your zip code and medications to compare plans in your area.</p>
            <p>The tool shows estimated annual costs based on your specific drugs. This takes the guesswork out of comparing plans.</p>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Pro tip:</strong> Update your drug list in Plan Finder if your medications change during the year. What looked like the best plan might not be anymore.
            </blockquote>

            <h2 className="text-xl font-bold">When to Switch Plans</h2>
            <p>Review your Part D plan every year during Open Enrollment (October 15 to December 7).</p>
            <p>Switch if:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Your drugs are no longer covered</li>
                <li>Your drugs moved to higher tiers</li>
                <li>You found a plan with significantly lower total costs</li>
                <li>Your pharmacy is no longer in the network</li>
            </ul>

            <h2 className="text-xl font-bold">What If You Don't Take Any Medications?</h2>
            <p>You should still get a Part D plan to avoid late enrollment penalties.</p>
            <p>Look for the cheapest plan available in your area. You can always switch to better coverage if you start taking medications later.</p>

            <h2 className="text-xl font-bold">Getting Help With Plan Comparison</h2>
            <p>Comparing Part D plans can be confusing. Don't hesitate to get help.</p>
            <p>Your local SHIP counselor can walk through the Plan Finder tool with you. Licensed insurance agents can also explain your options.</p>
            <p>Medicare customer service (1-800-MEDICARE) can answer questions about specific plans or coverage rules.</p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "PDP" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/compare-pdp-plans"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "How Medicare Drug Plans Work", imageUrl: "https://placehold.co/320x320.png", href: "/resources/drug-plans-explained" },
          { title: "PDP Pros & Cons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/pdp-pros-cons" },
          { title: "Avoiding Late Enrollment Penalties", imageUrl: "https://placehold.co/320x320.png", href: "/resources/avoiding-penalties" }
        ]}
      />
    </div>
  );
}

