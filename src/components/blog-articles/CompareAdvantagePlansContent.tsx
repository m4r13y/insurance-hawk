
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/FaqSection";
import Image from "next/image";
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";

const faqItems = [
    {
        question: "What’s new with Medicare Advantage in 2025?",
        answer: "Medicare drug costs are now capped at $2,000 out-of-pocket per year, and new mental health and caregiver supports are available."
    },
    {
        question: "When can I enroll or switch plans?",
        answer: "The annual enrollment period is October 15 to December 7. There are also special periods if you have certain life changes."
    },
    {
        question: "Do I need a referral to see a specialist?",
        answer: "Some plans, like HMOs, require a referral from your primary doctor. PPOs usually don’t."
    },
    {
        question: "Can I use my plan anywhere in the country?",
        answer: "Most plans have networks based on where you live. Emergency care is always covered, but routine care may cost more outside your area."
    },
    {
        question: "How do I know if my prescriptions are covered?",
        answer: "Each plan has its own drug list (formulary). Check that your medications are listed, and see if your pharmacy is in-network. If your drug costs reach $2,000, you pay nothing more for Part D drugs the rest of the year in 2025."
    }
];

export function CompareAdvantagePlansContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="How to Choose the Right Medicare Advantage Plan in 2025"
          category="Medicare"
          date="July 23, 2025"
          intro="Finding the right Medicare Advantage plan doesn’t have to be stressful. This guide will help you compare benefits, costs, and coverage, so you can pick a plan that fits your needs and budget."
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

            <h2 className="text-xl font-bold">What is a Medicare Advantage Plan?</h2>
            <p>Medicare Advantage plans (also called Part C) are all-in-one alternatives to Original Medicare. These plans are offered by private insurance companies approved by Medicare. Most include extra benefits like dental, vision, hearing, and prescription drug coverage.</p>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                You might pay lower out-of-pocket costs and get extra perks that Original Medicare doesn’t offer, such as fitness programs or transportation help.
            </blockquote>
            
            <h2 className="text-xl font-bold">Steps to Choose the Right Plan</h2>
            <ol className="list-decimal pl-6 space-y-4">
                <li>
                    <strong>Check What Each Plan Covers:</strong> Every plan must cover at least what Original Medicare does, but benefits beyond that can vary a lot. Look for extras like dental, vision, hearing, or wellness programs. Some plans offer expanded mental health support and caregiver benefits in 2025.
                </li>
                <li>
                    <strong>Make Sure Your Doctors and Hospitals Are in Network:</strong> Most Medicare Advantage plans use a network of doctors and hospitals. If you have favorite providers, check if they are in the plan’s network. Out-of-network care could cost more, or may not be covered at all.
                </li>
                <li>
                    <strong>Review Prescription Drug Coverage:</strong> Not all plans cover the same drugs, and some plans have different rules about how you get your medicine. In 2025, out-of-pocket drug costs will be capped at $2,000 for the year. You can also choose to spread your costs throughout the year with new payment options.
                </li>
                <li>
                    <strong>Compare Costs:</strong> Each plan sets its own costs, including monthly premiums, deductibles, and copays. Some plans have $0 premiums, but you still have to pay your Medicare Part B premium. Look at the plan’s yearly maximum out-of-pocket limit, since this protects you from very high costs. A <Link href="/dashboard/resources/hip-for-advantage">hospital indemnity plan</Link> can help cover these costs.
                </li>
            </ol>

            <div className="overflow-x-auto my-6">
              <Table>
                <TableCaption>Typical Medicare Advantage Costs in 2025</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cost Type</TableHead>
                    <TableHead>What You Might Pay (2025)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Part B Premium</TableCell>
                    <TableCell>$185/month</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Part C Monthly Premium</TableCell>
                    <TableCell>$0–$100+ (varies by plan)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maximum Out-of-Pocket</TableCell>
                    <TableCell>Varies (set by plan)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Drug Costs Cap</TableCell>
                    <TableCell>$2,000/year max</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <ol className="list-decimal pl-6 space-y-4" start={5}>
                <li>
                    <strong>Check Star Ratings and Reviews:</strong> Medicare rates plans on a scale of 1 to 5 stars, with 5 being the best. These ratings look at things like customer service, care quality, and member satisfaction. You can use these ratings to compare your options.
                </li>
                <li>
                    <strong>Think About Extra Help:</strong> If you have a limited income, you may qualify for programs that help pay your Medicare costs. Some plans also have special benefits for people with certain conditions or who need more support.
                </li>
            </ol>
            
            <FaqSection title="Frequently Asked Questions" items={faqItems} />

            <h2 className="text-xl font-bold">What to Do Next</h2>
            <p>
                Start with your must-haves, like doctors or prescriptions. Compare plan extras and total yearly costs. Take advantage of star ratings and free help if you need it. The right Medicare Advantage plan is out there for you in 2025.
            </p>
            
            <Button size="lg" className="my-8 px-6 py-3">
              Compare Medicare Advantage Plans
            </Button>
        </div>

        <ActionButtons
            badges={[{ tag: "Medicare Advantage" }, { tag: "Plan Comparison" }]}
            likes={15}
            comments={3}
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
