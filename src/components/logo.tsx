import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Home className="h-7 w-7" />
      <h1 className="font-headline text-xl font-bold">
        Policy Nest
      </h1>
    </div>
  );
}
