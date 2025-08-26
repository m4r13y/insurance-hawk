import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function EveryoneNeedsCancerContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Everyone Needs a Cancer Plan: The Reality No One Talks About"
          category="Insurance"
          date="July 22, 2025"
          intro="Cancer affects 1 in 3 people, yet most have no financial plan for it. Learn why everyone needs cancer insurance and how to get the protection you need."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Everyone Needs a Cancer Plan - Financial Protection" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">The Uncomfortable Truth About Cancer</h2>
            <p>Cancer doesn't discriminate. It affects people of all ages, backgrounds, and health statuses. While we can't predict who will get cancer, we can predict one thing: it will be financially devastating without proper planning.</p>
            <p>The question isn't whether you should have a cancer plan—it's what kind of plan you need and when to get it.</p>

            <h2 className="text-xl font-bold">The Numbers Don't Lie</h2>
            
            <h3 className="text-lg font-semibold">Cancer Probability by Age</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Birth to 49:</strong> 1 in 43 men, 1 in 38 women</li>
                <li><strong>Age 50-59:</strong> 1 in 23 men, 1 in 25 women</li>
                <li><strong>Age 60-69:</strong> 1 in 11 men, 1 in 14 women</li>
                <li><strong>Age 70+:</strong> 1 in 6 men, 1 in 8 women</li>
                <li><strong>Lifetime risk:</strong> 1 in 3 overall</li>
            </ul>

            <h3 className="text-lg font-semibold">Financial Impact Reality</h3>
            <p>The average cancer patient faces:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>$150,000+ in total treatment costs</li>
                <li>$8,000-$15,000 in annual out-of-pocket maximums</li>
                <li>40% income loss during treatment</li>
                <li>$10,000+ in non-medical expenses</li>
                <li>42% deplete life savings within 2 years</li>
            </ul>

            <h2 className="text-xl font-bold">What Health Insurance Doesn't Cover</h2>
            
            <h3 className="text-lg font-semibold">The Coverage Gaps</h3>
            <p>Even excellent health insurance leaves significant gaps:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Deductibles and copays:</strong> Can reach $8,700 for individuals, $17,400 for families</li>
                <li><strong>Out-of-network costs:</strong> Specialists and treatment centers may not be in network</li>
                <li><strong>Experimental treatments:</strong> Cutting-edge therapies often not covered</li>
                <li><strong>Travel and lodging:</strong> Treatment at major cancer centers requires travel</li>
                <li><strong>Lost income:</strong> Extended time away from work during treatment</li>
            </ul>

            <h3 className="text-lg font-semibold">Hidden Costs of Cancer</h3>
            <p>Expenses most people don't consider:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Childcare during treatment and recovery</li>
                <li>Home modifications for accessibility</li>
                <li>Special foods and supplements</li>
                <li>Transportation to daily treatments</li>
                <li>Parking fees at treatment facilities</li>
                <li>Professional cleaning and meal services</li>
                <li>Mental health counseling</li>
            </ul>

            <h2 className="text-xl font-bold">Why Everyone Needs Cancer Insurance</h2>
            
            <h3 className="text-lg font-semibold">For Young Adults (20s-30s)</h3>
            <p><strong>Myth:</strong> "Cancer only affects older people"</p>
            <p><strong>Reality:</strong> Cancer rates in young adults are increasing:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Testicular cancer peaks in men 20-34</li>
                <li>Breast cancer affects women in their 30s</li>
                <li>Melanoma rates rising in people under 40</li>
                <li>Young adults often have high-deductible plans</li>
                <li>Cancer insurance costs less when you're younger</li>
            </ul>

            <h3 className="text-lg font-semibold">For Middle-Aged Adults (40s-50s)</h3>
            <p>Prime cancer insurance years:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Cancer rates increase significantly</li>
                <li>Peak earning years mean more to lose</li>
                <li>Family responsibilities are highest</li>
                <li>Still young enough for good rates</li>
                <li>Time to build cash value in some policies</li>
            </ul>

            <h3 className="text-lg font-semibold">For Seniors (65+)</h3>
            <p>Why Medicare isn't enough:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Medicare has deductibles and copays</li>
                <li>20% coinsurance on Part B services</li>
                <li>No out-of-pocket maximum in Original Medicare</li>
                <li>Part D coverage gaps for expensive drugs</li>
                <li>Cancer insurance supplements Medicare perfectly</li>
            </ul>

            <h2 className="text-xl font-bold">Types of Cancer Insurance Everyone Should Consider</h2>
            
            <h3 className="text-lg font-semibold">Cash Benefit Plans</h3>
            <p>Lump sum payments upon diagnosis:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Benefits:</strong> $10,000-$100,000+ upon diagnosis</li>
                <li><strong>Use:</strong> No restrictions on how money is spent</li>
                <li><strong>Best for:</strong> Immediate financial relief</li>
                <li><strong>Cost:</strong> $20-$60 monthly for meaningful coverage</li>
            </ul>

            <h3 className="text-lg font-semibold">Treatment-Specific Plans</h3>
            <p>Payments based on treatments received:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Surgery benefits:</strong> $1,000-$5,000 per surgery</li>
                <li><strong>Chemotherapy:</strong> $500-$1,000 per treatment</li>
                <li><strong>Radiation:</strong> $200-$500 per treatment</li>
                <li><strong>Hospitalization:</strong> Daily benefits for cancer-related stays</li>
            </ul>

            <h3 className="text-lg font-semibold">Return of Premium Options</h3>
            <p>Protection with a safety net:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Get money back if never diagnosed with cancer</li>
                <li>Higher premiums but guaranteed return</li>
                <li>Good for people worried about "wasting" premium money</li>
                <li>Typically return premiums at age 65 or 70</li>
            </ul>

            <h2 className="text-xl font-bold">Common Objections and Responses</h2>
            
            <h3 className="text-lg font-semibold">"I Have Good Health Insurance"</h3>
            <p><strong>Response:</strong> Health insurance covers medical bills. Cancer insurance covers everything else:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Your mortgage doesn't stop when you can't work</li>
                <li>Deductibles and copays add up quickly</li>
                <li>Best treatment may be out-of-network</li>
                <li>Lost income can devastate families</li>
            </ul>

            <h3 className="text-lg font-semibold">"I Can't Afford Another Insurance Payment"</h3>
            <p><strong>Response:</strong> You can't afford NOT to have cancer insurance:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>$30/month vs. $30,000+ out-of-pocket costs</li>
                <li>Prevents bankruptcy and financial ruin</li>
                <li>Peace of mind has value</li>
                <li>Family protection is priceless</li>
            </ul>

            <h3 className="text-lg font-semibold">"I'm Too Young to Worry About Cancer"</h3>
            <p><strong>Response:</strong> Young is the BEST time to get cancer insurance:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Lowest rates available</li>
                <li>No waiting periods or pre-existing conditions</li>
                <li>Cancer affects all ages</li>
                <li>Start building protection early</li>
            </ul>

            <h2 className="text-xl font-bold">How Much Cancer Insurance Do You Need?</h2>
            
            <h3 className="text-lg font-semibold">Basic Protection Level</h3>
            <p>Minimum coverage for essential needs:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cash benefit:</strong> $25,000</li>
                <li><strong>Covers:</strong> One year of health insurance deductibles</li>
                <li><strong>Cost:</strong> $15-$30 monthly</li>
                <li><strong>Best for:</strong> Budget-conscious individuals</li>
            </ul>

            <h3 className="text-lg font-semibold">Comprehensive Protection</h3>
            <p>Coverage for full financial security:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cash benefit:</strong> $50,000-$100,000</li>
                <li><strong>Covers:</strong> Multiple years of costs and lost income</li>
                <li><strong>Cost:</strong> $40-$80 monthly</li>
                <li><strong>Best for:</strong> Families with significant obligations</li>
            </ul>

            <h3 className="text-lg font-semibold">Premium Protection</h3>
            <p>Maximum coverage for complete peace of mind:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cash benefit:</strong> $100,000+</li>
                <li><strong>Additional benefits:</strong> Treatment-specific payments</li>
                <li><strong>Cost:</strong> $80-$150 monthly</li>
                <li><strong>Best for:</strong> High earners with substantial financial obligations</li>
            </ul>

            <h2 className="text-xl font-bold">When to Get Cancer Insurance</h2>
            
            <h3 className="text-lg font-semibold">Life Events That Trigger Need</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Getting married:</strong> Protecting your spouse's financial future</li>
                <li><strong>Having children:</strong> Ensuring family stability during illness</li>
                <li><strong>Buying a home:</strong> Protecting your mortgage payments</li>
                <li><strong>Starting a business:</strong> Covering expenses if you can't work</li>
                <li><strong>Approaching 40:</strong> Cancer rates begin increasing</li>
            </ul>

            <h3 className="text-lg font-semibold">The "Right Time" is Now</h3>
            <p>Reasons not to wait:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Rates increase with age</li>
                <li>Health conditions can make you uninsurable</li>
                <li>Waiting periods mean delayed protection</li>
                <li>Cancer doesn't wait for convenient timing</li>
            </ul>

            <h2 className="text-xl font-bold">Cancer Insurance Success Stories</h2>
            
            <h3 className="text-lg font-semibold">Case Study: Teacher, Age 42</h3>
            <p>Jennifer's ovarian cancer diagnosis:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Received $50,000 diagnosis benefit</li>
                <li>Used money for experimental treatment not covered by insurance</li>
                <li>Maintained mortgage payments during 6 months off work</li>
                <li>Hired help for childcare and housework</li>
                <li>Focused on recovery instead of finances</li>
            </ul>

            <h3 className="text-lg font-semibold">Case Study: Small Business Owner, Age 38</h3>
            <p>Mike's testicular cancer journey:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>$75,000 benefit covered lost business income</li>
                <li>Paid employee salaries during his absence</li>
                <li>Covered travel to specialized treatment center</li>
                <li>Maintained business operations and client relationships</li>
                <li>Returned to work without financial stress</li>
            </ul>

            <h2 className="text-xl font-bold">How to Choose Cancer Insurance</h2>
            
            <h3 className="text-lg font-semibold">Key Features to Compare</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Benefit amount:</strong> How much you receive upon diagnosis</li>
                <li><strong>Cancer types covered:</strong> Internal cancers vs. all cancers</li>
                <li><strong>Waiting periods:</strong> How long before coverage begins</li>
                <li><strong>Recurrence benefits:</strong> Additional payments for cancer return</li>
                <li><strong>Family coverage:</strong> Options for spouse and children</li>
            </ul>

            <h3 className="text-lg font-semibold">Questions to Ask Agents</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li>What cancers are excluded from coverage?</li>
                <li>How long are waiting periods for different benefits?</li>
                <li>Can I increase coverage later without medical underwriting?</li>
                <li>What happens if I develop cancer after age 65?</li>
                <li>Are there any restrictions on how I use the money?</li>
            </ul>

            <h2 className="text-xl font-bold">The Bottom Line: Cancer Planning is Life Planning</h2>
            <p>Cancer insurance isn't about being pessimistic—it's about being prepared. Just like we have car insurance hoping never to have an accident, we need cancer insurance hoping never to get cancer.</p>
            
            <p>The peace of mind that comes from knowing you and your family are financially protected is invaluable. The cost of cancer insurance is small compared to the potential financial devastation of facing cancer without protection.</p>

            <h2 className="text-xl font-bold">Take Action Today</h2>
            <p>Don't wait for the "right time" to get cancer insurance. The right time is:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Before you have any health issues</li>
                <li>While you can get the best rates</li>
                <li>When you can avoid waiting periods</li>
                <li>Today—because cancer doesn't make appointments</li>
            </ul>

            <p>Everyone needs a cancer plan. The question is: do you want to plan for it, or have it planned for you by circumstances beyond your control?</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Why Medicare Isn't Enough for Cancer Costs in 2025", imageUrl: "https://placehold.co/320x320.png", href: "/resources/cancer-statistics" },
          { title: "How Cancer Insurance Plans Are Designed", imageUrl: "https://placehold.co/320x320.png", href: "/resources/designing-cancer-plans" },
          { title: "Cancer Plans with Medicare Advantage", imageUrl: "https://placehold.co/320x320.png", href: "/resources/cancer-plans-with-advantage" }
        ]}
      />
    </div>
  );
}
