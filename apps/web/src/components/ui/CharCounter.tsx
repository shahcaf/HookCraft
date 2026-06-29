import { cn } from '@/lib/utils';

interface CharCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharCounter({ current, max, className }: CharCounterProps) {
  const pct = current / max;
  const status = pct >= 1 ? 'error' : pct >= 0.9 ? 'warn' : '';
  return (
    <span className={cn('char-counter', status, className)}>
      {current}/{max}
    </span>
  );
}
