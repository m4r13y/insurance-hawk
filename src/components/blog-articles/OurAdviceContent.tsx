import { BlogContent } from "@/components/BlogContent";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";

export function OurAdviceContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Our Medicare Advice: Expert Recommendations for 2025"
          category="Medicare"
          date="July 22, 2025"
          intro="Get straight-forward advice from Medicare specialists. Learn our proven approach to choosing the right Medicare plans for your situation."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Our Medicare Advice: Expert Recommendations" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Why Our Advice Matters</h2>
            <p>After helping thousands of people navigate Medicare, we've seen the same questions and challenges over and over. This video shares our real-world perspective on making Medicare decisions.</p>
            <p>We don't sell insurance. We help people understand their options so they can make informed choices.</p>

            <h2 className="text-xl font-bold">Our Core Medicare Philosophy</h2>
            
            <h3 className="text-lg font-semibold">1. Start With Your Doctors</h3>
            <p>The best Medicare plan is worthless if it doesn't cover your doctors and medications. Always check networks first.</p>

            <h3 className="text-lg font-semibold">2. Focus on Out-of-Pocket Maximums</h3>
            <p>Premiums get attention, but your maximum annual costs matter more. A low premium with high deductibles can cost you thousands.</p>

            <h3 className="text-lg font-semibold">3. Consider Your Health Trajectory</h3>
            <p>Are you healthy now but expecting changes? Or managing chronic conditions? Your five-year outlook should influence your choice.</p>

            <h2 className="text-xl font-bold">Our Top Recommendations by Situation</h2>
            
            <h3 className="text-lg font-semibold">If You're New to Medicare</h3>
            <p>Start with Medicare Supplement Plan G or a highly-rated Medicare Advantage plan in your area. Both provide good protection while you learn the system.</p>

            <h3 className="text-lg font-semibold">If You Travel Frequently</h3>
            <p>Original Medicare with a supplement gives you nationwide coverage. Medicare Advantage plans often have limited networks outside your area.</p>

            <h3 className="text-lg font-semibold">If You're Budget-Conscious</h3>
            <p>Look at Medicare Advantage plans first. Many have $0 premiums and include extras like dental and vision.</p>

            <h3 className="text-lg font-semibold">If You Have Chronic Conditions</h3>
            <p>Medicare supplements provide more predictable costs. You'll pay higher premiums but avoid surprise bills.</p>

            <h2 className="text-xl font-bold">Common Mistakes We See</h2>
            <p>People often choose plans based on premium cost alone. This can lead to higher overall expenses when you need care.</p>
            <p>Don't ignore drug coverage. Even if you take no medications now, you'll face penalties if you need coverage later.</p>
            <p>Review your plan annually. Your health, medications, and available plans change every year.</p>

            <h2 className="text-xl font-bold">Questions to Ask Before Choosing</h2>
            <ul className="list-disc pl-6 space-y-2">
                <li>Are my doctors in this plan's network?</li>
                <li>Are my medications covered, and what will they cost?</li>
                <li>What's my maximum out-of-pocket cost for the year?</li>
                <li>Does this plan work if I travel or spend time in other states?</li>
                <li>What happens if my health changes significantly?</li>
            </ul>

            <h2 className="text-xl font-bold">When to Get Help</h2>
            <p>Medicare decisions affect your health and finances for years. Consider working with a licensed agent or counselor if:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>You have complex medical conditions</li>
                <li>You take multiple expensive medications</li>
                <li>You're overwhelmed by the options</li>
                <li>You need help comparing costs across different plan types</li>
            </ul>

            <h2 className="text-xl font-bold">Our Final Advice</h2>
            <p>There's no perfect Medicare plan. The goal is finding the best fit for your situation and budget.</p>
            <p>Don't postpone the decision hoping for better options. Late enrollment penalties can cost you thousands over time.</p>
            <p>Remember: You can change plans every year during Open Enrollment if your needs change.</p>
        </div>
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Medicare Beginner's Guide", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medicare-beginners-guide" },
          { title: "Compare Options", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-options" },
          { title: "Enrollment Periods Explained", imageUrl: "https://placehold.co/320x320.png", href: "/resources/enrollment-periods" }
        ]}
      />
    </div>
  );
}
