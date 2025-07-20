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
    className="bg-white rounded-xl shadow-lg border border-gray-100 hover:border-blue-300 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-blue-600 transition p-6 flex flex-col items-center text-center"
  >
    <div className="mb-4 text-blue-600 dark:text-blue-500">{icon}</div>
    <span className="font-semibold text-base mb-1 text-gray-800 dark:text-neutral-200">{title}</span>
    <span className="text-sm text-gray-500 dark:text-neutral-400">{description}</span>
  </a>
);
