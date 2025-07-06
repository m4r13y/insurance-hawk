import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <h1 className="font-headline text-xl font-bold">
        Hawkins
      </h1>
      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground">
         <span className="text-xs font-bold font-headline">Nest</span>
      </div>
    </div>
  );
}
