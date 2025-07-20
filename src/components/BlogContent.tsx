import React from "react";

interface BlogContentProps {
  children: React.ReactNode;
}

export const BlogContent: React.FC<BlogContentProps> = ({ children }) => (
  <div className="lg:col-span-2">
    <div className="py-8 lg:pe-4 xl:pe-12">
      <div className="space-y-8">
        {children}
      </div>
    </div>
  </div>
);
