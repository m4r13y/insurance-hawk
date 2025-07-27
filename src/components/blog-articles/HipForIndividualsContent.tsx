
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function HipForIndividualsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="HIP for Individuals"
          category="Insurance"
          date="July 22, 2025"
          intro="Why individuals need a Hospital Indemnity."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
                This is a placeholder for the HIP for Individuals article. The content will be filled in later.
            </p>
        </div>
        <ActionButtons
            badges={[{ tag: "Insurance" }, { tag: "HIP" }]}
            likes={0}
            comments={0}
          />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Benefits of HIP Plans", imageUrl: "https://placehold.co/320x320.png", href: "/resources/benefits-of-hip-plans" },
          { title: "Designing Hospital Indemnity Plans", imageUrl: "https://placehold.co/320x320.png", href: "/resources/designing-hip-plans" }
        ]}
      />
    </div>
  );
}
