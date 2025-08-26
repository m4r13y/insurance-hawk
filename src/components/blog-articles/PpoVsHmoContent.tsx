import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function PpoVsHmoContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="PPO vs HMO Medicare Advantage Plans: Which is Right for You?"
          category="Medicare"
          date="July 22, 2025"
          intro="Choosing between PPO and HMO Medicare Advantage plans? Learn the key differences in flexibility, cost, and provider access."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="PPO vs HMO Medicare Advantage Plans Comparison" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Understanding Medicare Advantage Plan Types</h2>
            <p>PPO and HMO are the two main types of Medicare Advantage plans. Each offers different approaches to provider networks, referrals, and costs.</p>
            <p>Understanding these differences helps you choose the plan type that matches your healthcare preferences and budget.</p>

            <h2 className="text-xl font-bold">HMO Plans: Structured and Cost-Effective</h2>
            
            <h3 className="text-lg font-semibold">How HMO Plans Work</h3>
            <p>Health Maintenance Organization (HMO) plans use a coordinated care approach:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Choose a Primary Care Provider (PCP) from the plan's network</li>
                <li>PCP coordinates all your care and provides referrals</li>
                <li>Must use in-network providers for routine care</li>
                <li>Emergency care covered anywhere</li>
                <li>Usually lower costs than PPO plans</li>
            </ul>

            <h3 className="text-lg font-semibold">HMO Cost Structure</h3>
            <p>Typical HMO costs:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium: $0-$50</li>
                <li>PCP visits: $0-$15</li>
                <li>Specialist visits: $15-$40</li>
                <li>Hospital stays: $100-$300 per day</li>
                <li>Maximum out-of-pocket: $3,000-$6,000</li>
            </ul>

            <h2 className="text-xl font-bold">PPO Plans: Flexibility and Choice</h2>
            
            <h3 className="text-lg font-semibold">How PPO Plans Work</h3>
            <p>Preferred Provider Organization (PPO) plans offer more flexibility:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>No need to choose a primary care provider</li>
                <li>See specialists without referrals</li>
                <li>Can use out-of-network providers (at higher cost)</li>
                <li>Larger provider networks</li>
                <li>More freedom to self-direct your care</li>
            </ul>

            <h3 className="text-lg font-semibold">PPO Cost Structure</h3>
            <p>Typical PPO costs:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium: $20-$100</li>
                <li>PCP visits: $10-$25</li>
                <li>Specialist visits: $25-$50</li>
                <li>Hospital stays: $200-$400 per day</li>
                <li>Maximum out-of-pocket: $4,000-$8,000</li>
            </ul>

            <h2 className="text-xl font-bold">Key Differences</h2>
            
            <h3 className="text-lg font-semibold">Referral Requirements</h3>
            <p><strong>HMO:</strong> Must get referrals from your PCP to see specialists</p>
            <p><strong>PPO:</strong> Can see specialists directly without referrals</p>

            <h3 className="text-lg font-semibold">Provider Networks</h3>
            <p><strong>HMO:</strong> Must use in-network providers for routine care</p>
            <p><strong>PPO:</strong> Can use out-of-network providers but pay more</p>

            <h3 className="text-lg font-semibold">Primary Care Provider</h3>
            <p><strong>HMO:</strong> Required to choose a PCP who coordinates your care</p>
            <p><strong>PPO:</strong> No PCP requirement; you manage your own care</p>

            <h3 className="text-lg font-semibold">Cost</h3>
            <p><strong>HMO:</strong> Generally lower premiums and copays</p>
            <p><strong>PPO:</strong> Higher premiums and copays but more flexibility</p>

            <h2 className="text-xl font-bold">Who Should Choose HMO Plans</h2>
            
            <h3 className="text-lg font-semibold">Budget-Conscious Seniors</h3>
            <p>HMO plans typically have lower premiums and out-of-pocket costs, making them ideal for those prioritizing affordability.</p>

            <h3 className="text-lg font-semibold">Those Who Like Coordinated Care</h3>
            <p>If you prefer having one doctor manage your overall care and coordinate with specialists, HMO structure can be beneficial.</p>

            <h3 className="text-lg font-semibold">People with Established Local Care</h3>
            <p>If your doctors are in the HMO network and you're satisfied with local providers, HMO plans work well.</p>

            <h3 className="text-lg font-semibold">Those Who Don't Travel Much</h3>
            <p>Since HMO plans have more limited networks, they work best for people who stay in their local area.</p>

            <h2 className="text-xl font-bold">Who Should Choose PPO Plans</h2>
            
            <h3 className="text-lg font-semibold">Those Who Value Flexibility</h3>
            <p>If you want the freedom to see specialists without referrals and manage your own care, PPO plans offer that flexibility.</p>

            <h3 className="text-lg font-semibold">Frequent Travelers</h3>
            <p>PPO plans typically have larger networks and may offer better coverage when traveling.</p>

            <h3 className="text-lg font-semibold">People with Complex Conditions</h3>
            <p>If you need to see multiple specialists regularly, the ability to self-refer can save time and hassle.</p>

            <h3 className="text-lg font-semibold">Those Who Want Out-of-Network Options</h3>
            <p>PPO plans allow you to use out-of-network providers at higher cost, giving you more choices.</p>

            <h2 className="text-xl font-bold">Cost Comparison Example</h2>
            
            <h3 className="text-lg font-semibold">Annual Costs for Moderate Healthcare User</h3>
            <p><strong>HMO Plan:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Premium: $25/month × 12 = $300</li>
                <li>PCP visits: 4 × $10 = $40</li>
                <li>Specialist visits: 6 × $30 = $180</li>
                <li>Tests and procedures: $400</li>
                <li><strong>Total: $920</strong></li>
            </ul>

            <p><strong>PPO Plan:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Premium: $60/month × 12 = $720</li>
                <li>PCP visits: 4 × $20 = $80</li>
                <li>Specialist visits: 6 × $40 = $240</li>
                <li>Tests and procedures: $600</li>
                <li><strong>Total: $1,640</strong></li>
            </ul>
            <p><em>HMO saves $720 annually</em></p>

            <h2 className="text-xl font-bold">Important Considerations</h2>
            
            <h3 className="text-lg font-semibold">Provider Network Changes</h3>
            <p>Both HMO and PPO networks can change annually. Always verify your doctors are still covered during Open Enrollment.</p>

            <h3 className="text-lg font-semibold">Emergency Care</h3>
            <p>Both plan types cover emergency care anywhere in the US. The differences mainly apply to routine care.</p>

            <h3 className="text-lg font-semibold">Prescription Drug Coverage</h3>
            <p>Most HMO and PPO plans include prescription drug coverage, but formularies and costs can vary significantly.</p>

            <h2 className="text-xl font-bold">Questions to Ask When Choosing</h2>
            
            <h3 className="text-lg font-semibold">About Your Current Doctors</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Are my doctors in this plan's network?</li>
                <li>Are my preferred hospitals included?</li>
                <li>How stable has the network been over time?</li>
            </ul>

            <h3 className="text-lg font-semibold">About Your Healthcare Preferences</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Do I want a PCP to coordinate my care?</li>
                <li>How often do I see specialists?</li>
                <li>Do I prefer managing my own healthcare decisions?</li>
            </ul>

            <h3 className="text-lg font-semibold">About Your Lifestyle</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Do I travel frequently?</li>
                <li>Do I split time between different areas?</li>
                <li>How important is having the lowest possible costs?</li>
            </ul>

            <h2 className="text-xl font-bold">Making Your Decision</h2>
            
            <h3 className="text-lg font-semibold">Choose HMO if you:</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Want the lowest possible costs</li>
                <li>Are comfortable with referral requirements</li>
                <li>Like having care coordinated by a PCP</li>
                <li>Stay primarily in your local area</li>
            </ul>

            <h3 className="text-lg font-semibold">Choose PPO if you:</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Value flexibility and choice</li>
                <li>Want to see specialists without referrals</li>
                <li>Travel frequently or live in multiple areas</li>
                <li>Are willing to pay more for additional options</li>
            </ul>

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>Both HMO and PPO Medicare Advantage plans can provide excellent coverage. The right choice depends on your priorities:</p>
            <p>HMO plans excel at providing comprehensive care at the lowest cost with coordinated care management.</p>
            <p>PPO plans offer maximum flexibility and choice, perfect for those who want to direct their own care and have broader provider access.</p>
            <p>Consider your healthcare needs, budget, and lifestyle preferences when making your decision.</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "How to Choose the Right Medicare Advantage Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-advantage-plans" },
          { title: "3 Biggest Gaps in Medicare Advantage Plans", imageUrl: "https://placehold.co/320x320.png", href: "/resources/three-biggest-gaps" },
          { title: "Compare Options", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-options" }
        ]}
      />
    </div>
  );
}
