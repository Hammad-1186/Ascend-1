import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib';
import Badge, { type BadgeTone } from './Badge';

interface Props {
  title?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeTone?: BadgeTone;
  /** Right-aligned content in the header (e.g. a hint). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Bordered card with an optional icon + heading header. */
export default function SectionCard({ title, icon: Icon, badge, badgeTone = 'solid', aside, children, className }: Props) {
  return (
    <section className={cn('rounded-lg border border-line bg-surface/60 p-4', className)}>
      {title && (
        <header className="mb-3 flex items-center gap-2.5">
          {Icon && (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-white ring-1 ring-primary/40">
              <Icon size={16} />
            </span>
          )}
          <h2 className="truncate text-base font-semibold">{title}</h2>
          {badge && <Badge tone={badgeTone}>{badge}</Badge>}
          {aside && <div className="ml-auto min-w-0 truncate text-xs text-info">{aside}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
