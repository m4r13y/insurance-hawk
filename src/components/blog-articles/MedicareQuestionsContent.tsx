
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';

export function MedicareQuestionsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="50 Most Asked Medicare Questions Answered (2025 Update)"
          category="Medicare"
          date="July 23, 2025"
          intro="Got Medicare questions? You’re not alone. We have the answers to the top questions people have about Medicare in 2025!"
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          
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

          <section>
            <h2 className="text-xl font-bold">Medicare Basics</h2>
            <ol className="list-decimal pl-6 space-y-4">
              <li><strong>What is Medicare?</strong><p>Medicare is a federal health insurance program for people 65 and older and some younger people with disabilities or certain conditions.</p></li>
              <li><strong>Who can get Medicare?</strong><p>Most people qualify at age 65. Some younger people qualify if they have a disability, ALS, or end-stage renal disease.</p></li>
              <li><strong>What are the parts of Medicare?</strong><p>Medicare has four parts: Part A (Hospital insurance), Part B (Medical insurance), Part C (Medicare Advantage), and Part D (Prescription drug coverage).</p></li>
              <li><strong>Is Medicare free?</strong><p>No. Many people pay no premium for Part A, but most pay a premium for Part B and Part D.</p></li>
              <li><strong>What does Medicare cover?</strong><p>Medicare covers hospital stays, doctor visits, preventive care, some medical equipment, and prescription drugs (if you have Part D).</p></li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold">Signing Up & Eligibility</h2>
            <ol className="list-decimal pl-6 space-y-4" start={6}>
              <li><strong>When do I sign up for Medicare?</strong><p>You can sign up during your Initial Enrollment Period, which starts three months before you turn 65 and ends three months after.</p></li>
              <li><strong>What if I miss my Initial Enrollment Period?</strong><p>You may have to pay a late enrollment penalty and wait until the General Enrollment Period (Jan 1–Mar 31 each year).</p></li>
              <li><strong>Can I delay Medicare if I’m still working?</strong><p>Yes, if you have employer coverage. Sign up for Medicare before employer coverage ends to avoid penalties.</p></li>
              <li><strong>How do I sign up?</strong><p>Go to SSA.gov or call Social Security.</p></li>
              <li><strong>Can non-citizens get Medicare?</strong><p>Some lawful permanent residents can get Medicare if they meet residency and work requirements.</p></li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold">Coverage & Costs</h2>
            <p>Here’s a quick chart for common costs. Part A premium may be up to $518 if you haven’t paid enough Medicare taxes.</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coverage Type</TableHead>
                  <TableHead>Monthly Premium (2025)</TableHead>
                  <TableHead>Deductible</TableHead>
                  <TableHead>Key Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Part A (most people)</TableCell>
                  <TableCell>$0</TableCell>
                  <TableCell>$1,676 per benefit period</TableCell>
                  <TableCell>Hospital insurance</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Part B (standard)</TableCell>
                  <TableCell>$185</TableCell>
                  <TableCell>$240 annual</TableCell>
                  <TableCell>Medical insurance</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Part D (varies by plan)</TableCell>
                  <TableCell>Varies</TableCell>
                  <TableCell>Varies</TableCell>
                  <TableCell>Prescription drugs</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Medigap (varies by plan)</TableCell>
                  <TableCell>Varies</TableCell>
                  <TableCell>Varies</TableCell>
                  <TableCell>Fills gaps in Original Medicare</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section>
            <h2 className="text-xl font-bold">Prescription Drug Coverage</h2>
            <ol className="list-decimal pl-6 space-y-4" start={16}>
                <li><strong>Do I have to get Part D?</strong><p>No, but if you skip it and enroll later, you might pay a penalty.</p></li>
                <li><strong>Can I get help paying for drugs?</strong><p>Yes, Extra Help is available for those with limited income.</p></li>
                <li><strong>How much will I pay for drugs in 2025?</strong><p>Your out-of-pocket drug costs are capped at $2,000 for the year. Once you reach that, you don’t pay more for covered drugs the rest of the year.</p></li>
                <li><strong>Does every drug plan cover all my medications?</strong><p>No, check your plan’s formulary (list of covered drugs).</p></li>
                <li><strong>Can I change drug plans?</strong><p>Yes, you can switch plans during the Open Enrollment Period (Oct 15–Dec 7).</p></li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold">Medicare Advantage & Medigap</h2>
            <p>Which is best? It depends on your needs. Here’s a chart comparing popular Medigap plans:</p>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Benefit</TableHead>
                        <TableHead>Plan G</TableHead>
                        <TableHead>Plan N</TableHead>
                        <TableHead>Plan A</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow><TableCell>Part A coinsurance</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell></TableRow>
                    <TableRow><TableCell>Part B coinsurance</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-green-600 font-bold">Yes*</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell></TableRow>
                    <TableRow><TableCell>Part A deductible</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-red-600 font-bold">No</TableCell></TableRow>
                    <TableRow><TableCell>Skilled nursing coinsurance</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-red-600 font-bold">No</TableCell></TableRow>
                    <TableRow><TableCell>Foreign travel emergency</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-green-600 font-bold">Yes</TableCell><TableCell className="text-red-600 font-bold">No</TableCell></TableRow>
                </TableBody>
            </Table>
            <p className="text-sm italic">*Plan N may require a copay for some office or ER visits.</p>
          </section>
          
          <section>
              <h2 className="text-xl font-bold">The Bottom Line</h2>
              <p>Medicare can be confusing, but you’re not alone. These 50 answers give you a strong start to make smart choices in 2025. Need help comparing your options or enrolling? You can use the official Medicare Plan Finder or connect with a local Medicare advisor.</p>
              <Button size="lg" className="my-8 px-6 py-3">Schedule Your Medicare Review</Button>
          </section>

        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "FAQ" }, { tag: "2025 Updates" }]}
            likes={78}
            comments={15}
          shareUrl="/resources/medicare-questions"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[]}
      />
    </div>
  );
}

