"use client";
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
}

const primaryNavSeed: NavItem[] = [
  { label: 'Overview', active: true },
  { label: 'Quotes' },
  { label: 'Plan Builder' },
  { label: 'Compare' },
  { label: 'Saved' },
];

const filters: NavItem[] = [
  { label: 'All Carriers', active: true },
  { label: 'Preferred' },
  { label: 'Low Premium' },
  { label: 'High Coverage' },
];

// Simple icon placeholder box
const IconBox: React.FC<{active?: boolean}> = ({active}) => (
  <div className={`w-5 h-5 rounded-sm border flex items-center justify-center text-[10px] font-medium ${active ? 'bg-blue-primary text-white border-blue-400' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>i</div>
);

interface SidebarShowcaseProps {
  onPanelStateChange?: (open: boolean) => void;
  externalCloseSignal?: number; // increment to force close from parent
}

export const SidebarShowcase: React.FC<SidebarShowcaseProps> = ({ onPanelStateChange, externalCloseSignal }) => {
  // State: active detail tab, active nav item
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [activeNav, setActiveNav] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopSidebar.activeNav') || 'Overview';
    }
    return 'Overview';
  });
  const tabPanelId = React.useId();
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const lastFocusedTriggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Persist active nav
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopSidebar.activeNav', activeNav);
    }
  }, [activeNav]);

  // Close on ESC
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTab) {
        setActiveTab(null);
        // Restore focus to last trigger
        queueMicrotask(() => lastFocusedTriggerRef.current?.focus());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab]);

  // When panel opens, move focus to first focusable (close button)
  React.useEffect(() => {
    if (activeTab && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [activeTab]);

  const tabs = [
    {
      id: 'nav',
      label: 'Navigation',
      content: (
        <div className="space-y-1">
          {primaryNavSeed.map(item => {
            const isActive = activeNav === item.label;
            return (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                ${isActive ? 'bg-blue-primary text-white shadow-sm ring-1 ring-blue-300/40' : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'}`}
            >
              <IconBox active={isActive} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <Badge className="bg-white/20 text-white h-5 px-2">·</Badge>}
            </button>
          )})}
        </div>
      )
    },
    {
      id: 'filters',
      label: 'Filters',
      content: (
        <>
          <div className="grid grid-cols-2 gap-2">
            {filters.map(f => (
              <button
                key={f.label}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                  ${f.active ? 'bg-blue-primary text-white border-blue-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600/60'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700/60 backdrop-blur-sm">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Tune filters to surface preferred carriers faster.</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="h-8 text-xs flex-1 border-slate-300 dark:border-slate-600/70 hover:bg-slate-100 dark:hover:bg-slate-700/60">Reset</Button>
            <Button size="sm" className="h-8 text-xs flex-1 btn-brand">Apply</Button>
          </div>
        </>
      )
    }
  ];

  const toggleTab = (id: string, trigger?: HTMLButtonElement | null) => setActiveTab(cur => {
    if (trigger) lastFocusedTriggerRef.current = trigger;
    return cur === id ? null : id;
  });

  // Notify parent when open state changes
  React.useEffect(() => {
    onPanelStateChange?.(!!activeTab);
  }, [activeTab, onPanelStateChange]);

  // Listen for external close signals
  React.useEffect(() => {
    if (externalCloseSignal != null) {
      setActiveTab(null);
    }
  }, [externalCloseSignal]);

  return (
  <div className="flex gap-4 mt-2 lg:mt-2">
      {/* Compact Rail (unchanged baseline) */}
      <div className="flex flex-col w-52 rounded-xl border bg-white/70 dark:bg-slate-800/60 backdrop-blur p-3 gap-2 shadow-sm relative">
        <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-1.5">Workspace</h3>
        {primaryNavSeed.map(item => {
          const isActive = activeNav === item.label;
          return (
            <button
              key={item.label}
              ref={el => { if (isActive) lastFocusedTriggerRef.current = el; }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                ${isActive ? 'bg-blue-primary text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'}`}
              onClick={(e) => { setActiveNav(item.label); toggleTab('nav', e.currentTarget); }}
              aria-controls={tabPanelId}
              aria-expanded={activeTab === 'nav'}
              role="tab"
              aria-current={isActive ? 'page' : undefined}
            >
              <IconBox active={isActive} />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <Badge className="bg-white/20 text-white h-5 px-2">·</Badge>}
            </button>
          );
        })}
        <Separator className="my-1" />
        <div className="flex gap-2 px-1.5">
          <Button
            size="sm"
            variant={activeTab === 'filters' ? 'default' : 'outline'}
            className={`h-8 text-xs flex-1 ${activeTab === 'filters' ? 'btn-brand shadow-sm' : 'border-slate-300 dark:border-slate-600/70'}`}
            onClick={(e) => toggleTab('filters', e.currentTarget)}
            aria-controls={tabPanelId}
            aria-expanded={activeTab === 'filters'}
            role="tab"
          >
            Filters
          </Button>
          <Button size="sm" className="h-8 text-xs flex-1 btn-brand">New Quote</Button>
        </div>

        {/* Collapsible Tab Panel (slides out) */}
        <div
          id={tabPanelId}
          role="tabpanel"
          aria-hidden={activeTab == null}
          className={`absolute top-0 left-full ml-3 w-72 sm:w-80 transition-all duration-300 ${activeTab ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-2'} z-10`}
        >
          <div ref={panelRef} className="rounded-2xl border bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 shadow-md relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_18%,hsl(var(--blue-primary)/0.15),transparent_60%)]" />
            <div className="relative">
              <div className="flex gap-2 mb-4" role="tablist" aria-label="Sidebar detail tabs">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={activeTab === t.id}
                    onClick={() => toggleTab(t.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                      ${activeTab === t.id ? 'bg-blue-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-600/60 text-slate-700 dark:text-slate-200'}`}
                  >
                    {t.label}
                  </button>
                ))}
                <div className="ml-auto">
                  <button
                    ref={closeButtonRef}
                    onClick={() => { setActiveTab(null); queueMicrotask(() => lastFocusedTriggerRef.current?.focus()); }}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                  >
                    <span className="text-sm">×</span>
                    <span className="sr-only">Close panel</span>
                  </button>
                </div>
              </div>
              {/* Active tab content */}
              <div className="space-y-4 text-sm">
                {tabs.map(t => (
                  <div key={t.id} hidden={activeTab !== t.id}>
                    {t.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarShowcase;
