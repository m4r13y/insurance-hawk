import React from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogSidebar } from "@/components/BlogSidebar";
import { BlogContent } from "@/components/BlogContent";
import { ActionButtons } from "@/components/ActionButtons";

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
        />
        
        {/* Generic Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
                Deciding when to enroll in Medicare can be tricky, especially if you have employer health coverage. This guide will help you understand your choices and avoid common pitfalls.
            </p>
            <h2 className="text-xl font-bold my-4">Key Considerations</h2>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. 
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li>Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.</li>
                <li>Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim.</li>
                <li>Pellentesque congue. Ut in risus volutpat libero pharetra tempor.</li>
            </ul>
            <h2 className="text-xl font-bold my-4">Conclusion</h2>
            <p>
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum.
            </p>
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
