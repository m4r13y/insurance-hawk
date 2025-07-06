import { Feather } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Feather className="h-7 w-7" />
      <h1 className="font-headline text-xl font-bold">
        HawkNest
      </h1>
    </div>
  );
}
