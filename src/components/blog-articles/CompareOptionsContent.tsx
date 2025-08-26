
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function CompareOptionsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Compare Options"
          category="Medicare"
          date="July 22, 2025"
          intro="Medicare side by side to see what works best for you."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Comparing Medicare Options Made Simple" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Your Main Medicare Choices</h2>
            <p>When you turn 65, you have two main paths for Medicare coverage. Each has different benefits, costs, and rules.</p>
            <p>Most people pick Original Medicare with a supplement plan or Medicare Advantage. Here's how to decide what works best for you.</p>

            <h2 className="text-xl font-bold">Original Medicare + Medigap</h2>
            <p>This is the traditional Medicare setup. You get Part A and Part B from the government, then add a private supplement plan (Medigap) to fill the gaps.</p>

            <h3 className="text-lg font-semibold">What You Get</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>See any doctor who accepts Medicare</li>
                <li>No referrals needed for specialists</li>
                <li>Coverage anywhere in the U.S.</li>
                <li>Predictable costs with Medigap</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part B premium: $185/month in 2025</li>
                <li>Medigap premium: $100–$300/month depending on plan</li>
                <li>Part D drug plan: $30–$60/month</li>
                <li>Total: Around $300–$450/month</li>
            </ul>

            <h2 className="text-xl font-bold">Medicare Advantage</h2>
            <p>This replaces Original Medicare with a private plan that includes everything in one package. Most include prescription drug coverage.</p>

            <h3 className="text-lg font-semibold">What You Get</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Often extra benefits like dental, vision, wellness programs</li>
                <li>Prescription drug coverage usually included</li>
                <li>Lower monthly premiums (many are $0)</li>
                <li>Annual cap on out-of-pocket costs</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Give Up</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Must use plan's network of doctors</li>
                <li>May need referrals for specialists</li>
                <li>Coverage limited to your local area</li>
                <li>Plan benefits can change each year</li>
            </ul>

            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Original Medicare vs Medicare Advantage</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Feature</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Original Medicare + Medigap</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Medicare Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Monthly Premium</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$300–$450</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">$0–$150</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Doctor Choice</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Any Medicare doctor</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Plan network only</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Referrals</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Not required</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">May be required</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Extra Benefits</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Limited</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Often included</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Travel Coverage</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Nationwide</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">Limited area</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold">Which Option Costs Less?</h2>
            <p>It depends on how much healthcare you use. Medicare Advantage often costs less upfront but more when you need care.</p>
            <p>Original Medicare with Medigap costs more monthly but gives you predictable expenses when you're sick.</p>

            <h3 className="text-lg font-semibold">If You're Healthy</h3>
            <p>Medicare Advantage might save you money. You'll pay lower premiums and may not hit the higher copays and deductibles.</p>

            <h3 className="text-lg font-semibold">If You Have Health Issues</h3>
            <p>Original Medicare with Medigap might be better. You'll avoid network restrictions and have more predictable costs.</p>

            <h2 className="text-xl font-bold">What About Prescription Drugs?</h2>
            <p>Both paths can include prescription drug coverage, but they work differently.</p>

            <h3 className="text-lg font-semibold">With Original Medicare</h3>
            <p>You need a separate Part D plan. Shop for one that covers your specific medications at the lowest cost.</p>

            <h3 className="text-lg font-semibold">With Medicare Advantage</h3>
            <p>Drug coverage is usually built into the plan. Check that your medications are covered before enrolling.</p>

            <h2 className="text-xl font-bold">Questions to Ask Yourself</h2>
            
            <h3 className="text-lg font-semibold">Do you travel a lot?</h3>
            <p>Original Medicare works anywhere in the U.S. Medicare Advantage plans usually limit coverage to your home area.</p>

            <h3 className="text-lg font-semibold">Do you have favorite doctors?</h3>
            <p>With Original Medicare, you can see any doctor who accepts Medicare. With Medicare Advantage, you're limited to the plan's network.</p>

            <h3 className="text-lg font-semibold">Do you want predictable costs?</h3>
            <p>Medigap plans give you predictable monthly costs. Medicare Advantage plans have lower premiums but higher costs when you use care.</p>

            <h3 className="text-lg font-semibold">Do you want extra benefits?</h3>
            <p>Medicare Advantage plans often include dental, vision, and wellness benefits that Original Medicare doesn't cover.</p>

            <h2 className="text-xl font-bold">When Can You Switch?</h2>
            <p>You can change from Medicare Advantage back to Original Medicare during Open Enrollment (October 15 to December 7) each year.</p>
            <p>You can also switch during the Medicare Advantage Open Enrollment Period (January 1 to March 31).</p>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Important:</strong> If you switch from Medicare Advantage to Original Medicare after your first year on Medicare, you might not be able to get a Medigap plan without medical underwriting.
            </blockquote>

            <h2 className="text-xl font-bold">Getting Help With Your Decision</h2>
            <p>Don't try to figure this out alone. Your local SHIP (State Health Insurance Assistance Program) provides free counseling.</p>
            <p>Medicare.gov has plan comparison tools. You can also work with a licensed insurance agent who knows your local options.</p>

            <h2 className="text-xl font-bold">Making Your Choice</h2>
            <p>There's no universally "best" option. The right choice depends on your health, budget, and preferences.</p>
            <p>Start with your priorities. Do you value doctor choice and predictable costs? Or do you prefer lower premiums and extra benefits?</p>
            <p>Remember, you can change your mind each year during Open Enrollment. Don't stress too much about making the perfect choice right away.</p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Compare" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/compare-options"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "How to Choose the Right Medicare Advantage Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-advantage-plans" },
          { title: "Compare PDP Plans", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-pdp-plans" },
          { title: "Medicare Beginner's Guide", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medicare-beginners-guide" }
        ]}
      />
    </div>
  );
}

