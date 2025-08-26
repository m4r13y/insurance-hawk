import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function PlanNVsAdvantageContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Plan N vs Medicare Advantage: Value-Focused Comparison"
          category="Medicare"
          date="July 22, 2025"
          intro="Comparing budget-friendly options? Learn how Medigap Plan N and Medicare Advantage stack up for cost-conscious seniors."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Plan N vs Medicare Advantage Value Comparison" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Two Budget-Friendly Medicare Options</h2>
            <p>Plan N and Medicare Advantage both offer good value for cost-conscious seniors. Each takes a different approach to balancing coverage with affordability.</p>
            <p>Understanding these approaches helps you choose the option that best fits your healthcare needs and budget.</p>

            <h2 className="text-xl font-bold">Plan N Overview</h2>
            
            <h3 className="text-lg font-semibold">What Plan N Covers</h3>
            <p>Plan N covers most Medicare gaps with small copays for routine services:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part A deductible and coinsurance</li>
                <li>Part B coinsurance (after deductible)</li>
                <li>Blood transfusion costs</li>
                <li>Skilled nursing facility coinsurance</li>
                <li>Hospice coinsurance</li>
                <li>Foreign travel emergency coverage</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay with Plan N</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium: $120-$180 (varies by area)</li>
                <li>Part B deductible: $240/year</li>
                <li>Doctor office copay: Up to $20 per visit</li>
                <li>Emergency room copay: Up to $50 per visit</li>
                <li>Part B excess charges: Not covered</li>
            </ul>

            <h2 className="text-xl font-bold">Medicare Advantage Overview</h2>
            
            <h3 className="text-lg font-semibold">What Medicare Advantage Covers</h3>
            <p>All Medicare benefits through one plan, often with extras:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Parts A and B coverage</li>
                <li>Often includes Part D (prescription drugs)</li>
                <li>May include dental, vision, hearing aids</li>
                <li>Wellness programs and extras</li>
                <li>Maximum annual out-of-pocket limits</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay with Medicare Advantage</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium: $0-$100 (many are $0)</li>
                <li>Deductibles: Vary by plan</li>
                <li>Copays: $10-$50 for office visits</li>
                <li>Coinsurance: 10-20% for some services</li>
                <li>Maximum out-of-pocket: $3,000-$8,000/year</li>
            </ul>

            <h2 className="text-xl font-bold">Key Differences</h2>
            
            <h3 className="text-lg font-semibold">Provider Networks</h3>
            <p><strong>Plan N:</strong> Access to any Medicare-accepting provider nationwide. No network restrictions.</p>
            <p><strong>Medicare Advantage:</strong> Limited to plan's provider network. May need referrals for specialists.</p>

            <h3 className="text-lg font-semibold">Predictability</h3>
            <p><strong>Plan N:</strong> Predictable copays with few surprises. Most services covered after small copays.</p>
            <p><strong>Medicare Advantage:</strong> Variable costs depending on usage. Protected by annual out-of-pocket maximums.</p>

            <h3 className="text-lg font-semibold">Extra Benefits</h3>
            <p><strong>Plan N:</strong> Medical coverage only. Need separate dental, vision, and Part D plans.</p>
            <p><strong>Medicare Advantage:</strong> Often includes dental, vision, and prescription coverage in one plan.</p>

            <h2 className="text-xl font-bold">Cost Comparison Scenarios</h2>
            
            <h3 className="text-lg font-semibold">Scenario 1: Light Healthcare User (4 doctor visits/year)</h3>
            <p><strong>Plan N costs:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Premium: $150/month × 12 = $1,800</li>
                <li>Part B deductible: $240</li>
                <li>Doctor copays: 4 × $20 = $80</li>
                <li><strong>Total: $2,120</strong></li>
            </ul>

            <p><strong>Medicare Advantage costs:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Premium: $25/month × 12 = $300</li>
                <li>Deductible: $200</li>
                <li>Doctor copays: 4 × $25 = $100</li>
                <li><strong>Total: $600</strong></li>
            </ul>
            <p><em>Medicare Advantage saves $1,520</em></p>

            <h3 className="text-lg font-semibold">Scenario 2: Moderate Healthcare User (10 doctor visits, 1 ER visit)</h3>
            <p><strong>Plan N costs:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Premium: $1,800</li>
                <li>Part B deductible: $240</li>
                <li>Doctor copays: 10 × $20 = $200</li>
                <li>ER copay: $50</li>
                <li><strong>Total: $2,290</strong></li>
            </ul>

            <p><strong>Medicare Advantage costs:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Premium: $300</li>
                <li>Deductible: $200</li>
                <li>Doctor copays: 10 × $25 = $250</li>
                <li>ER copay: $100</li>
                <li><strong>Total: $850</strong></li>
            </ul>
            <p><em>Medicare Advantage saves $1,440</em></p>

            <h3 className="text-lg font-semibold">Scenario 3: High Healthcare User (reaches out-of-pocket max)</h3>
            <p><strong>Plan N costs:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Premium: $1,800</li>
                <li>Part B deductible: $240</li>
                <li>Various copays: ~$500</li>
                <li><strong>Total: $2,540</strong></li>
            </ul>

            <p><strong>Medicare Advantage costs:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Premium: $300</li>
                <li>Out-of-pocket maximum: $5,000</li>
                <li><strong>Total: $5,300</strong></li>
            </ul>
            <p><em>Plan N saves $2,760</em></p>

            <h2 className="text-xl font-bold">Who Should Choose Plan N</h2>
            
            <h3 className="text-lg font-semibold">Moderate to High Healthcare Users</h3>
            <p>If you see doctors regularly or have chronic conditions, Plan N's predictable copays often cost less than Medicare Advantage's variable costs.</p>

            <h3 className="text-lg font-semibold">Travelers</h3>
            <p>Plan N works anywhere in the US without network restrictions, making it ideal for frequent travelers.</p>

            <h3 className="text-lg font-semibold">Those Who Value Provider Choice</h3>
            <p>If you want to see any Medicare-accepting doctor without referrals, Plan N provides that flexibility.</p>

            <h2 className="text-xl font-bold">Who Should Choose Medicare Advantage</h2>
            
            <h3 className="text-lg font-semibold">Light Healthcare Users</h3>
            <p>If you rarely see doctors and are generally healthy, Medicare Advantage's lower premiums can provide significant savings.</p>

            <h3 className="text-lg font-semibold">Those Who Want Extras</h3>
            <p>If dental, vision, or hearing aid coverage is important, Medicare Advantage often includes these benefits.</p>

            <h3 className="text-lg font-semibold">Local-Focused Seniors</h3>
            <p>If you stay primarily in your home area and are comfortable with network restrictions, Medicare Advantage can work well.</p>

            <h2 className="text-xl font-bold">Important Considerations</h2>
            
            <h3 className="text-lg font-semibold">Network Changes</h3>
            <p>Medicare Advantage plans can change networks annually. Your doctors might not be covered next year.</p>

            <h3 className="text-lg font-semibold">Switching Difficulties</h3>
            <p>Moving from Medicare Advantage to Plan N later requires medical underwriting. Health issues could prevent the switch.</p>

            <h3 className="text-lg font-semibold">Part D Coverage</h3>
            <p>Plan N requires a separate Part D plan for prescription drugs. Many Medicare Advantage plans include drug coverage.</p>

            <h2 className="text-xl font-bold">Making Your Choice</h2>
            <p>Both options provide good value, but for different people:</p>
            
            <p><strong>Choose Plan N if you:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Use healthcare moderately to frequently</li>
                <li>Travel often or value provider flexibility</li>
                <li>Want predictable costs</li>
                <li>Don't mind higher monthly premiums for lower copays</li>
            </ul>

            <p><strong>Choose Medicare Advantage if you:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Use healthcare infrequently</li>
                <li>Want the lowest possible monthly premiums</li>
                <li>Value extras like dental and vision coverage</li>
                <li>Are comfortable with network restrictions</li>
            </ul>

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>Plan N offers excellent value for people who use healthcare regularly and want provider flexibility.</p>
            <p>Medicare Advantage can provide outstanding value for healthy seniors who use healthcare infrequently.</p>
            <p>Consider your healthcare usage patterns, travel habits, and preference for predictable versus variable costs when making your decision.</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Top Plan N Add-ons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/top-plan-n-addons" },
          { title: "How to Choose the Right Medicare Advantage Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-advantage-plans" },
          { title: "Plan G vs Plan N", imageUrl: "https://placehold.co/320x320.png", href: "/resources/plan-g-vs-n" }
        ]}
      />
    </div>
  );
}
