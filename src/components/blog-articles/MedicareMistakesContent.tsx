
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function MedicareMistakesContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Medicare Mistakes"
          category="Medicare"
          date="July 22, 2025"
          intro="Uncover the common Medicare mistakes so you can avoid them."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Common Medicare Mistakes to Avoid" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">The 7 Most Expensive Medicare Mistakes</h2>
            <p>Medicare decisions can cost you thousands if you get them wrong. The good news? Most mistakes are easy to avoid once you know what to watch for.</p>
            <p>Here are the biggest pitfalls and how to steer clear of them.</p>

            <h2 className="text-xl font-bold">Mistake #1: Missing Your Initial Enrollment Period</h2>
            <p>Your Initial Enrollment Period lasts 7 months—3 months before you turn 65, your birthday month, and 3 months after.</p>
            <p>Miss this window and you'll face late enrollment penalties that last for life.</p>

            <h3 className="text-lg font-semibold">The Cost</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Part B penalty:</strong> 10% more per year you delayed, for life</li>
                <li><strong>Part D penalty:</strong> 1% more per month you went without coverage</li>
                <li><strong>Gap in coverage:</strong> You might wait months for coverage to start</li>
            </ul>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>Mark your calendar 3 months before your 65th birthday. If you're still working with group coverage, get written confirmation from your employer about creditable coverage.</p>

            <h2 className="text-xl font-bold">Mistake #2: Choosing a Plan Based Only on Premium</h2>
            <p>The cheapest monthly premium often leads to the highest total costs when you need care.</p>
            <p>A $0 premium Medicare Advantage plan might have $7,000+ in out-of-pocket maximums.</p>

            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Plan Comparison Example</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Plan</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Monthly Premium</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Annual Deductible</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Out-of-Pocket Max</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Plan A</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$0</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$500</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$7,550</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Plan B</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$89</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$0</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$3,500</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>Calculate total annual costs including premiums, deductibles, and expected out-of-pocket expenses. Use Medicare's Plan Finder tool to estimate costs based on your specific needs.</p>

            <h2 className="text-xl font-bold">Mistake #3: Not Checking Provider Networks</h2>
            <p>Assuming your doctors take Medicare Advantage is risky. Networks change every year, and not all Medicare doctors participate in every plan.</p>

            <h3 className="text-lg font-semibold">The Consequences</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Out-of-network charges can be 2-3 times higher</li>
                <li>You might have to switch doctors mid-treatment</li>
                <li>Some services might not be covered at all outside the network</li>
            </ul>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>Before enrolling, verify your doctors are in the plan's network. Call the plan and your doctor's office to confirm. Check annually during Open Enrollment.</p>

            <h2 className="text-xl font-bold">Mistake #4: Ignoring Prescription Drug Coverage</h2>
            <p>Even if you don't take medications now, you need Part D coverage to avoid penalties later.</p>
            <p>The Part D late enrollment penalty is 1% of the national base premium for each month you go without coverage.</p>

            <h3 className="text-lg font-semibold">Example Penalty Calculation</h3>
            <p>If you delay Part D for 2 years (24 months):</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>2025 base premium: $37.20</li>
                <li>Penalty: 24% of $37.20 = $8.93 per month</li>
                <li>Total penalty: $107 per year, for life</li>
            </ul>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>Enroll in a Part D plan during your Initial Enrollment Period, even if you don't take medications. Choose the cheapest plan available if you're healthy.</p>

            <h2 className="text-xl font-bold">Mistake #5: Waiting Too Long for Medigap</h2>
            <p>You have a 6-month window after enrolling in Part B to buy any Medigap plan without medical underwriting.</p>
            <p>Wait longer and insurance companies can deny coverage or charge higher rates based on your health.</p>

            <h3 className="text-lg font-semibold">The Risk</h3>
            <p>If you develop health problems and want to switch from Medicare Advantage to Original Medicare + Medigap, you might not be able to get coverage.</p>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>If you think you might want Medigap coverage, buy it during your 6-month open enrollment period. You can always cancel later if you change your mind.</p>

            <h2 className="text-xl font-bold">Mistake #6: Not Reviewing Coverage Annually</h2>
            <p>Medicare plans change every year. Your drugs might move to different tiers, doctors might leave networks, and premiums might increase.</p>
            <p>What worked last year might be expensive or inadequate this year.</p>

            <h3 className="text-lg font-semibold">Annual Changes to Watch For</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Drug formulary changes</li>
                <li>Provider network updates</li>
                <li>Premium and cost-sharing adjustments</li>
                <li>Benefit modifications</li>
            </ul>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>Review your coverage every October during Open Enrollment. Read the Annual Notice of Change your plan sends. Use Medicare's Plan Finder to compare options.</p>

            <h2 className="text-xl font-bold">Mistake #7: Believing Medicare Covers Everything</h2>
            <p>Medicare has significant gaps. Without supplemental coverage, you could face thousands in out-of-pocket costs.</p>

            <h3 className="text-lg font-semibold">What Medicare Doesn't Cover</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Dental care (except emergency situations)</li>
                <li>Vision care (except after cataract surgery)</li>
                <li>Hearing aids</li>
                <li>Long-term care</li>
                <li>Care outside the United States</li>
            </ul>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>Understand Medicare's limitations before you need care. Consider supplemental insurance for gaps that matter to you.</p>

            <h2 className="text-xl font-bold">Mistake #8: Making Emotional Decisions</h2>
            <p>Healthcare decisions are emotional, but Medicare choices should be based on facts and numbers.</p>
            <p>Don't choose a plan because your neighbor loves it or because the sales person was nice.</p>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>Create a checklist of what matters most to you:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Keeping your current doctors</li>
                <li>Predictable monthly costs</li>
                <li>Prescription drug coverage</li>
                <li>Extra benefits like dental or vision</li>
            </ul>
            <p>Rank plans based on how well they meet your priorities, not emotions.</p>

            <h2 className="text-xl font-bold">Mistake #9: Not Getting Help When Confused</h2>
            <p>Medicare is complicated. Trying to figure it out alone leads to costly mistakes.</p>
            <p>Free help is available from unbiased sources.</p>

            <h3 className="text-lg font-semibold">Where to Get Help</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>SHIP counselors:</strong> Free, unbiased Medicare counseling</li>
                <li><strong>Medicare.gov:</strong> Official plan comparison tools</li>
                <li><strong>1-800-MEDICARE:</strong> 24/7 customer service</li>
                <li><strong>Licensed agents:</strong> Can explain local options</li>
            </ul>

            <h3 className="text-lg font-semibold">How to Avoid It</h3>
            <p>Don't be embarrassed to ask questions. Everyone finds Medicare confusing at first. Use multiple sources to verify information.</p>

            <h2 className="text-xl font-bold">Mistake #10: Assuming You Can't Change Your Mind</h2>
            <p>Many people think they're stuck with their first Medicare choice. That's not true.</p>
            <p>You can change plans during Open Enrollment every year. Some situations qualify for Special Enrollment Periods.</p>

            <h3 className="text-lg font-semibold">When You Can Make Changes</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Annual Open Enrollment:</strong> October 15 - December 7</li>
                <li><strong>Medicare Advantage Open Enrollment:</strong> January 1 - March 31</li>
                <li><strong>Special Enrollment Periods:</strong> For qualifying life events</li>
            </ul>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Remember:</strong> The biggest Medicare mistake is not taking action. Missing deadlines and not reviewing your options annually can cost thousands.
            </blockquote>

            <h2 className="text-xl font-bold">Creating Your Medicare Action Plan</h2>
            <p>Avoid these mistakes by being proactive:</p>
            <ol className="list-decimal pl-6 space-y-2">
                <li>Mark important dates on your calendar</li>
                <li>Create a list of your current doctors and medications</li>
                <li>Set aside time each October to review your options</li>
                <li>Keep important Medicare documents in one place</li>
                <li>Build a relationship with a trusted advisor</li>
            </ol>

            <h2 className="text-xl font-bold">The Cost of Waiting</h2>
            <p>Medicare mistakes compound over time. A small penalty today becomes a large expense over 20+ years of retirement.</p>
            <p>Take the time to understand your options now. Your future self will thank you for making informed decisions today.</p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Mistakes" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/medicare-mistakes"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Medicare Beginner's Guide", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medicare-beginners-guide" },
          { title: "Avoiding Late Enrollment Penalties", imageUrl: "https://placehold.co/320x320.png", href: "/resources/avoiding-penalties" },
          { title: "50 Most Asked Medicare Questions", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medicare-questions" }
        ]}
      />
    </div>
  );
}

