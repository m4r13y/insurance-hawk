
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
        question: "What happens if I miss my Initial Enrollment Period?",
        answer: "You could face late enrollment penalties for Part B or Part D, and you may have to wait until the next General Enrollment Period to sign up."
    },
    {
        question: "Can I get a Medigap plan any time?",
        answer: "Yes, but after your first 6 months on Part B, you might have to answer health questions and could be turned down or charged more."
    },
    {
        question: "How often can I change my Medicare Advantage plan?",
        answer: "You can make changes once a year during AEP or once during OEP if you’re already in a MAPD plan."
    },
    {
        question: "When can I join, drop, or switch a Part D drug plan?",
        answer: "You can do this during IEP, AEP, or if you qualify for a Special Enrollment Period."
    },
    {
        question: "Can I change from Medicare Advantage back to Original Medicare?",
        answer: "Yes, during AEP or OEP, or if you qualify for a Special Enrollment Period."
    },
    {
        question: "What is a Special Enrollment Period?",
        answer: "This is a window for certain life events, like moving, losing other coverage, or qualifying for Medicaid."
    }
];

export function EnrollmentPeriodsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Medicare Enrollment Periods Explained: What You Need to Know for 2025"
          category="Medicare"
          date="July 22, 2025"
          intro="Find out how and when you can enroll in Medicare, switch plans, and avoid late penalties. Get the details on IEP, OEP, AEP, and Medigap, plus what matters for Medicare Advantage and drug plans."
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

            <h2 className="text-xl font-bold">Understanding Medicare Enrollment Periods</h2>
            <p>Medicare has set times during the year when you can enroll, make changes, or add coverage. Missing a window can lead to penalties or delayed coverage, so it helps to know each period and what you can do.</p>
            
            <h3 className="text-lg font-semibold">1. Initial Enrollment Period (IEP)</h3>
            <p>The Initial Enrollment Period is your first chance to sign up for Medicare. It’s a 7-month window that starts three months before the month you turn 65, includes your birthday month, and ends three months after. During this time, you can:</p>
            <ul className="list-disc pl-6">
                <li>Enroll in Medicare Part A (hospital) and/or Part B (medical)</li>
                <li>Join a Medicare Advantage plan (MAPD)</li>
                <li>Sign up for a Part D prescription drug plan (PDP)</li>
            </ul>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                Missing your IEP can mean late enrollment penalties or gaps in coverage.
            </blockquote>
            
            <h3 className="text-lg font-semibold">2. Annual Enrollment Period (AEP)</h3>
            <p>The Annual Enrollment Period runs every year from October 15 to December 7. This is the main time to make changes if you’re already on Medicare. During AEP, you can:</p>
            <ul className="list-disc pl-6">
                <li>Switch from Original Medicare to Medicare Advantage</li>
                <li>Go back to Original Medicare</li>
                <li>Join, drop, or switch a Part D drug plan</li>
                <li>Change from one Medicare Advantage plan to another</li>
            </ul>
            <p>Your changes take effect January 1 of the next year.</p>

            <h3 className="text-lg font-semibold">3. Medicare Advantage Open Enrollment Period (OEP)</h3>
            <p>OEP is from January 1 to March 31. This is only for people already enrolled in a Medicare Advantage plan. During OEP, you can:</p>
            <ul className="list-disc pl-6">
                <li>Switch to another Medicare Advantage plan</li>
                <li>Drop your Medicare Advantage plan and return to Original Medicare (with the option to join a Part D drug plan)</li>
            </ul>
             <p>You can only make one change during OEP. This period doesn’t apply if you only have Original Medicare.</p>

             <figure className="my-8">
              <Image 
                className="w-full object-cover rounded-xl" 
                src="https://placehold.co/800x400.png" 
                alt="A calendar highlighting important Medicare enrollment dates."
                width={800}
                height={400}
                data-ai-hint="calendar planning"
              />
              <figcaption className="mt-2 text-sm text-center text-gray-500">
                Marking your calendar for these key periods is essential to avoid penalties.
              </figcaption>
            </figure>
            
            <h2 className="text-xl font-bold">Medigap Enrollment: Anytime, but Underwriting Matters</h2>
            <p>Medigap (Medicare Supplement) plans can help pay costs that Original Medicare doesn’t cover. Unlike MAPD or PDP plans, you can apply for a Medigap plan any time of year. But after your initial Medigap Open Enrollment (a 6-month window after you first get Part B), insurance companies can use medical underwriting. This means you could be denied coverage or pay higher premiums based on your health history.</p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                Key tip: To get a Medigap plan without health questions, sign up during your Medigap Open Enrollment window.
            </blockquote>
            
            <h2 className="text-xl font-bold">Comparison Table: Enrollment Periods</h2>
            <div className="overflow-x-auto my-6">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 font-semibold">Enrollment Period</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 font-semibold">Who Can Use It</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 font-semibold">What You Can Do</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 font-semibold">When It Happens</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">IEP</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">New to Medicare</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Enroll in Part A, B, MAPD, PDP</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">7 months around 65th birthday</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">AEP</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Anyone on Medicare</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Switch/drop MAPD or PDP plans</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Oct 15 – Dec 7 each year</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">OEP</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">MAPD members</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Switch/drop MAPD, go to Original Medicare</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Jan 1 – Mar 31 each year</td>
                  </tr>
                   <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Medigap OEP</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">New to Part B</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Enroll in Medigap, no health questions</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">6 months after Part B starts</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FaqSection title="Frequently Asked Questions" items={faqItems} />

            <h2 className="text-xl font-bold">The Bottom Line</h2>
            <p>
                Medicare enrollment windows can be confusing, but getting familiar with the key dates can save you money and stress. If you need help sorting out your options or have questions about the right plan for you, our team can guide you—just reach out for a free consultation.
            </p>
            
            <Button size="lg" className="my-8 px-6 py-3">
              Schedule Your Medicare Review
            </Button>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Enrollment" }]}
            likes={18}
            comments={5}
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
