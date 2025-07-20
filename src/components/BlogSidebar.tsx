import React from "react";

interface SidebarProps {
  author: {
    name: string;
    avatarUrl: string;
    bio: string;
  };
  mediaLinks: Array<{
    title: string;
    imageUrl: string;
    href: string;
  }>;
}

export const BlogSidebar: React.FC<SidebarProps> = ({ author, mediaLinks }) => (
  <div className="lg:col-span-1 lg:w-full lg:h-full bg-gradient-to-r from-gray-50 via-transparent to-transparent dark:from-neutral-800">
    <div className="sticky top-0 start-0 py-16 lg:ps-8">
      {/* Avatar Media */}
      <div className="group flex items-center gap-x-3 border-b border-gray-200 pb-8 mb-8 dark:border-neutral-700">
        <a className="block shrink-0 focus:outline-hidden" href="#">
          <img className="size-10 rounded-full" src={author.avatarUrl} alt="Avatar" />
        </a>
        <a className="group grow block focus:outline-hidden" href="">
          <h5 className="group-hover:text-gray-600 group-focus:text-gray-600 text-base font-semibold text-gray-800 dark:group-hover:text-neutral-400 dark:group-focus:text-neutral-400 dark:text-neutral-200">
            {author.name}
          </h5>
          <p className="text-base text-gray-500 dark:text-neutral-500">
            {author.bio}
          </p>
        </a>
        <div className="grow">
          <div className="flex justify-end">
            <button type="button" className="py-1.5 px-2.5 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              Follow
            </button>
          </div>
        </div>
      </div>
      {/* End Avatar Media */}
      <div className="space-y-6">
        {mediaLinks.map((media, idx) => (
          <a key={idx} className="group flex items-center gap-x-6 focus:outline-hidden" href={media.href}>
            <div className="grow">
              <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 group-focus:text-blue-600 dark:text-neutral-200 dark:group-hover:text-blue-500 dark:group-focus:text-blue-500">
                {media.title}
              </span>
            </div>
            <div className="shrink-0 relative rounded-lg overflow-hidden size-20">
              <img className="size-full absolute top-0 start-0 object-cover rounded-lg" src={media.imageUrl} alt="Blog Image" />
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);
