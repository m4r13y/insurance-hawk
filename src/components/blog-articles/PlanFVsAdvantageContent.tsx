import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function PlanFVsAdvantageContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Plan F vs Medicare Advantage: Premium Coverage Comparison"
          category="Medicare"
          date="July 22, 2025"
          intro="Comparing maximum Medicare coverage options? Learn how Medigap Plan F and Medicare Advantage differ in cost, coverage, and flexibility."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Plan F vs Medicare Advantage Coverage Comparison" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Maximum Coverage vs. Value Coverage</h2>
            <p>Plan F represents the gold standard of Medicare supplement coverage, while Medicare Advantage offers comprehensive benefits with built-in extras at lower monthly costs.</p>
            <p><strong>Important:</strong> Plan F is only available to those who were eligible for Medicare before January 1, 2020.</p>

            <h2 className="text-xl font-bold">Plan F: The Gold Standard</h2>
            
            <h3 className="text-lg font-semibold">Complete Coverage</h3>
            <p>Plan F covers virtually every Medicare gap:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part A deductible ($1,632 in 2025)</li>
                <li>Part B deductible ($240 in 2025)</li>
                <li>All Part A and B coinsurance</li>
                <li>Part B excess charges</li>
                <li>Blood transfusion costs</li>
                <li>Skilled nursing facility coinsurance</li>
                <li>Hospice coinsurance</li>
                <li>Foreign travel emergency coverage</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay with Plan F</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium: $200-$300 (varies by area)</li>
                <li>Out-of-pocket costs: Nearly zero for Medicare-covered services</li>
                <li>Provider access: Any Medicare-accepting doctor nationwide</li>
            </ul>

            <h2 className="text-xl font-bold">Medicare Advantage: Comprehensive Value</h2>
            
            <h3 className="text-lg font-semibold">All-in-One Coverage</h3>
            <p>Medicare Advantage provides Medicare benefits plus extras:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Parts A and B coverage</li>
                <li>Often includes Part D (prescription drugs)</li>
                <li>Frequently includes dental, vision, hearing aids</li>
                <li>May include wellness programs, gym memberships</li>
                <li>Annual out-of-pocket maximums</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay with Medicare Advantage</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium: $0-$100 (many are $0)</li>
                <li>Deductibles and copays: Vary by plan</li>
                <li>Maximum out-of-pocket: $3,000-$8,000 annually</li>
                <li>Provider access: Limited to plan's network</li>
            </ul>

            <h2 className="text-xl font-bold">Key Differences</h2>
            
            <h3 className="text-lg font-semibold">Cost Structure</h3>
            <p><strong>Plan F:</strong> High monthly premiums, virtually no other costs</p>
            <p><strong>Medicare Advantage:</strong> Low monthly premiums, variable costs based on usage</p>

            <h3 className="text-lg font-semibold">Provider Access</h3>
            <p><strong>Plan F:</strong> Complete freedom to see any Medicare provider nationwide</p>
            <p><strong>Medicare Advantage:</strong> Limited to plan's network, may need referrals</p>

            <h3 className="text-lg font-semibold">Extra Benefits</h3>
            <p><strong>Plan F:</strong> Medical coverage only, need separate dental/vision/drug plans</p>
            <p><strong>Medicare Advantage:</strong> Often includes dental, vision, and drug coverage</p>

            <h2 className="text-xl font-bold">Annual Cost Comparison</h2>
            
            <h3 className="text-lg font-semibold">Low Healthcare Usage</h3>
            <p><strong>Plan F:</strong> $3,000 premium + $0 other costs = $3,000</p>
            <p><strong>Medicare Advantage:</strong> $600 premium + $800 copays = $1,400</p>
            <p><em>Medicare Advantage saves $1,600</em></p>

            <h3 className="text-lg font-semibold">Moderate Healthcare Usage</h3>
            <p><strong>Plan F:</strong> $3,000 premium + $0 other costs = $3,000</p>
            <p><strong>Medicare Advantage:</strong> $600 premium + $2,500 copays = $3,100</p>
            <p><em>Plan F saves $100</em></p>

            <h3 className="text-lg font-semibold">High Healthcare Usage</h3>
            <p><strong>Plan F:</strong> $3,000 premium + $0 other costs = $3,000</p>
            <p><strong>Medicare Advantage:</strong> $600 premium + $5,000 max out-of-pocket = $5,600</p>
            <p><em>Plan F saves $2,600</em></p>

            <h2 className="text-xl font-bold">Who Should Choose Plan F</h2>
            
            <h3 className="text-lg font-semibold">Existing Plan F Members</h3>
            <p>If you already have Plan F, keeping it usually makes sense. You have the most comprehensive coverage available.</p>

            <h3 className="text-lg font-semibold">High Healthcare Users</h3>
            <p>Those with chronic conditions or frequent medical needs benefit from Plan F's predictable costs and unlimited provider access.</p>

            <h3 className="text-lg font-semibold">Frequent Travelers</h3>
            <p>Plan F works anywhere in the US without network restrictions, perfect for those who travel extensively.</p>

            <h3 className="text-lg font-semibold">Those Who Value Simplicity</h3>
            <p>Pay your premium and never worry about medical bills again (for Medicare-covered services).</p>

            <h2 className="text-xl font-bold">Who Should Choose Medicare Advantage</h2>
            
            <h3 className="text-lg font-semibold">Budget-Conscious Seniors</h3>
            <p>Lower monthly premiums make Medicare Advantage attractive for those watching their monthly expenses.</p>

            <h3 className="text-lg font-semibold">Those Who Want Extras</h3>
            <p>If dental, vision, or hearing aid coverage is important, Medicare Advantage often includes these benefits.</p>

            <h3 className="text-lg font-semibold">Light Healthcare Users</h3>
            <p>Healthy seniors who rarely need medical care can save significantly with Medicare Advantage's lower premiums.</p>

            <h3 className="text-lg font-semibold">Local-Focused Individuals</h3>
            <p>If you stay primarily in your home area, network restrictions may not be a concern.</p>

            <h2 className="text-xl font-bold">Important Considerations</h2>
            
            <h3 className="text-lg font-semibold">Plan F Availability</h3>
            <p>New Medicare beneficiaries (eligible after 1/1/2020) cannot enroll in Plan F. They should consider Plan G as the closest alternative.</p>

            <h3 className="text-lg font-semibold">Switching Challenges</h3>
            <p>Moving from Medicare Advantage to Plan F (if eligible) requires medical underwriting and can be expensive or impossible with health issues.</p>

            <h3 className="text-lg font-semibold">Plan Stability</h3>
            <p>Plan F benefits never change. Medicare Advantage plans can modify networks, benefits, and costs annually.</p>

            <h2 className="text-xl font-bold">Long-Term Considerations</h2>
            
            <h3 className="text-lg font-semibold">Premium Increases</h3>
            <p>Plan F often sees significant premium increases because it attracts older, sicker beneficiaries.</p>

            <h3 className="text-lg font-semibold">Health Changes</h3>
            <p>As health declines, Plan F's comprehensive coverage becomes more valuable, while Medicare Advantage's out-of-pocket costs can become burdensome.</p>

            <h3 className="text-lg font-semibold">Network Stability</h3>
            <p>Medicare Advantage networks change annually. Plan F provides permanent access to any Medicare provider.</p>

            <h2 className="text-xl font-bold">Making Your Decision</h2>
            
            <h3 className="text-lg font-semibold">Choose Plan F if:</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>You're already enrolled and satisfied</li>
                <li>You use healthcare frequently</li>
                <li>You want maximum predictability</li>
                <li>You travel often or value unlimited provider choice</li>
            </ul>

            <h3 className="text-lg font-semibold">Choose Medicare Advantage if:</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>You want lower monthly premiums</li>
                <li>You're generally healthy</li>
                <li>You value extras like dental and vision</li>
                <li>You're comfortable with network restrictions</li>
            </ul>

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>Plan F offers the ultimate in Medicare coverage with maximum predictability and provider freedom, but at the highest cost.</p>
            <p>Medicare Advantage provides excellent value with lower monthly costs and extra benefits, but with some trade-offs in flexibility.</p>
            <p>Your choice depends on your health status, budget priorities, travel patterns, and comfort with potential out-of-pocket costs.</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Top Plan F Add-ons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/top-plan-f-addons" },
          { title: "How to Choose the Right Medicare Advantage Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-advantage-plans" },
          { title: "Compare Options", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-options" }
        ]}
      />
    </div>
  );
}
