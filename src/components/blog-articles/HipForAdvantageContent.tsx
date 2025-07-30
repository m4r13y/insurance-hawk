
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
        question: "What is a hospital indemnity plan?",
        answer: "A hospital indemnity plan pays you a fixed cash benefit when you’re hospitalized. It works alongside Medicare Advantage to help cover out-of-pocket costs."
    },
    {
        question: "Do Medicare Advantage plans cover hospital stays completely?",
        answer: "No, most Medicare Advantage plans have daily copays for inpatient hospital stays, which can add up quickly."
    },
    {
        question: "Is hospital indemnity insurance worth it?",
        answer: "It can be, especially if your Medicare Advantage plan has high hospital copays or if you're on a fixed income."
    }
];

export function HipForAdvantageContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Why Add Hospital Indemnity to Your Medicare Advantage Plan?"
          category="Insurance"
          date="July 22, 2025"
          intro="Protect yourself from surprise medical bills. Learn how hospital indemnity plans help cover the gaps in Medicare Advantage so you can stay financially secure."
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

            <h2 className="text-xl font-bold">What Is a Hospital Indemnity Plan?</h2>
            <p>A hospital indemnity plan is a type of supplemental insurance that pays you a fixed cash benefit when you're hospitalized or need certain types of care. Unlike traditional insurance, these plans pay you directly, regardless of what your Medicare Advantage plan pays.</p>
            
            <h2 className="text-xl font-bold">Why It Makes Sense with Medicare Advantage</h2>
            <p>Medicare Advantage (Part C) plans often come with out-of-pocket costs like:</p>
            <ul className="list-disc pl-6">
                <li>Daily copays for hospital stays (e.g., $300–$400/day for the first 4–7 days)</li>
                <li>High emergency room or skilled nursing facility costs</li>
                <li>Limited coverage for observation stays</li>
            </ul>
            <p>A hospital indemnity plan can offset these expenses by paying you cash—often $100 to $500 per day—depending on your plan.</p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                <strong>Real-World Example:</strong> Without indemnity, a 5-day hospital stay could cost $1,500+ in copays. With indemnity, your plan pays $200/day = $1,000 total benefit. That’s a major financial cushion.
            </blockquote>
            
            <h2 className="text-xl font-bold">Cost Comparison Table</h2>
            <Table>
              <TableCaption>Cost Comparison: Medicare Advantage Alone vs. With Indemnity Plan. *Assumes indemnity plan pays full eligible benefits. Costs and coverage vary by plan.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Coverage Feature</TableHead>
                  <TableHead className="text-center">MA Only</TableHead>
                  <TableHead className="text-center">With HIP Plan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Hospital Stay (5 days)</TableCell>
                  <TableCell className="text-center">$1,875 (e.g., $375/day)</TableCell>
                  <TableCell className="text-center">$1,875 − $1,750 benefit = $125</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Observation Stay (2 days)</TableCell>
                  <TableCell className="text-center">$500 (e.g., $250/day)</TableCell>
                  <TableCell className="text-center">$500 − $500 benefit = $0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Skilled Nursing (10 days)</TableCell>
                  <TableCell className="text-center">$2,000 (e.g., $200/day)</TableCell>
                  <TableCell className="text-center">$2,000 − $2,000 benefit = $0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ambulance Transport</TableCell>
                  <TableCell className="text-center">$325 per trip</TableCell>
                  <TableCell className="text-center">$325 − $325 benefit = $0</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>Cancer Treatment</TableCell>
                  <TableCell className="text-center">$750 copay</TableCell>
                  <TableCell className="text-center">$750 benefit = $0</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell className="font-bold">Total Out-of-Pocket</TableCell>
                  <TableCell className="text-center font-bold">$5,450+</TableCell>
                  <TableCell className="text-center font-bold">As little as $125*</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <h2 className="text-xl font-bold">What Do These Plans Typically Cover?</h2>
            <Table>
              <TableCaption>Coverage Features of Hospital Indemnity Plans</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Benefit Type</TableHead>
                  <TableHead className="text-center">Typically Covered?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Inpatient Hospital Stay</TableCell>
                  <TableCell className="text-center">Yes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Observation Stay</TableCell>
                  <TableCell className="text-center">Yes (on select plans)</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>Skilled Nursing Facility Care</TableCell>
                  <TableCell className="text-center">Yes (optional rider)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ambulance Transport</TableCell>
                  <TableCell className="text-center">Yes</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>ER or Urgent Care Visits</TableCell>
                  <TableCell className="text-center">Yes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cancer Treatment</TableCell>
                  <TableCell className="text-center">Yes (optional rider)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <h2 className="text-xl font-bold">Ideal for People Who:</h2>
            <ul className="list-disc pl-6">
                <li>Have Medicare Advantage plans with high daily copays</li>
                <li>Are on a fixed income</li>
                <li>Want to avoid dipping into savings during a hospital stay</li>
            </ul>

            <h2 className="text-xl font-bold">What to Look for in a Plan</h2>
             <ul className="list-disc pl-6">
                <li>Daily benefit amount (e.g. $250/day for up to 10 days)</li>
                <li>Waiting periods or exclusions</li>
                <li>Optional riders (e.g., skilled nursing, cancer, outpatient services)</li>
                <li>Guaranteed issue vs. medical underwriting</li>
            </ul>

            <FaqSection title="Frequently Asked Questions" items={faqItems} />

            <h2 className="text-xl font-bold">Conclusion</h2>
            <p>Hospital indemnity insurance offers peace of mind for people with Medicare Advantage. With rising out-of-pocket costs, this small policy can deliver big financial relief.</p>
            
            <Button asChild size="lg" className="my-8 px-6 py-3">
              <Link href="/quotes?tab=hospital-indemnity">Compare Hospital Indemnity Plans</Link>
            </Button>
        </div>

        <ActionButtons
            badges={[{ tag: "Medicare Advantage" }, { tag: "Hospital Indemnity" }]}
            likes={28}
            comments={3}
          shareUrl="/resources/hip-for-advantage"
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

