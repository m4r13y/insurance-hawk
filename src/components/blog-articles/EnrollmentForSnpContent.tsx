
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function EnrollmentForSnpContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Enrollment for SNP"
          category="Medicare"
          date="July 22, 2025"
          intro="When and how to enroll in Special Needs Plans."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
                This is a placeholder for the Enrollment for SNP article. The content will be filled in later.
            </p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "SNP" }]}
            likes={0}
            comments={0}
          shareUrl="/resources/enrollment-for-snp"
        />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Enrollment Periods Explained", imageUrl: "https://placehold.co/320x320.png", href: "/resources/enrollment-periods" },
          { title: "How to Choose the Right Medicare Advantage Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/compare-advantage-plans" }
        ]}
      />
    </div>
  );
}

