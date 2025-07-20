import React from "react";

interface ToolCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ href, icon, title, description }) => (
  <a
    href={href}
    className="bg-white rounded-xl shadow-lg border border-blue-100 hover:border-blue-300 transition p-8 flex flex-col items-center text-center"
  >
    <span className="mb-3 size-10 text-blue-600">{icon}</span>
    <span className="font-semibold text-lg mb-1">{title}</span>
    <span className="text-sm text-gray-500">{description}</span>
  </a>
);
