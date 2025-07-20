
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/FaqSection";
import Image from "next/image";
import Link from 'next/link';

const faqItems = [
    {
        question: "What if I’m helping a parent sign up?",
        answer: "You can help gather documents and join calls with Social Security, but only the person enrolling can make choices unless you have power of attorney or legal authority."
    },
    {
        question: "What happens if I travel a lot?",
        answer: "Original Medicare covers you anywhere in the U.S. Some Medigap plans include foreign emergency coverage. Advantage plans may limit coverage outside your home area."
    },
    {
        question: "Can I change my mind after picking a plan?",
        answer: "Yes. Each fall during Open Enrollment, you can switch plans. Some special situations let you change at other times, too."
    },
    {
        question: "How do I know what plan is best?",
        answer: "Focus on what matters most—keeping your doctor, total cost, and extra benefits. Use the Medicare Plan Finder and talk with a SHIP counselor for free advice."
    },
    {
        question: "What if I’m still working at 65?",
        answer: "Check with your employer about whether you should delay Medicare. Sometimes it's best to keep your job coverage, but get the details in writing to avoid penalties."
    }
];

export function MedicareBeginnersGuideContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="How to Transition to Medicare: Your Step-by-Step Guide for 2025"
          category="Medicare"
          date="July 22, 2025"
          intro="Feeling unsure about what happens when you switch to Medicare? This guide breaks it down into simple steps, covers deadlines, and answers the top questions. You’ll know exactly what to expect and how to make smart choices for your health and budget."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
             <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/hzP_KO6fwLU" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">Who Gets Medicare &amp; When?</h2>
            <p>Most people qualify for Medicare at age 65. If you already get Social Security or Railroad Retirement benefits, you’ll be signed up automatically for Medicare Parts A and B. If you aren’t, you’ll need to enroll yourself—but it’s a straightforward process.</p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Mary’s Story:</strong> Mary turned 65 in July. Three months before her birthday, she got a letter letting her know she’d be enrolled in Medicare automatically since she was already getting Social Security. Her friend John, who hadn’t filed for Social Security yet, had to sign up for Medicare on his own.
            </blockquote>
            <p>Your <Link href="/dashboard/resources/enrollment-periods">enrollment window</Link> is 7 months: it starts three months before your birthday, includes your birthday month, and runs three months after. Missing this window can mean higher costs, so set a reminder.</p>
            
            <h2 className="text-xl font-bold">What Are the Parts of Medicare—and What Do You Really Need?</h2>
            <p>Medicare has four main parts, but you don’t need to memorize them all. Here’s what matters:</p>
            <ul className="list-disc pl-6">
                <li><strong>Part A</strong> covers hospital care.</li>
                <li><strong>Part B</strong> covers doctor visits and outpatient care.</li>
                <li><strong>Part D</strong> helps pay for prescription drugs.</li>
                <li><strong>Medicare Advantage (Part C)</strong> is an “all-in-one” option offered by private companies, usually bundling A, B, and D (plus extras like dental or vision).</li>
            </ul>
            <p><strong>What most people do:</strong> You’ll choose between Original Medicare (Parts A & B) plus a drug plan, or a Medicare Advantage plan that combines it all. If you want help with copays and deductibles, you can add a Medigap plan to Original Medicare, but you don’t have to decide right away.</p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Example:</strong> John wanted to keep seeing his specialist, so he picked Original Medicare plus a Part D drug plan and a Medigap policy. Mary liked the idea of one card for everything and some dental benefits, so she went with a Medicare Advantage plan.
            </blockquote>
            
            <h2 className="text-xl font-bold">What Will Medicare Cost?</h2>
            <ul className="list-disc pl-6">
                <li>Most people pay <strong>$0 for Part A</strong> (if you worked and paid Medicare taxes for at least 10 years).</li>
                <li>Part B costs <strong>$185/month in 2025</strong> for most people.</li>
                <li>Drug plan and Advantage plan costs vary; some have $0 premiums, some charge more depending on coverage.</li>
                <li>In 2025, there’s a <strong>$2,000 annual limit</strong> on what you pay out-of-pocket for prescriptions under Part D.</li>
            </ul>
            
             <figure className="my-8">
              <Image 
                className="w-full object-cover rounded-xl" 
                src="https://placehold.co/800x400.png" 
                alt="A person reviewing Medicare documents at a desk."
                width={800}
                height={400}
                data-ai-hint="planning guide"
              />
              <figcaption className="mt-2 text-sm text-center text-gray-500">
                Navigating your Medicare options is a key step in financial planning for retirement.
              </figcaption>
            </figure>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse my-6">
                <thead>
                  <tr className="bg-gray-50 dark:bg-neutral-800">
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Benefit</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Plan A</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Plan G</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Plan N</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Part A coinsurance (hospital)</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Part B coinsurance</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Blood (first 3 pints)</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Part A hospice coinsurance</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Skilled nursing facility coinsurance</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-red-600">✗</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Part A deductible</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-red-600">✗</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Part B deductible</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-red-600">✗</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-red-600">✗</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-red-600">✗</span></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Excess charges</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-red-600">✗</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-green-600">✓</span></td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center"><span className="font-bold text-red-600">✗</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold">Step-by-Step: How To Get Started</h2>
            <ol className="list-decimal pl-6 space-y-2">
                <li>Check your calendar for your enrollment window. It’s usually around your 65th birthday.</li>
                <li>Decide how you want your coverage:
                    <ul className="list-disc pl-6 mt-2">
                        <li>Want more freedom? Original Medicare lets you see any doctor who accepts Medicare.</li>
                        <li>Want simplicity and extras? Medicare Advantage plans bundle everything, but use networks.</li>
                    </ul>
                </li>
                <li>Add prescription drug coverage. If you skip this, you may pay a penalty later—even if you don’t take medicine now.</li>
                <li>Consider a Medigap plan if you choose Original Medicare and want help with extra costs. You have 6 months from when your Part B starts to buy any Medigap plan with no health questions.</li>
                <li>Enroll online, by phone, or in person. Go to Medicare.gov or call Social Security at 1-800-772-1213. Bring your Social Security number and proof of age/citizenship.</li>
            </ol>
            <p><strong>Tip:</strong> Most people finish the entire process online in under an hour.</p>

            <h2 className="text-xl font-bold">After You Sign Up: What Happens Next?</h2>
            <ul className="list-disc pl-6">
                <li>Your Medicare card arrives by mail in a few weeks.</li>
                <li>Review your chosen plan’s materials—look for your Summary of Benefits and Evidence of Coverage.</li>
                <li>If you chose a Medicare Advantage or Part D plan, you’ll get a separate card from that company.</li>
                <li>Make sure your doctor and pharmacy are in your new plan’s network (for Advantage or drug plans).</li>
                <li>Set up online access at Medicare.gov to track claims and see your coverage.</li>
            </ul>

            <h2 className="text-xl font-bold">Common Situations & What To Do</h2>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Still working at 65?</strong> Ask your employer if you should delay Part B and D. Sometimes it makes sense to keep your job’s health plan, but don’t risk a <Link href="/dashboard/resources/avoiding-penalties">penalty by guessing</Link>. Check out our guide on <Link href="/dashboard/resources/working-past-65">how to handle Medicare when working past 65</Link> for more details.</li>
                <li><strong>Retiring later or already have health insurance?</strong> If you have other coverage (from work, a union, the VA, or TRICARE), talk to your benefits administrator. There are special enrollment periods if you lose this coverage later.</li>
                <li><strong>Tight on money?</strong> Check for Extra Help, Medicare Savings Programs, or Medicaid—these can lower or even eliminate your premiums and copays if you qualify.</li>
                <li><strong>Moved or want to change plans?</strong> Each fall (Oct 15–Dec 7) is Medicare Open Enrollment. You can switch plans or add coverage with no penalty.</li>
            </ul>
            
            <h2 className="text-xl font-bold">Mistakes to Avoid</h2>
            <ul className="list-disc pl-6">
                <li>Missing your 7-month sign-up window—<Link href="/dashboard/resources/avoiding-penalties">late sign-up can mean higher costs</Link> forever.</li>
                <li>Skipping drug coverage—penalties apply even if you don’t take prescriptions now.</li>
                <li>Not checking if your doctor or pharmacy is in your new plan’s network (especially with Medicare Advantage).</li>
                <li>Forgetting to review your plan every year. Plans and coverage change.</li>
                <li>Not asking for help. Local counselors (SHIP) and Medicare.gov are free and unbiased.</li>
            </ul>

            <FaqSection title="Real Questions, Real Answers" items={faqItems} />

            <h2 className="text-xl font-bold">Next Steps</h2>
            <p>Medicare doesn’t have to be confusing or overwhelming. Start by marking your calendar, decide what coverage fits your life, and ask questions along the way. After you enroll, review your plan each year, stay aware of new benefits, and get help if you need it. The right plan gives you peace of mind, saves money, and helps you get the care you need—now and for years to come.</p>
            <p>Ready to get started? Head to Medicare.gov or call your local SHIP counselor today.</p>
            
            <Button size="lg" className="my-8 px-6 py-3">Schedule Your Medicare Review</Button>

        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Beginner's Guide" }]}
            likes={0}
            comments={0}
          />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[]}
      />
    </div>
  );
}
