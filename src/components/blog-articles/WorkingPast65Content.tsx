
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/FaqSection";
import Image from "next/image";
import Link from 'next/link';

export function WorkingPast65Content() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      {/* Content */}
      <BlogContent>
        {/* Header */}
        <BlogHeader
          title="Working Past 65: A Guide to Medicare"
          category="Medicare"
          date="July 22, 2025"
          intro="Working past age 65 is becoming more common. But what does that mean for your Medicare enrollment? This guide will walk you through your options."
          breadcrumbLabel="Resources"
        />
        
        {/* Generic Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <figure className="my-8">
              <Image 
                className="w-full object-cover rounded-xl" 
                src="https://placehold.co/800x400.png" 
                alt="A placeholder image for the article."
                width={800}
                height={400}
                data-ai-hint="planning guide"
              />
              <figcaption className="mt-2 text-sm text-center text-gray-500">
                A descriptive caption for the image goes here.
              </figcaption>
            </figure>

            <p>
                This is an introductory paragraph. It sets the stage for the rest of the article and tells the reader what to expect. It should be engaging and clear.
            </p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                Use blockquotes for powerful testimonials, examples, or key takeaways that you want to stand out from the main text.
            </blockquote>
            
            <h2 className="text-xl font-bold">Use H2 Headings for Main Sections</h2>
            <p>
                Organize your content into logical sections using H2 headings. This improves readability and helps search engines understand the structure of your content.
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li>Use bulleted lists for unordered items.</li>
                <li>They are great for highlighting key points or features.</li>
                <li>Each point should be concise and easy to understand.</li>
            </ul>

            <h2 className="text-xl font-bold">Another Section for More Details</h2>
            <p>
                Use ordered lists for step-by-step instructions or processes. Don't forget to include <Link href="/dashboard/resources/avoiding-penalties">internal links</Link> to other relevant articles on your site. This helps with SEO and user navigation.
            </p>
            <ol className="list-decimal pl-6 space-y-2">
                <li>First step in a process.</li>
                <li>Second step, building on the first.</li>
                <li>The final step to complete the action.</li>
            </ol>
            
            <FaqSection 
              title="Frequently Asked Questions" 
              items={[
                {
                  question: "This is a placeholder question?",
                  answer: "This is a placeholder answer. Fill this section with common questions related to the article's topic to capture long-tail keywords and be eligible for FAQ rich snippets."
                },
                 {
                  question: "How many questions should I include?",
                  answer: "A good range is typically 3-5 questions. This provides value without overwhelming the reader."
                },
              ]}
            />
            
            <h2 className="text-xl font-bold">Conclusion and Next Steps</h2>
            <p>
                End your article with a strong conclusion that summarizes the key points and provides a clear next step for the reader.
            </p>
            <Button size="lg" className="my-8 px-6 py-3">
              This is the Call to Action
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
          />
      </BlogContent>

      {/* Sidebar */}
      <BlogSidebar
        author={{
          name: "Jonathan Hawkins",
          avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77",
          bio: "CFP | Medicare Specialist",
        }}
        mediaLinks={[
          {
            title: "5 Reasons to Not start a UX Designer Career in 2022/2023",
            imageUrl: "https://images.unsplash.com/photo-1567016526105-22da7c13161a?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=80",
            href: "#",
          },
          {
            title: "If your UX Portfolio has this 20% Well Done, it Will Give You an 80% Result",
            imageUrl: "https://images.unsplash.com/photo-1542125387-c71274d94f0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=80",
            href: "#",
          },
          {
            title: "7 Principles of Icon Design",
            imageUrl: "https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=80",
            href: "#",
          },
        ]}
      />
    </div>
  );
}
