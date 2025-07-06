import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <h1 className={cn("text-2xl font-bold tracking-tight", className)}>
      Hawk<span className="text-primary">Nest</span>
    </h1>
  );
}
