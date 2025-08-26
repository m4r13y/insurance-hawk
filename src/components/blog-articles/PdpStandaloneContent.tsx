import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function PdpStandaloneContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Standalone Part D vs Medicare Advantage Drug Coverage"
          category="Medicare"
          date="July 22, 2025"
          intro="Should you get standalone Part D with Original Medicare or choose Medicare Advantage with built-in drug coverage? Learn the key differences."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Standalone Part D vs Medicare Advantage Drug Coverage" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Two Ways to Get Medicare Drug Coverage</h2>
            <p>You can get prescription drug coverage through a standalone Part D plan with Original Medicare, or through a Medicare Advantage plan that includes drug coverage.</p>
            <p>Each approach has different benefits, costs, and restrictions that affect your overall Medicare experience.</p>

            <h2 className="text-xl font-bold">Standalone Part D Plans</h2>
            
            <h3 className="text-lg font-semibold">How Standalone Part D Works</h3>
            <p>You keep Original Medicare (Parts A and B) and add a separate Part D plan for prescription coverage:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Choose from dozens of Part D plans in your area</li>
                <li>Works with any Medicare supplement plan</li>
                <li>Coverage follows you anywhere in the US</li>
                <li>Can change plans during Open Enrollment</li>
                <li>Plans compete solely on drug coverage and cost</li>
            </ul>

            <h3 className="text-lg font-semibold">Standalone Part D Costs</h3>
            <p>Typical Part D plan costs:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium: $7-$100</li>
                <li>Annual deductible: $0-$545</li>
                <li>Copays vary by drug tier and plan</li>
                <li>Coverage gap protection in 2025</li>
                <li>Catastrophic coverage after $8,000 in costs</li>
            </ul>

            <h2 className="text-xl font-bold">Medicare Advantage with Drug Coverage</h2>
            
            <h3 className="text-lg font-semibold">How MA-PD Plans Work</h3>
            <p>Medicare Advantage plans with prescription drug coverage (MA-PD) provide all Medicare benefits in one plan:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Combines medical and drug coverage</li>
                <li>Often includes extras like dental and vision</li>
                <li>May have $0 monthly premium</li>
                <li>Network restrictions apply to pharmacies</li>
                <li>Coverage primarily in your local area</li>
            </ul>

            <h3 className="text-lg font-semibold">MA-PD Cost Structure</h3>
            <p>Typical MA-PD costs:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Monthly premium: $0-$80 (many are $0)</li>
                <li>Drug deductible: Often $0</li>
                <li>Copays: $0-$50 per prescription</li>
                <li>Combined medical/drug out-of-pocket maximum</li>
            </ul>

            <h2 className="text-xl font-bold">Key Differences</h2>
            
            <h3 className="text-lg font-semibold">Plan Selection</h3>
            <p><strong>Standalone Part D:</strong> Choose medical and drug coverage separately, optimizing each for your needs</p>
            <p><strong>MA-PD:</strong> Medical and drug coverage bundled together; must accept both or neither</p>

            <h3 className="text-lg font-semibold">Geographic Coverage</h3>
            <p><strong>Standalone Part D:</strong> Works nationwide with any Medicare provider</p>
            <p><strong>MA-PD:</strong> Limited to plan's service area and pharmacy networks</p>

            <h3 className="text-lg font-semibold">Flexibility</h3>
            <p><strong>Standalone Part D:</strong> Can change drug plans without affecting medical coverage</p>
            <p><strong>MA-PD:</strong> Changing plans affects both medical and drug coverage</p>

            <h2 className="text-xl font-bold">Drug Coverage Comparison</h2>
            
            <h3 className="text-lg font-semibold">Formulary Competition</h3>
            <p><strong>Standalone Part D:</strong> Plans compete primarily on drug coverage, often resulting in better formularies</p>
            <p><strong>MA-PD:</strong> Drug coverage is secondary to medical benefits, may have more restrictions</p>

            <h3 className="text-lg font-semibold">Pharmacy Networks</h3>
            <p><strong>Standalone Part D:</strong> Usually larger pharmacy networks, including major chains and mail order</p>
            <p><strong>MA-PD:</strong> May have smaller pharmacy networks with preferred cost tiers</p>

            <h3 className="text-lg font-semibold">Prior Authorization</h3>
            <p><strong>Standalone Part D:</strong> Generally fewer prior authorization requirements</p>
            <p><strong>MA-PD:</strong> May have more utilization management and restrictions</p>

            <h2 className="text-xl font-bold">Cost Comparison Examples</h2>
            
            <h3 className="text-lg font-semibold">Scenario 1: Low Drug Costs ($200/month)</h3>
            <p><strong>Original Medicare + Part D:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part D premium: $30/month</li>
                <li>Drug copays: $50/month</li>
                <li>Monthly total: $80</li>
            </ul>

            <p><strong>Medicare Advantage with drugs:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Plan premium: $0/month</li>
                <li>Drug copays: $60/month</li>
                <li>Monthly total: $60</li>
            </ul>
            <p><em>MA-PD saves $20/month</em></p>

            <h3 className="text-lg font-semibold">Scenario 2: High Drug Costs ($800/month)</h3>
            <p><strong>Original Medicare + Part D:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part D premium: $50/month</li>
                <li>Drug copays: $200/month (after coverage gap protection)</li>
                <li>Monthly total: $250</li>
            </ul>

            <p><strong>Medicare Advantage with drugs:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Plan premium: $0/month</li>
                <li>Drug copays: $400/month</li>
                <li>Monthly total: $400</li>
            </ul>
            <p><em>Part D saves $150/month</em></p>

            <h2 className="text-xl font-bold">Who Should Choose Standalone Part D</h2>
            
            <h3 className="text-lg font-semibold">High Drug Costs</h3>
            <p>People with expensive medications often find better coverage and lower costs with standalone Part D plans.</p>

            <h3 className="text-lg font-semibold">Frequent Travelers</h3>
            <p>Part D plans work nationwide, while MA-PD plans may have limited pharmacy networks outside your area.</p>

            <h3 className="text-lg font-semibold">Those with Medicare Supplements</h3>
            <p>If you have a Medigap plan, you need standalone Part D coverage for prescription drugs.</p>

            <h3 className="text-lg font-semibold">People with Rare Conditions</h3>
            <p>Specialty drug coverage is often better with standalone Part D plans that compete specifically on drug benefits.</p>

            <h2 className="text-xl font-bold">Who Should Choose MA-PD Plans</h2>
            
            <h3 className="text-lg font-semibold">Low Drug Costs</h3>
            <p>People who take few or inexpensive medications often find MA-PD plans provide good value.</p>

            <h3 className="text-lg font-semibold">Those Who Want Simplicity</h3>
            <p>Having medical and drug coverage in one plan simplifies enrollment and plan management.</p>

            <h3 className="text-lg font-semibold">Budget-Conscious Seniors</h3>
            <p>Many MA-PD plans have $0 premiums and include extras like dental coverage.</p>

            <h3 className="text-lg font-semibold">Local-Focused Individuals</h3>
            <p>If you stay in your local area and use preferred pharmacies, MA-PD networks may work fine.</p>

            <h2 className="text-xl font-bold">Important Considerations</h2>
            
            <h3 className="text-lg font-semibold">Late Enrollment Penalties</h3>
            <p>You need creditable drug coverage to avoid penalties. Both options provide this protection.</p>

            <h3 className="text-lg font-semibold">Plan Changes</h3>
            <p>You can switch between these approaches during Open Enrollment, but consider any medical underwriting requirements for supplements.</p>

            <h3 className="text-lg font-semibold">Drug Coverage Gaps</h3>
            <p>Both types of plans have eliminated the coverage gap for most beneficiaries in 2025.</p>

            <h2 className="text-xl font-bold">Making Your Decision</h2>
            
            <h3 className="text-lg font-semibold">Analyze Your Medications</h3>
            <p>Use Medicare's Plan Finder to compare how your specific drugs are covered under different options.</p>

            <h3 className="text-lg font-semibold">Consider Your Overall Medicare Strategy</h3>
            <p>If you want Original Medicare with a supplement, you'll need standalone Part D. If you prefer all-in-one coverage, consider MA-PD.</p>

            <h3 className="text-lg font-semibold">Think About Future Needs</h3>
            <p>Your drug needs may change. Which approach gives you better options for adapting to changes?</p>

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>Standalone Part D plans often provide better drug coverage and more flexibility, especially for people with expensive medications.</p>
            <p>Medicare Advantage with drug coverage can offer good value for healthy seniors with simple drug needs who want all-in-one convenience.</p>
            <p>Your choice should align with your overall Medicare strategy and specific prescription drug needs.</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "How Medicare Drug Plans Work", imageUrl: "https://placehold.co/320x320.png", href: "/resources/drug-plans-explained" },
          { title: "Compare PDP Plans", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-pdp-plans" },
          { title: "PDP Pros & Cons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/pdp-pros-cons" }
        ]}
      />
    </div>
  );
}
