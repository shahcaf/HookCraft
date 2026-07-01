import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';

interface CharCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharCounter({ current, max, className }: CharCounterProps) {
  const showCharCounters = useUIStore((s) => s.showCharCounters);
  if (!showCharCounters) return null;

  const pct = current / max;
  const status = pct >= 1 ? 'error' : pct >= 0.9 ? 'warn' : '';
  return (
    <span className={cn('char-counter', status, className)}>
      {current}/{max}
    </span>
  );
}
