
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
        question: "Does Medicare cover all cancer costs?",
        answer: "No. While Medicare covers many treatment expenses, it doesn’t pay for everything. You might still face out-of-pocket costs for drugs, travel, home care, and other non-medical needs."
    },
    {
        question: "What is cancer insurance and how does it work?",
        answer: "It’s a simple lump sum policy that pays you cash after a diagnosis. You can use the money however you want—medical bills, groceries, rent, or even travel to treatment centers."
    },
    {
        question: "Is cancer insurance worth it if I already have Medigap?",
        answer: "It can be. Even with a supplement, surprise costs still pop up. Cancer insurance gives you extra cash to cover what Medicare and Medigap don’t."
    },
    {
        question: "How much does cancer insurance usually cost?",
        answer: "Most plans cost less than $30 a month for $10,000 in coverage. The price depends on your age and health, and it’s usually cheaper if you apply before any diagnosis."
    }
];

export function CancerStatisticsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Why Medicare Isn’t Enough for Cancer Costs in 2025"
          category="Insurance"
          date="July 22, 2025"
          intro="Cancer is more common and costly than most people expect. See how a simple lump sum policy can help Medicare beneficiaries stay financially secure."
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

            <h2 className="text-xl font-bold">Cancer by the Numbers: What the Stats Say in 2025</h2>
            <p>Let’s be honest—no one wants to think about cancer. But the truth is, it touches almost every family. In 2025, nearly 1.95 million people in the U.S. will hear the words “you have cancer.” That’s one new case every 16 seconds.</p>
            <p>And it’s not rare: <strong>1 in 2 men</strong> and <strong>1 in 3 women</strong> will be diagnosed at some point in their lives.</p>
            
            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse">
                <caption className="text-lg font-semibold mb-2 text-left">Cancer Diagnoses by Age Group (2025 est.)</caption>
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Age Group</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Percent of New Cases</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">Under 45</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">5%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">45–54</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">10%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">55–64</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">20%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">65–74</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">28%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2">75 and older</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-2 text-center">30%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>More than half of all new cancer diagnoses happen after age 65. That’s right when most people retire and start living on fixed incomes.</p>
            
            <figure className="my-8">
              <Image 
                className="w-full object-cover rounded-xl" 
                src="https://placehold.co/800x400.png" 
                alt="A visual showing a financial safety net."
                width={800}
                height={400}
                data-ai-hint="financial security safety"
              />
              <figcaption className="mt-2 text-sm text-center text-gray-500">
                A lump-sum cancer policy provides cash when you need it most.
              </figcaption>
            </figure>
            
            <h2 className="text-xl font-bold">How a Lump-Sum Policy Can Save You</h2>
            <p>Now imagine this: you're dealing with the stress of a cancer diagnosis, and then the bills start coming in. Medicare helps, but it doesn't cover everything. That's where cancer insurance steps in.</p>
            <p>With a lump sum cancer policy, you get a tax-free cash payout—typically $5,000 to $50,000—after a diagnosis. It’s fast, flexible money that you control.</p>
            
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                According to the National Cancer Institute, out-of-pocket cancer costs can reach $6,000 to $10,000 in the first year alone—even with Medicare. For about 40% of people, those costs lead to major financial stress.
            </blockquote>
            
            <p>You can use the cash benefit to pay medical bills, cover travel to a treatment center, bring in help at home, or just make sure the rent gets paid on time. No receipts. No red tape. And it’s surprisingly affordable. Many people get $10,000 in coverage for under $30 a month.</p>
            
            <h2 className="text-xl font-bold">Who Should Think About It?</h2>
            <p>You don’t need a family history to justify getting cancer insurance. Most people who buy these plans are:</p>
            <ul className="list-disc pl-6">
                <li>Living on fixed incomes</li>
                <li>Retired or nearing retirement</li>
                <li>Hoping to avoid touching their savings if something happens</li>
            </ul>
            <p>You’ve probably seen someone go through it. You know how hard it is. A simple, affordable policy won’t erase the hardship, but it can take a huge burden off your shoulders.</p>
            
            <FaqSection title="Frequently Asked Questions" items={faqItems} />

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>Having a plan in place doesn’t mean you’re expecting the worst. It means you’re smart enough to know that if it ever happens, you’ll be ready. Cancer doesn’t come with a warning, but protecting yourself from the financial side of it doesn’t have to be hard—or expensive.</p>
            
            <Button asChild size="lg" className="my-8 px-6 py-3">
              <Link href="/quotes?tab=cancer">Get a Cancer Insurance Quote</Link>
            </Button>
        </div>

        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Cancer Insurance" }, { tag: "Financial Planning" }]}
            likes={42}
            comments={9}
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
