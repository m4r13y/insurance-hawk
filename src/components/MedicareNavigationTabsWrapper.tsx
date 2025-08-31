import { Suspense } from "react";
import MedicareNavigationTabs from "./MedicareNavigationTabs";

interface MedicareNavigationTabsWrapperProps {
  className?: string;
  size?: "sm" | "default";
}

function MedicareNavigationTabsFallback() {
  return (
    <nav className="flex items-center gap-2">
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-16 h-8 bg-muted rounded"></div>
        <div className="w-16 h-8 bg-muted rounded"></div>
        <div className="w-20 h-8 bg-muted rounded"></div>
      </div>
    </nav>
  );
}

export default function MedicareNavigationTabsWrapper(props: MedicareNavigationTabsWrapperProps) {
  return (
    <Suspense fallback={<MedicareNavigationTabsFallback />}>
      <MedicareNavigationTabs {...props} />
    </Suspense>
  );
}
