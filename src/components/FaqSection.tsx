import React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
}

const FAQIcon = () => (
    <svg className="shrink-0 mt-1 size-6 text-gray-500 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
);

export function FaqSection({ title, items }: FAQSectionProps) {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      {/* Title */}
      <div className="max-w-2xl mx-auto mb-10 lg:mb-14">
        <h2 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">{title}</h2>
      </div>
      {/* End Title */}

      <div className="max-w-2xl mx-auto divide-y divide-gray-200 dark:divide-neutral-700">
        {items.map((item, index) => (
            <div key={index} className="py-8 first:pt-0 last:pb-0">
            <div className="flex gap-x-5">
              <FAQIcon />
              <div className="grow">
                <h3 className="md:text-lg font-semibold text-gray-800 dark:text-neutral-200">
                  {item.question}
                </h3>
                <p className="mt-1 text-gray-500 dark:text-neutral-500">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
