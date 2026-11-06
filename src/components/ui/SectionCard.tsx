import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib';
import Badge, { type BadgeTone } from './Badge';

interface Props {
  title?: string;
  /** Small icon chip before the title (same look as the cards on the View page). */
  icon?: LucideIcon;
  badge?: string;
  badgeTone?: BadgeTone;
  /** Right-aligned content in the header (e.g. a hint). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Card: a compact title bar (icon chip + title) with a divider, then the content. */
export default function SectionCard({ title, icon: Icon, badge, badgeTone = 'solid', aside, children, className }: Props) {
  return (
    <section className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}>
      {title && (
        <header className="flex items-center gap-2.5 border-b border-line bg-ink/[0.03] px-4 py-1.5">
          {Icon && <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/15 text-info"><Icon size={15} /></span>}
          <h2 className="truncate text-base font-semibold">{title}</h2>
          {badge && <Badge tone={badgeTone} className="!py-0 !text-xs">{badge}</Badge>}
          {aside && <div className="ml-auto min-w-0 truncate text-sm text-info">{aside}</div>}
        </header>
      )}
      <div className="p-3">{children}</div>
    </section>
  );
}
