
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
        question: "Do I have to enroll in Medicare at 65 if I’m still working?",
        answer: "If your employer has 20 or more employees and your group health coverage is considered creditable, you can usually wait to sign up for Part B and Part D. Always check with your benefits office first."
    },
    {
        question: "What if my employer has fewer than 20 employees?",
        answer: "Medicare usually pays first, so you need to sign up for Part A and Part B when you turn 65. Delaying can lead to late penalties and coverage gaps."
    },
    {
        question: "Can I keep contributing to my HSA after enrolling in Medicare?",
        answer: "No, once you enroll in any part of Medicare, you can’t contribute new money to your HSA, though you can use existing funds for eligible expenses."
    },
    {
        question: "What is the Medicare Special Enrollment Period?",
        answer: "This is an 8-month window after your group health coverage ends that lets you enroll in Part B and Part D without paying a late penalty."
    },
    {
        question: "What paperwork do I need to avoid penalties?",
        answer: "You’ll need a completed CMS-L564 form from your employer to show you had creditable coverage. Social Security needs this when you sign up for Medicare after 65."
    },
    {
        question: "What if I wait too long to sign up for Medicare?",
        answer: "Delaying Medicare without creditable coverage means you may have to pay higher premiums for life and your coverage could be delayed."
    }
];

export function WorkingPast65Content() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="How to Handle Medicare If You’re Working After 65"
          category="Medicare"
          date="July 22, 2025"
          intro="Not ready to retire? Here’s what to know about Medicare and your job-based health coverage. Find out what steps to take, what to watch out for, and how to avoid late penalties."
          breadcrumbLabel="Resources"
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            
             <div className="relative my-8" style={{paddingTop: "56.25%"}}>
                <iframe 
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="YouTube video player for Working Past 65 with Medicare" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>

            <p>
                Turning 65 is a big deal for Medicare, but you might not need to rush your enrollment if you’re still working. The right choice depends on the kind of health insurance you get through your job or your spouse’s job. Some people can wait to sign up for certain parts of Medicare, but others need to act fast to avoid expensive late penalties.
            </p>
            
            <h2 className="text-xl font-bold">Medicare Enrollment Rules at a Glance</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse my-6">
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-left font-semibold">Situation</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Need to Enroll?</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Who Pays First?</th>
                    <th className="border border-gray-200 dark:border-neutral-700 p-3 text-center font-semibold">Penalty Risk?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Employer has 20+ employees</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Part A optional<br/>Part B & D can be delayed</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Employer Plan</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">No, if you use SEP</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Employer has &lt; 20 employees</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Yes, Part A & B</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Medicare</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Yes, if you miss IEP</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Contributing to an HSA</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Delay all parts of Medicare</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">N/A</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Yes, if you enroll</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3">Retiree or COBRA coverage</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Yes, Part A & B</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Medicare</td>
                    <td className="border border-gray-200 dark:border-neutral-700 p-3 text-center">Yes, if you miss IEP</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h2 className="text-xl font-bold">Should You Sign Up for Medicare at 65?</h2>
            <p>Your best move depends mostly on the size of your employer. If you work for a company with <strong>20 or more employees</strong>, your group health insurance can usually remain your main coverage. In this case, you are allowed to delay Medicare Part B (doctor and outpatient coverage) and Part D (prescription drug coverage) with no penalty, as long as you stay covered by your job’s plan. Most people in this situation still sign up for Part A (hospital insurance) at 65, since it’s free if you’ve paid Medicare taxes long enough.</p>
            
            <figure className="my-8">
              <Image 
                className="w-full object-cover rounded-xl" 
                src="https://placehold.co/800x400.png" 
                alt="A person reviewing their insurance options while working at a desk."
                width={800}
                height={400}
                data-ai-hint="planning desk"
              />
              <figcaption className="mt-2 text-sm text-center text-gray-500">
                Coordinating employer coverage with Medicare is key to avoiding penalties.
              </figcaption>
            </figure>
            
            <p>For people working at a small business with <strong>fewer than 20 employees</strong>, Medicare usually becomes your main insurance at 65. You need to sign up for both Part A and Part B right away when you turn 65. If you don’t, you could face unpaid medical bills and permanent late penalties.</p>
            
            <h2 className="text-xl font-bold">Medicare and Health Savings Accounts (HSAs)</h2>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                Enrolling in any part of Medicare, including just Part A, means you can no longer contribute new money to your HSA.
            </blockquote>
            <p>If you plan to keep your HSA active, you must delay all parts of Medicare. You can still use the money in your HSA for qualified expenses, but you should time your switch carefully to avoid tax issues.</p>
            
            <h2 className="text-xl font-bold">How to Avoid Late Enrollment Penalties</h2>
            <p>Missing Medicare deadlines is a costly mistake. If you don’t have creditable job-based coverage and you delay signing up for Part B or Part D, Medicare will add a late penalty to your monthly premium for as long as you have that coverage. To avoid this, use the <strong>Special Enrollment Period (SEP)</strong>. This gives you up to eight months to sign up for Part B (and up to two months for Part D) after you stop working or lose your group health coverage. Don’t wait until the last minute—getting your paperwork in order early can help you avoid coverage gaps or delays. Learn more in our <Link href="/resources/avoiding-penalties">Guide to Avoiding Penalties</Link>.</p>
            
            <FaqSection 
              title="Frequently Asked Questions" 
              items={faqItems}
            />
            
            <h2 className="text-xl font-bold">Your Action Plan</h2>
            <ol className="list-decimal pl-6 space-y-2">
                <li>As you approach 65, talk to your HR or benefits manager about how your health plan works with Medicare.</li>
                <li>Confirm if your employer coverage is "creditable" for Part B and Part D.</li>
                <li>Collect written proof of your group coverage when you retire or lose your job. You’ll need this to show Social Security and avoid penalties.</li>
                <li>If you have an HSA, decide when you will stop contributing and coordinate your Medicare enrollment accordingly.</li>
            </ol>
            
            <h2 className="text-xl font-bold">Need Help?</h2>
            <p>
                Medicare rules can get tricky, especially when it comes to how job-based insurance fits in. If you’re not sure what to do, start by talking to your benefits manager at work. You can also reach out to your local State Health Insurance Assistance Program (SHIP) or call Medicare directly. Double-check the rules before making any big changes to your insurance.
            </p>
            
            <Button size="lg" className="my-8 px-6 py-3">
              Schedule a Free Medicare Review
            </Button>
        </div>

        <ActionButtons
            badges={[
              { tag: "Plan" },
              { tag: "Medicare" },
              { tag: "Employment" },
            ]}
            likes={120}
            comments={12}
          shareUrl="/resources/working-past-65"
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

