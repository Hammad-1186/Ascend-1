import type { ReactNode } from 'react';
import { cn } from '../../lib';

const TONES = {
  solid: 'bg-primary/90 text-white',
  soft: 'border border-primary/50 bg-primary-soft text-info',
  success: 'bg-emerald-500/90 text-white',
  muted: 'border border-line bg-field text-muted',
} as const;

export type BadgeTone = keyof typeof TONES;

export default function Badge({ tone = 'solid', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-medium', TONES[tone], className)}>{children}</span>;
}
