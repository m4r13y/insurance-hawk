import React from "react";

interface BlogHeaderProps {
  title: string;
  subtitle?: string;
  category: string;
  date: string;
  intro: string;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({
  title,
  subtitle,
  category,
  date,
  intro,
}) => (
  <div className="mb-8 pb-6 border-b border-gray-200 dark:border-neutral-700">
    <a className="inline-flex items-center gap-x-1.5 text-sm text-gray-600 decoration-2 hover:underline focus:outline-hidden focus:underline dark:text-blue-500" href="#">
      <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to Blog
    </a>
    <h1 className="text-3xl font-bold lg:text-5xl dark:text-white mt-4 mb-2">{title}</h1>
    {subtitle && <h2 className="text-xl font-semibold mb-2">{subtitle}</h2>}
    <div className="flex items-center gap-x-5 mb-2">
      <a className="inline-flex items-center gap-1.5 py-1 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800" href="#">{category}</a>
      <p className="text-xs sm:text-sm text-gray-800 dark:text-neutral-200">{date}</p>
    </div>
    <p className="text-lg text-gray-800 dark:text-neutral-200">{intro}</p>
  </div>
);
