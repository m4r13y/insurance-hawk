import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function PlanGVsNContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Plan G vs Plan N: Which Medigap Plan is Right for You?"
          category="Medicare"
          date="July 22, 2025"
          intro="Choosing between Medigap Plan G and Plan N? Learn the key differences in coverage and costs to make the right decision."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Plan G vs Plan N Comparison" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">The Two Most Popular Medigap Plans</h2>
            <p>Plan G and Plan N are the top choices for new Medicare beneficiaries. Both offer excellent coverage, but they handle costs differently.</p>
            <p>Understanding these differences helps you choose the plan that fits your healthcare usage and budget.</p>

            <h2 className="text-xl font-bold">What Plan G Covers</h2>
            <p>Plan G provides comprehensive coverage with minimal out-of-pocket costs:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part A deductible ($1,632 in 2025)</li>
                <li>Part A coinsurance and hospital costs</li>
                <li>Part B coinsurance (usually 20% of Medicare-approved amounts)</li>
                <li>Part B excess charges (when doctors charge more than Medicare pays)</li>
                <li>First 3 pints of blood</li>
                <li>Skilled nursing facility coinsurance</li>
                <li>Hospice coinsurance</li>
                <li>Foreign travel emergency coverage (up to plan limits)</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay with Plan G</h3>
            <p>Monthly premium plus the annual Part B deductible ($240 in 2025). After that, nearly everything is covered.</p>

            <h2 className="text-xl font-bold">What Plan N Covers</h2>
            <p>Plan N covers the same services as Plan G except:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Part B excess charges:</strong> Not covered (you pay up to 15% above Medicare's approved amount)</li>
                <li><strong>Doctor office visits:</strong> Up to $20 copay per visit</li>
                <li><strong>Emergency room visits:</strong> Up to $50 copay (waived if admitted)</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay with Plan N</h3>
            <p>Monthly premium, Part B deductible, plus the copays mentioned above.</p>

            <h2 className="text-xl font-bold">Cost Comparison</h2>
            
            <h3 className="text-lg font-semibold">Premium Differences</h3>
            <p>Plan N premiums are typically $40-$60 lower per month than Plan G. This saves $480-$720 annually in premiums.</p>

            <h3 className="text-lg font-semibold">Break-Even Analysis</h3>
            <p>If Plan N saves you $50/month ($600/year), you can afford:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>30 doctor visits at $20 each</li>
                <li>12 ER visits at $50 each</li>
                <li>Or a combination of both</li>
            </ul>
            <p>Most people don't reach this break-even point, making Plan N the better financial choice.</p>

            <h2 className="text-xl font-bold">Who Should Choose Plan G</h2>
            
            <h3 className="text-lg font-semibold">High Healthcare Users</h3>
            <p>If you see doctors frequently or have multiple chronic conditions, the copays with Plan N can add up quickly.</p>

            <h3 className="text-lg font-semibold">Preference for Predictable Costs</h3>
            <p>Some people prefer paying a higher premium to avoid any surprise costs when receiving care.</p>

            <h3 className="text-lg font-semibold">Areas with Excess Charges</h3>
            <p>If you live where doctors commonly charge excess fees, Plan G's protection might be worth the extra premium.</p>

            <h2 className="text-xl font-bold">Who Should Choose Plan N</h2>
            
            <h3 className="text-lg font-semibold">Moderate Healthcare Users</h3>
            <p>If you see doctors occasionally and rarely visit the emergency room, Plan N usually saves money.</p>

            <h3 className="text-lg font-semibold">Budget-Conscious Seniors</h3>
            <p>The lower premium makes Plan N attractive if you want good coverage while minimizing monthly costs.</p>

            <h3 className="text-lg font-semibold">Healthy Seniors</h3>
            <p>If you're in good health and don't expect frequent medical care, Plan N's savings can be significant.</p>

            <h2 className="text-xl font-bold">Key Considerations</h2>
            
            <h3 className="text-lg font-semibold">Excess Charges Reality</h3>
            <p>Part B excess charges are rare. Most Medicare providers accept Medicare's approved amounts as payment in full.</p>

            <h3 className="text-lg font-semibold">Emergency Room Copays</h3>
            <p>The $50 ER copay is waived if you're admitted to the hospital. It only applies to ER visits where you're treated and released.</p>

            <h3 className="text-lg font-semibold">Doctor Visit Copays</h3>
            <p>The $20 copay applies to office visits, not to procedures or tests, which are covered at 100% after the Part B deductible.</p>

            <h2 className="text-xl font-bold">Making Your Decision</h2>
            
            <h3 className="text-lg font-semibold">Calculate Your Expected Usage</h3>
            <p>Estimate how many doctor visits you typically have per year. If it's fewer than 25-30, Plan N likely saves money.</p>

            <h3 className="text-lg font-semibold">Consider Your Risk Tolerance</h3>
            <p>Are you comfortable with small copays in exchange for lower premiums? Or do you prefer comprehensive coverage regardless of cost?</p>

            <h3 className="text-lg font-semibold">Both Plans Offer Excellent Protection</h3>
            <p>You can't go wrong with either choice. Both plans provide comprehensive coverage and protect you from major medical expenses.</p>

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>For most people, Plan N provides excellent value by balancing comprehensive coverage with affordable premiums.</p>
            <p>Plan G offers slightly more comprehensive coverage for those who prefer maximum protection and predictable costs.</p>
            <p>Your choice depends on your healthcare usage patterns, budget preferences, and comfort level with small copays.</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Top Plan G Add-ons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/top-plan-g-addons" },
          { title: "Top Plan N Add-ons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/top-plan-n-addons" },
          { title: "Medigap Rate Increases", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medigap-rate-increases" }
        ]}
      />
    </div>
  );
}
