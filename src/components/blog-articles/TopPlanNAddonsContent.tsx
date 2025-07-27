
import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

export function TopPlanNAddonsContent() {
  return (
    <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-12">
      <BlogContent>
        <BlogHeader
          title="Top Plan N Add-ons"
          category="Medicare"
          date="July 22, 2025"
          intro="See what people frequently pair with their Plan N."
          breadcrumbLabel="Resources"
        />
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
                This is a placeholder for the Top Plan N Add-ons article. The content will be filled in later.
            </p>
        </div>
        <ActionButtons
            badges={[{ tag: "Medicare" }, { tag: "Plan N" }]}
            likes={0}
            comments={0}
          />
      </BlogContent>
      <BlogSidebar
        author={{ name: "Jonathan Hawkins", avatarUrl: "https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77", bio: "CFP | Medicare Specialist" }}
        mediaLinks={[
          { title: "Medigap Rate Increases", imageUrl: "https://placehold.co/320x320.png", href: "/resources/medigap-rate-increases" },
          { title: "Cancer Insurance with a Medicare Supplement Plan", imageUrl: "https://placehold.co/320x320.png", href: "/resources/cancer-plans-with-medigap" }
        ]}
      />
    </div>
  );
}
