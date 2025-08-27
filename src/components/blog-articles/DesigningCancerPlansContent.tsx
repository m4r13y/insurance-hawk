
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function DesigningCancerPlansContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Designing Cancer Plans"
          category="Insurance"
          date="July 22, 2025"
          intro="How we recommend building Cancer Insurance Plans."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="How Cancer Insurance Plans Are Designed" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">How Cancer Insurance Actually Works</h2>
            <p>Cancer insurance isn't like regular health insurance. It doesn't pay your doctor or hospital directly.</p>
            <p>Instead, it pays you cash when you're diagnosed with covered cancers. You decide how to spend the money.</p>

            <h2 className="text-xl font-bold">Two Main Types of Cancer Plans</h2>
            
            <h3 className="text-lg font-semibold">Lump Sum Plans</h3>
            <p>These pay you one large amount after diagnosis. Typical benefits range from $5,000 to $50,000.</p>
            <p>You get the full amount regardless of your treatment costs. If your treatment costs less than the benefit, you keep the difference.</p>

            <h3 className="text-lg font-semibold">Expense-Incurred Plans</h3>
            <p>These reimburse you for actual cancer-related expenses up to your benefit limit.</p>
            <p>You submit receipts for treatment, travel, lodging, and other covered expenses. The plan pays you back.</p>

            <h2 className="text-xl font-bold">What Cancers Are Covered?</h2>
            <p>Most plans cover all invasive cancers. But they define cancer differently, so read the details.</p>

            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Typical Cancer Coverage</caption>
                <thead className="bg-accent dark:bg-neutral-800">
                  <tr>
                    <th className="border border-border dark:border-neutral-700 p-3 text-left font-semibold">Cancer Type</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Full Benefit</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Partial Benefit</th>
                    <th className="border border-border dark:border-neutral-700 p-3 text-center font-semibold">Not Covered</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Invasive Cancer</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">✓</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center"></td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center"></td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Carcinoma in Situ</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center"></td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">✓ (25%)</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center"></td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Skin Cancer (melanoma)</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">✓</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center"></td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center"></td>
                  </tr>
                  <tr>
                    <td className="border border-border dark:border-neutral-700 p-2">Skin Cancer (basal/squamous)</td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center"></td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center"></td>
                    <td className="border border-border dark:border-neutral-700 p-2 text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold">Built-in Waiting Periods</h2>
            <p>Cancer plans include waiting periods to prevent people from buying coverage after they know they have cancer.</p>

            <h3 className="text-lg font-semibold">Typical Waiting Periods</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>30 days:</strong> Coverage starts for accidents</li>
                <li><strong>12 months:</strong> Coverage starts for cancer (most common)</li>
                <li><strong>24 months:</strong> Coverage for pre-existing conditions (if covered at all)</li>
            </ul>

            <p>Some plans have shorter waiting periods (6 months) but may cost more or have other restrictions.</p>

            <h2 className="text-xl font-bold">Age and Health Requirements</h2>
            <p>Most cancer plans have age limits for new applicants. Common ranges are 18-75 or 18-85.</p>
            <p>Many plans don't require medical exams or blood tests. You just answer health questions on the application.</p>

            <h3 className="text-lg font-semibold">Guaranteed Issue Options</h3>
            <p>Some plans accept everyone regardless of health status. These usually have:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Lower benefit amounts</li>
                <li>Longer waiting periods</li>
                <li>Higher premiums</li>
            </ul>

            <h2 className="text-xl font-bold">How Premiums Are Calculated</h2>
            <p>Cancer insurance premiums depend on several factors:</p>

            <h3 className="text-lg font-semibold">Age</h3>
            <p>Older applicants pay more because cancer risk increases with age. Premiums typically double every 10-15 years.</p>

            <h3 className="text-lg font-semibold">Benefit Amount</h3>
            <p>Higher benefits cost more. A $20,000 plan costs roughly twice as much as a $10,000 plan.</p>

            <h3 className="text-lg font-semibold">Gender</h3>
            <p>Women often pay slightly more due to breast and reproductive cancers. Men may pay more for certain plans due to higher lung cancer rates.</p>

            <h3 className="text-lg font-semibold">Tobacco Use</h3>
            <p>Smokers pay significantly more—sometimes 2-3 times the non-smoker rate.</p>

            <h2 className="text-xl font-bold">Additional Benefits Often Included</h2>
            
            <h3 className="text-lg font-semibold">Wellness Benefits</h3>
            <p>Many plans pay small amounts for preventive screenings like mammograms, colonoscopies, and PSA tests.</p>
            <p>Typical payments: $50-$200 per screening, once per year.</p>

            <h3 className="text-lg font-semibold">Waiver of Premium</h3>
            <p>If you're diagnosed with cancer, the plan might waive future premiums while you're receiving treatment.</p>

            <h3 className="text-lg font-semibold">Return of Premium</h3>
            <p>Some plans return all or part of your premiums if you never file a claim. This feature increases the cost significantly.</p>

            <h2 className="text-xl font-bold">Family vs Individual Coverage</h2>
            
            <h3 className="text-lg font-semibold">Individual Plans</h3>
            <p>Cover only the person named on the policy. Cheaper but limited protection.</p>

            <h3 className="text-lg font-semibold">Family Plans</h3>
            <p>Cover spouse and dependent children under one policy. Cost more but provide broader protection.</p>
            <p>Family plans often pay the full benefit if any covered family member is diagnosed.</p>

            <h2 className="text-xl font-bold">Common Policy Exclusions</h2>
            <p>Cancer plans don't cover everything. Common exclusions include:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Pre-existing cancers or symptoms</li>
                <li>Basal cell and squamous cell skin cancers</li>
                <li>Cancer caused by substance abuse</li>
                <li>Cancer related to HIV/AIDS</li>
                <li>Treatment received outside the U.S.</li>
            </ul>

            <h2 className="text-xl font-bold">Renewal and Rate Increases</h2>
            <p>Most cancer plans are guaranteed renewable. The company can't cancel your coverage as long as you pay premiums.</p>
            <p>But companies can raise rates for entire groups of policyholders. Increases typically happen every few years.</p>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Important:</strong> Rate increases affect everyone with the same plan type, not just people who filed claims. Companies can't single you out for rate hikes.
            </blockquote>

            <h2 className="text-xl font-bold">Integration with Other Insurance</h2>
            <p>Cancer insurance works alongside your regular health coverage. It doesn't replace Medicare or employer insurance.</p>
            <p>The cash benefit is paid regardless of what other insurance covers. You can use it for deductibles, copays, or anything else.</p>

            <h2 className="text-xl font-bold">Tax Implications</h2>
            <p>Cancer insurance benefits are usually tax-free if you pay premiums with after-tax dollars.</p>
            <p>If your employer pays the premiums, benefits might be taxable income. Check with a tax professional for your specific situation.</p>

            <h2 className="text-xl font-bold">Choosing the Right Plan Design</h2>
            <p>Consider your current health coverage and financial situation. If you have good health insurance but worry about out-of-pocket costs, a cancer plan might help.</p>
            <p>Look at the total cost over several years, not just the monthly premium. Factor in your age and likelihood of rate increases.</p>
            <p>Most importantly, make sure you understand exactly what the plan covers and excludes before you buy.</p>
        </div>
        <ActionButtons
            badges={[{ tag: "Insurance" }, { tag: "Cancer" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/designing-cancer-plans"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Cancer Insurance with a Medicare Supplement Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/cancer-plans-with-medigap" },
          { title: "Why Medicare Isn’t Enough for Cancer Costs in 2025", imageUrl: "https://placehold.co/320x320.png", href: "/resources/cancer-statistics" },
          { title: "Reimbursement vs Diagnosis", imageUrl: "https://placehold.co/320x320.png", href: "/resources/reimbursement-vs-diagnosis" }
        ]}
      />
    </div>
  );
}

