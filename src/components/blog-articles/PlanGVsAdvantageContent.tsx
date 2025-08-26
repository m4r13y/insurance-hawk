import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function PlanGVsAdvantageContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Plan G vs Medicare Advantage: Making the Right Choice"
          category="Medicare"
          date="July 22, 2025"
          intro="Deciding between Medigap Plan G and Medicare Advantage? Learn the key differences in cost, coverage, and flexibility."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Plan G vs Medicare Advantage Comparison" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Two Very Different Approaches to Medicare</h2>
            <p>Plan G (Original Medicare + supplement) and Medicare Advantage represent completely different ways to get Medicare benefits.</p>
            <p>Understanding these fundamental differences helps you choose the approach that fits your lifestyle and priorities.</p>

            <h2 className="text-xl font-bold">Plan G: Original Medicare + Supplement</h2>
            
            <h3 className="text-lg font-semibold">How It Works</h3>
            <p>You keep Original Medicare (Parts A and B) and add a Medigap Plan G policy to cover most out-of-pocket costs.</p>
            
            <h3 className="text-lg font-semibold">What You Pay</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Medicare Part B premium: $174.70/month (2025)</li>
                <li>Plan G premium: $150-$250/month (varies by area and company)</li>
                <li>Part B deductible: $240/year</li>
                <li>Total monthly: $325-$425</li>
            </ul>

            <h3 className="text-lg font-semibold">Coverage Benefits</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Access to any Medicare-accepting provider nationwide</li>
                <li>No referrals needed for specialists</li>
                <li>Predictable costs - no surprise bills</li>
                <li>No network restrictions</li>
                <li>Stable coverage year-to-year</li>
            </ul>

            <h2 className="text-xl font-bold">Medicare Advantage: All-in-One Plans</h2>
            
            <h3 className="text-lg font-semibold">How It Works</h3>
            <p>A private insurance company provides all your Medicare benefits through one plan, often with extra benefits included.</p>
            
            <h3 className="text-lg font-semibold">What You Pay</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Medicare Part B premium: $174.70/month</li>
                <li>Plan premium: $0-$100/month (many are $0)</li>
                <li>Copays and deductibles vary by plan</li>
                <li>Total monthly: $175-$275</li>
            </ul>

            <h3 className="text-lg font-semibold">Coverage Benefits</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Often includes dental, vision, hearing aids</li>
                <li>May include prescription drug coverage</li>
                <li>Lower monthly premiums</li>
                <li>Maximum out-of-pocket limits</li>
                <li>Wellness programs and extras</li>
            </ul>

            <h2 className="text-xl font-bold">Key Differences in Practice</h2>
            
            <h3 className="text-lg font-semibold">Provider Access</h3>
            <p><strong>Plan G:</strong> See any doctor who accepts Medicare, anywhere in the US. No referrals needed.</p>
            <p><strong>Medicare Advantage:</strong> Limited to plan's network. May need referrals for specialists. Coverage mainly in your local area.</p>

            <h3 className="text-lg font-semibold">Cost Predictability</h3>
            <p><strong>Plan G:</strong> Higher monthly premiums but very predictable costs. Few surprise bills.</p>
            <p><strong>Medicare Advantage:</strong> Lower monthly premiums but variable costs depending on your healthcare usage.</p>

            <h3 className="text-lg font-semibold">Travel Coverage</h3>
            <p><strong>Plan G:</strong> Works anywhere in the US. No network concerns when traveling.</p>
            <p><strong>Medicare Advantage:</strong> Emergency coverage only outside your service area. Limited routine care when traveling.</p>

            <h2 className="text-xl font-bold">Who Should Choose Plan G</h2>
            
            <h3 className="text-lg font-semibold">Frequent Travelers</h3>
            <p>If you travel often or spend time in multiple states, Plan G's nationwide coverage is invaluable.</p>

            <h3 className="text-lg font-semibold">Those with Chronic Conditions</h3>
            <p>Predictable costs and unlimited provider access make Plan G attractive for complex medical needs.</p>

            <h3 className="text-lg font-semibold">High Healthcare Users</h3>
            <p>If you see specialists regularly, Plan G's lack of referral requirements and broader access can be beneficial.</p>

            <h3 className="text-lg font-semibold">Those Who Value Flexibility</h3>
            <p>Some people prefer the freedom to see any provider without network restrictions.</p>

            <h2 className="text-xl font-bold">Who Should Choose Medicare Advantage</h2>
            
            <h3 className="text-lg font-semibold">Budget-Conscious Seniors</h3>
            <p>Lower monthly premiums make Medicare Advantage attractive for those watching their budget.</p>

            <h3 className="text-lg font-semibold">Those Who Want Extra Benefits</h3>
            <p>If dental, vision, or hearing aid coverage is important, many Medicare Advantage plans include these benefits.</p>

            <h3 className="text-lg font-semibold">Healthy Seniors</h3>
            <p>If you use healthcare infrequently, Medicare Advantage's lower premiums can provide good value.</p>

            <h3 className="text-lg font-semibold">Those Who Stay Local</h3>
            <p>If you rarely travel and are comfortable with a local network, Medicare Advantage can work well.</p>

            <h2 className="text-xl font-bold">Cost Comparison Examples</h2>
            
            <h3 className="text-lg font-semibold">Low Healthcare Usage</h3>
            <p><strong>Plan G:</strong> $4,000/year in premiums + $240 deductible = $4,240</p>
            <p><strong>Medicare Advantage:</strong> $2,100/year + $500 in copays = $2,600</p>
            <p><em>Advantage wins by $1,640</em></p>

            <h3 className="text-lg font-semibold">High Healthcare Usage</h3>
            <p><strong>Plan G:</strong> $4,000/year in premiums + $240 deductible = $4,240</p>
            <p><strong>Medicare Advantage:</strong> $2,100/year + $3,000 copays = $5,100</p>
            <p><em>Plan G wins by $860</em></p>

            <h2 className="text-xl font-bold">Important Considerations</h2>
            
            <h3 className="text-lg font-semibold">Switching Challenges</h3>
            <p>Moving from Medicare Advantage to Plan G later requires medical underwriting. Health issues could prevent the switch or increase costs.</p>

            <h3 className="text-lg font-semibold">Plan Stability</h3>
            <p>Medicare Advantage plans can change networks, benefits, and costs annually. Plan G benefits remain stable.</p>

            <h3 className="text-lg font-semibold">Drug Coverage</h3>
            <p>With Plan G, you need a separate Part D plan. Many Medicare Advantage plans include drug coverage.</p>

            <h2 className="text-xl font-bold">Making Your Decision</h2>
            <p>Consider your priorities:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Flexibility vs. Cost:</strong> Plan G offers more flexibility; Medicare Advantage often costs less</li>
                <li><strong>Travel patterns:</strong> Frequent travelers often prefer Plan G</li>
                <li><strong>Health status:</strong> Complex conditions may benefit from Plan G's provider access</li>
                <li><strong>Budget constraints:</strong> Medicare Advantage has lower monthly premiums</li>
            </ul>

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>Both approaches can provide excellent Medicare coverage. The right choice depends on your priorities, health needs, travel patterns, and budget.</p>
            <p>Plan G offers maximum flexibility and predictable costs. Medicare Advantage offers lower premiums and extra benefits with some trade-offs in flexibility.</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Compare Options", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-options" },
          { title: "How to Choose the Right Medicare Advantage Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-advantage-plans" },
          { title: "Top Plan G Add-ons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/top-plan-g-addons" }
        ]}
      />
    </div>
  );
}
