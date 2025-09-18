"use client";
import React from 'react';

interface TabDef { key: string; label: string; disabled?: boolean; }
interface DetailsTabsProps {
  active: string;
  onChange: (k:string)=>void;
  tabs: TabDef[];
}

export const DetailsTabs: React.FC<DetailsTabsProps> = ({ active, onChange, tabs }) => {
  return (
    <div className="flex gap-6 h-14 items-end">
      {tabs.map(t => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            disabled={t.disabled}
            onClick={() => !t.disabled && onChange(t.key)}
            className={`relative pb-3 pt-4 text-sm font-medium tracking-wide transition border-b-2 -mb-px
              ${t.disabled ? 'text-slate-500/40 border-transparent cursor-not-allowed' : isActive ? 'text-white border-blue-400' : 'text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-600'}`}
            aria-selected={isActive}
            role="tab"
          >{t.label}</button>
        );
      })}
    </div>
  );
};

export default DetailsTabs;
