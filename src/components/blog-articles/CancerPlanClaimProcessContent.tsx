
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function CancerPlanClaimProcessContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Cancer Plan Claim Process"
          category="Insurance"
          date="July 22, 2025"
          intro="Understand how claims work with Cancer Insurance."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
                This is a placeholder for the Cancer Plan Claim Process article. The content will be filled in later.
            </p>
        </div>
        <ActionButtons
            badges={[{ tag: "Insurance" }, { tag: "Cancer" }]}
            likes={0}
            comments={0}
          />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Cancer Insurance with a Medicare Supplement Plan", imageUrl: "https://placehold.co/320x320.png", href: "/dashboard/resources/cancer-plans-with-medigap" },
          { title: "Why Medicare Isn’t Enough for Cancer Costs in 2025", imageUrl: "https://placehold.co/320x320.png", href: "/dashboard/resources/cancer-statistics" },
          { title: "Reimbursement vs Diagnosis", imageUrl: "https://placehold.co/320x320.png", href: "/dashboard/resources/reimbursement-vs-diagnosis" }
        ]}
      />
    </div>
  );
}
