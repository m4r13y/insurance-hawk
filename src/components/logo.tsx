import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <h1 className={cn("font-headline text-2xl font-bold", className)}>
      Hawk<span className="text-accent font-semibold">Nest</span>
    </h1>
  );
}
