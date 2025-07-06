import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <h1 className={cn("text-2xl font-bold tracking-tight text-slate-900", className)}>
      Hawk<span className="text-sky-500">Nest</span>
    </h1>
  );
}
