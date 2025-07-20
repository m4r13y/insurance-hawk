
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
        question: "What is the Medicare drug plan penalty?",
        answer: "If you don’t sign up when you’re first eligible, you’ll pay an extra amount with your premium—every month, for as long as you have a drug plan."
    },
    {
        question: "When can I sign up for a Medicare drug plan?",
        answer: "You can join when you’re first eligible for Medicare, or during the yearly Open Enrollment (Oct 15–Dec 7)."
    },
    {
        question: "Can I change drug plans every year?",
        answer: "Yes! You can switch plans each year if your needs or medicine list changes."
    },
    {
        question: "What if I need help paying for my medicines?",
        answer: "Medicare’s Extra Help program can lower your costs. See if you qualify at Medicare.gov."
    },
    {
        question: "Can I keep my current pharmacy?",
        answer: "Check if your favorite pharmacy is in your plan’s network. Using out-of-network pharmacies usually costs more."
    },
    {
        question: "What if I don’t have drug coverage?",
        answer: "You’ll pay full price for prescriptions, and you may have to pay a penalty if you sign up later."
    }
];

export function DrugPlansExplainedContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="How Medicare Prescription Drug Plans Work: What You Need to Know in 2025"
          category="Medicare"
          date="July 23, 2025"
          intro="Trying to figure out Medicare drug coverage? Learn how premiums, deductibles, and penalties work, and how to pick the right plan—even if you don’t take medications."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="YouTube video player placeholder" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <h2 className="text-xl font-bold">What is a Medicare Prescription Drug Plan?</h2>
            <p>Medicare prescription drug plans (also called "Part D") help cover the cost of your medications. You get these plans from private insurance companies approved by Medicare. In exchange for a monthly premium, the plan pays a portion of your drug costs. Each plan has its own list of covered medicines, called a "formulary."</p>

            <h2 className="text-xl font-bold">How Do Premiums and Deductibles Work?</h2>
            <p>Every Part D plan has a monthly premium, typically ranging from $30 to $60 in 2025. You'll also have a yearly deductible, which is the amount you pay for medications before the plan starts helping. Most deductibles are under $600. After you meet it, you pay a copay or coinsurance for each prescription.</p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>New for 2025:</strong> There’s a new $2,000 cap on out-of-pocket costs. Once you spend that much on covered drugs, you'll pay nothing more for the rest of the year.
            </blockquote>
            
            <figure className="my-8">
              <Image 
                className="w-full object-cover rounded-xl" 
                src="https://placehold.co/800x400.png" 
                alt="A table showing the typical costs for Medicare Part D in 2025."
                width={800}
                height={400}
                data-ai-hint="financial chart"
              />
              <figcaption className="mt-2 text-sm text-center text-gray-500">
                Understanding Part D costs helps you budget for your healthcare expenses in retirement.
              </figcaption>
            </figure>

            <h2 className="text-xl font-bold">The Late Enrollment Penalty: Why You Need a Plan Now</h2>
            <p>You might think you can skip a drug plan if you don’t take medications, but Medicare charges a late enrollment penalty for that. The fee is added to your monthly premium for life. The best way to avoid it is to get coverage when you’re first eligible, even if it's a low-cost plan.</p>
            
            <div className="overflow-x-auto my-6">
              <table className="w-full text-left border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Medicare Drug Plan Costs in 2025 (Quick View)</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 font-semibold">Cost Type</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 font-semibold">Typical Range in 2025</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Monthly Premium</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">$30 – $60+</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Deductible</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">$0 – $600</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Copay/Coinsurance</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Varies by plan/drug</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Out-of-Pocket Max</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">$2,000 (new for 2025)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold">How to Choose the Right Drug Plan</h2>
            <p>The best drug plan depends on the medicines you take. Here's how to compare your options:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Make a list of all your current prescriptions.</li>
                <li>Check each plan’s formulary (drug list) to see if your meds are covered.</li>
                <li>Compare the monthly premiums, deductibles, and copays for your specific drugs.</li>
                <li>Make sure your favorite pharmacy is in the plan’s network to get the best prices.</li>
            </ul>

            <FaqSection title="Frequently Asked Questions" items={faqItems} />

            <h2 className="text-xl font-bold">Final Thoughts</h2>
            <p>
                Having drug coverage is a crucial part of your Medicare plan. It protects you from high costs and ensures you can afford the medications you need, both now and in the future.
            </p>
            
            <Button asChild size="lg" className="my-8 px-6 py-3">
                <Link href="/dashboard/quotes?tab=medigap">Schedule Your Medicare Review</Link>
            </Button>
        </div>

        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Part D" }, { tag: "Prescription Drugs" }]}
            likes={25}
            comments={6}
          />
      </BlogContent>

      <BlogSidebar
        author={{
          name: "Jonathan Hawkins",
          avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77",
          bio: "CFP | Medicare Specialist",
        }}
        mediaLinks={[]}
      />
    </div>
  );
}
