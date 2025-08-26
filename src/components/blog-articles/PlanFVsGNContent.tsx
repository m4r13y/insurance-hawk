import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function PlanFVsGNContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Plan F vs Plan G vs Plan N: Complete Medigap Comparison"
          category="Medicare"
          date="July 22, 2025"
          intro="Comparing the three most popular Medigap plans? Learn the key differences between Plans F, G, and N to make the right choice."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Plan F vs Plan G vs Plan N Complete Comparison" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">The Three Most Popular Medigap Plans</h2>
            <p>Plans F, G, and N represent different approaches to Medicare supplemental coverage. Each offers comprehensive protection with varying levels of cost-sharing.</p>
            <p>Understanding these differences helps you choose the plan that best balances coverage with affordability.</p>

            <h2 className="text-xl font-bold">Plan F: Maximum Coverage (Existing Members Only)</h2>
            
            <h3 className="text-lg font-semibold">Important Note</h3>
            <p>Plan F is no longer available to new Medicare beneficiaries (those eligible after January 1, 2020). Only existing members can keep this plan.</p>

            <h3 className="text-lg font-semibold">What Plan F Covers</h3>
            <p>Plan F covers virtually all Medicare gaps:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part A deductible</li>
                <li>Part B deductible</li>
                <li>Part A and B coinsurance</li>
                <li>Part B excess charges</li>
                <li>First 3 pints of blood</li>
                <li>Skilled nursing facility coinsurance</li>
                <li>Hospice coinsurance</li>
                <li>Foreign travel emergency coverage</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay with Plan F</h3>
            <p>Monthly premium only. After that, virtually no out-of-pocket costs for Medicare-covered services.</p>

            <h2 className="text-xl font-bold">Plan G: Near-Maximum Coverage</h2>
            
            <h3 className="text-lg font-semibold">What Plan G Covers</h3>
            <p>Plan G covers everything Plan F covers except the Part B deductible:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part A deductible</li>
                <li>Part A and B coinsurance</li>
                <li>Part B excess charges</li>
                <li>First 3 pints of blood</li>
                <li>Skilled nursing facility coinsurance</li>
                <li>Hospice coinsurance</li>
                <li>Foreign travel emergency coverage</li>
            </ul>

            <h3 className="text-lg font-semibold">What You Pay with Plan G</h3>
            <p>Monthly premium plus the annual Part B deductible ($240 in 2025). After meeting the deductible, virtually no out-of-pocket costs.</p>

            <h2 className="text-xl font-bold">Plan N: Balanced Coverage with Copays</h2>
            
            <h3 className="text-lg font-semibold">What Plan N Covers</h3>
            <p>Plan N covers most Medicare gaps with small copays:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part A deductible</li>
                <li>Part A and B coinsurance (after Part B deductible)</li>
                <li>First 3 pints of blood</li>
                <li>Skilled nursing facility coinsurance</li>
                <li>Hospice coinsurance</li>
                <li>Foreign travel emergency coverage</li>
            </ul>

            <h3 className="text-lg font-semibold">What Plan N Doesn't Cover</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>Part B deductible</li>
                <li>Part B excess charges</li>
                <li>Office visit copays (up to $20)</li>
                <li>Emergency room copays (up to $50)</li>
            </ul>

            <h2 className="text-xl font-bold">Premium Comparison</h2>
            <p>Typical monthly premiums (vary by location and insurance company):</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Plan F:</strong> $200-$300/month</li>
                <li><strong>Plan G:</strong> $150-$250/month</li>
                <li><strong>Plan N:</strong> $120-$180/month</li>
            </ul>

            <p>Plan N typically costs $40-$60 less per month than Plan G, and Plan G costs $30-$50 less than Plan F.</p>

            <h2 className="text-xl font-bold">Annual Cost Comparison</h2>
            
            <h3 className="text-lg font-semibold">Low Healthcare Usage (4 doctor visits/year)</h3>
            <p><strong>Plan G:</strong> $2,400 premium + $240 deductible = $2,640</p>
            <p><strong>Plan N:</strong> $1,800 premium + $240 deductible + $80 copays = $2,120</p>
            <p><em>Plan N saves $520</em></p>

            <h3 className="text-lg font-semibold">Moderate Healthcare Usage (15 doctor visits/year)</h3>
            <p><strong>Plan G:</strong> $2,400 premium + $240 deductible = $2,640</p>
            <p><strong>Plan N:</strong> $1,800 premium + $240 deductible + $300 copays = $2,340</p>
            <p><em>Plan N saves $300</em></p>

            <h3 className="text-lg font-semibold">High Healthcare Usage (30 doctor visits/year)</h3>
            <p><strong>Plan G:</strong> $2,400 premium + $240 deductible = $2,640</p>
            <p><strong>Plan N:</strong> $1,800 premium + $240 deductible + $600 copays = $2,640</p>
            <p><em>Plans cost the same</em></p>

            <h2 className="text-xl font-bold">Who Should Choose Each Plan</h2>
            
            <h3 className="text-lg font-semibold">Plan F (Existing Members)</h3>
            <p>If you already have Plan F and are satisfied with it, there's usually no reason to switch. You have the most comprehensive coverage available.</p>

            <h3 className="text-lg font-semibold">Plan G</h3>
            <p>Choose Plan G if you:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Want comprehensive coverage with minimal out-of-pocket costs</li>
                <li>Prefer predictable expenses</li>
                <li>Use healthcare frequently</li>
                <li>Live in an area where doctors charge excess fees</li>
            </ul>

            <h3 className="text-lg font-semibold">Plan N</h3>
            <p>Choose Plan N if you:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Want good coverage at a lower premium</li>
                <li>Don't mind small copays for routine care</li>
                <li>Use healthcare infrequently to moderately</li>
                <li>Are budget-conscious but want solid protection</li>
            </ul>

            <h2 className="text-xl font-bold">Key Considerations</h2>
            
            <h3 className="text-lg font-semibold">Excess Charges</h3>
            <p>Part B excess charges (when doctors charge more than Medicare pays) are rare but can be significant. Plans F and G cover these; Plan N doesn't.</p>

            <h3 className="text-lg font-semibold">Premium Stability</h3>
            <p>All Medigap plans can increase premiums over time. Plan F often has the highest increases because it attracts the sickest beneficiaries.</p>

            <h3 className="text-lg font-semibold">Underwriting</h3>
            <p>Switching between Medigap plans typically requires medical underwriting. Health issues could prevent switches or increase costs.</p>

            <h2 className="text-xl font-bold">Switching Between Plans</h2>
            
            <h3 className="text-lg font-semibold">From Plan F</h3>
            <p>Plan F members can usually switch to Plan G without underwriting in most states, potentially saving money with minimal coverage loss.</p>

            <h3 className="text-lg font-semibold">From Plan G to Plan N</h3>
            <p>This typically requires underwriting since Plan N offers less coverage than Plan G.</p>

            <h3 className="text-lg font-semibold">From Plan N to Plan G</h3>
            <p>This also requires underwriting since you'd be getting more coverage.</p>

            <h2 className="text-xl font-bold">Our Recommendations</h2>
            
            <h3 className="text-lg font-semibold">For New Medicare Beneficiaries</h3>
            <p>Plan G offers the best balance of comprehensive coverage and reasonable cost for most people.</p>

            <h3 className="text-lg font-semibold">For Budget-Conscious Seniors</h3>
            <p>Plan N provides excellent value if you're comfortable with small copays and don't mind the Part B deductible.</p>

            <h3 className="text-lg font-semibold">For Maximum Protection</h3>
            <p>Plan G gives you near-maximum coverage (similar to Plan F) at a lower cost.</p>

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>All three plans offer excellent Medicare supplement coverage. Your choice depends on your balance between monthly premiums and out-of-pocket costs.</p>
            <p>Plan G offers the best combination of comprehensive coverage and value for most new Medicare beneficiaries.</p>
            <p>Plan N provides good coverage at a lower cost if you're comfortable with small copays.</p>
            <p>Plan F remains excellent coverage for existing members but is no longer available to new beneficiaries.</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Top Plan F Add-ons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/top-plan-f-addons" },
          { title: "Top Plan G Add-ons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/top-plan-g-addons" },
          { title: "Top Plan N Add-ons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/top-plan-n-addons" }
        ]}
      />
    </div>
  );
}
