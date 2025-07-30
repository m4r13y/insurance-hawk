
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function ComparePdpPlansContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Compare PDP Plans"
          category="Medicare"
          date="July 22, 2025"
          intro="What to look for when shopping Prescription Drug Plans."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
                This is a placeholder for the Compare PDP Plans article. The content will be filled in later.
            </p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "PDP" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/compare-pdp-plans"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "How Medicare Drug Plans Work", imageUrl: "https://placehold.co/320x320.png", href: "/resources/drug-plans-explained" },
          { title: "PDP Pros & Cons", imageUrl: "https://placehold.co/320x320.png", href: "/resources/pdp-pros-cons" },
          { title: "Avoiding Late Enrollment Penalties", imageUrl: "https://placehold.co/320x320.png", href: "/resources/avoiding-penalties" }
        ]}
      />
    </div>
  );
}

