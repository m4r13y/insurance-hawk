import React from "react";

interface BlogContentProps {
  children: React.ReactNode;
}

export const BlogContent: React.FC<BlogContentProps> = ({ children }) => (
  <div className="lg:col-span-2">
    <div className="py-12 lg:pe-12">
      <div className="space-y-8">
        {children}
      </div>
    </div>
  </div>
);
