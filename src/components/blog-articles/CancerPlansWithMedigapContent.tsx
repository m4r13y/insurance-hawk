
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/FaqSection";
import Image from "next/image";
import Link from "next/link";

const faqItems = [
    {
        question: "Doesn’t Medicare cover cancer treatment?",
        answer: "Yes, Medicare covers medically necessary cancer treatments. But there can be gaps in drug coverage, travel, and out-of-pocket costs, especially for advanced or ongoing care."
    },
    {
        question: "How much does cancer insurance cost?",
        answer: "Premiums vary based on age and benefit amount, but many plans start around $20 to $30/month for a $10,000 benefit."
    },
    {
        question: "Can I get a policy if I’ve already had cancer?",
        answer: "Some policies exclude pre-existing conditions. However, guaranteed issue options may be available depending on your situation."
    },
    {
        question: "Is cancer insurance worth it if I already have a Medigap Plan G or Plan N?",
        answer: "Yes, because Medigap covers Medicare-approved expenses. Cancer insurance provides cash for everything else Medicare doesn’t pay for."
    }
];

export function CancerPlansWithMedigapContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Cancer Insurance with a Medicare Supplement Plan"
          category="Medicare"
          date="July 23, 2025"
          intro="Cancer is expensive. Even with Medicare and a supplement, the bills can pile up fast. A simple cancer plan could save you thousands."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            {/* ### SEO Best Practice: Video Content ### */}
            {/* Notes: Videos increase user engagement and time on page, which are positive SEO signals. */}
            {/* Always include a relevant video when possible to explain complex topics. */}
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

            <h2 className="text-xl font-bold">Cancer Can Change Everything—Including Your Finances</h2>
            <p>A cancer diagnosis doesn’t just impact your health. It can also hit your wallet in unexpected ways. Even with Medicare and a Medigap plan, many people are surprised by the out-of-pocket costs that come with modern cancer treatment, especially when it involves frequent travel, experimental therapies, or extended recovery time. That’s why more Medicare beneficiaries are adding a separate cancer insurance policy to their coverage.</p>
            <p>Let’s break down why it’s a smart move.</p>
            
            <h2 className="text-xl font-bold">What Medigap Covers (and What It Doesn’t)</h2>
            <p>Medigap helps pay your share of costs in Original Medicare, like coinsurance, copays, and deductibles. But it doesn't cover everything. It typically won’t pay for prescription drugs (you’ll need a separate Part D plan), long-term care, or many of the non-medical costs that come with cancer, like travel, lodging, or lost income.</p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                In short, Medigap is great, but not complete. And cancer treatment often pushes the limits of what’s “covered.”
            </blockquote>

            {/* ### SEO Best Practice: Include High-Quality Images ### */}
            {/* Notes: Images break up text, improve readability, and can rank in Google Image Search. */}
            {/* Use descriptive alt text and add a data-ai-hint for placeholder images. */}
            <figure className="my-8">
              <Image 
                className="w-full object-cover rounded-xl" 
                src="https://placehold.co/800x400.png" 
                alt="A visual showing how a cancer plan provides a financial safety net."
                width={800}
                height={400}
                data-ai-hint="financial security planning"
              />
              <figcaption className="mt-2 text-sm text-center text-gray-500">
                A cancer policy provides cash for costs that Medigap doesn't cover.
              </figcaption>
            </figure>

            <h2 className="text-xl font-bold">The Hidden Costs of Cancer Treatment</h2>
            <p>Even with the right doctors, cancer care comes with extra financial pressure. Oral chemotherapy drugs might not be fully covered by your Part D plan. If you live far from a major treatment center, you might have to pay for travel and hotel stays. These are not covered by Medicare or Medigap, but they’re very real expenses. For more on the numbers, see our article on <Link href="/resources/cancer-statistics">cancer statistics</Link>.</p>
            
            <h2 className="text-xl font-bold">How Cancer Insurance Fills the Gaps</h2>
            <p>Cancer insurance is a standalone policy that pays a lump-sum cash benefit if you’re diagnosed. That money can be used for anything you need—medical bills, travel, groceries, or even a mortgage payment. There are no restrictions. This flexibility means you can focus on getting better, not figuring out how to pay for care.</p>

            <h2 className="text-xl font-bold">Who Should Consider Cancer Insurance?</h2>
            <ul className="list-disc pl-6 space-y-2">
                <li>You have a family history of cancer.</li>
                <li>You live in a rural area and might need to travel for treatment.</li>
                <li>You are on a fixed income and want to avoid large surprise expenses.</li>
                <li>You want added peace of mind in case of a serious illness.</li>
            </ul>

            {/* ### SEO Best Practice: FAQ Schema ### */}
            {/* Notes: Use the FaqSection component to automatically generate structured data, */}
            {/* which helps you win rich snippets in search results. */}
            <FaqSection title="Frequently Asked Questions" items={faqItems} />
            
            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>Medicare and a supplement plan offer great protection, but they don’t cover everything. Cancer insurance adds another layer of security by providing a lump-sum cash benefit you can use on your terms. It’s simple, affordable, and smart planning—just in case.</p>
            
            {/* ### SEO Best Practice: Clear Call-to-Action (CTA) ### */}
            {/* Notes: Every article should guide the reader on what to do next. */}
            {/* A prominent button is more effective than a simple text link. */}
            <Button asChild size="lg" className="my-8 px-6 py-3">
              <Link href="/quotes?tab=cancer">Explore Cancer Insurance Options</Link>
            </Button>
        </div>

        <ActionButtons
            badges={[{ tag: "Medigap" }, { tag: "Cancer Insurance" }]}
            likes={31}
            comments={7}
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
