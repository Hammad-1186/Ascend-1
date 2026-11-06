import type { ReactNode } from 'react';
import { cn } from '../../lib';
import Badge, { type BadgeTone } from './Badge';

interface Props {
  title?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  /** Right-aligned content in the header (e.g. a hint). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Clean card: a plain title bar (no icon) with a divider, then the content. */
export default function SectionCard({ title, badge, badgeTone = 'solid', aside, children, className }: Props) {
  return (
    <section className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}>
      {title && (
        <header className="flex items-center gap-3 border-b border-line bg-ink/[0.03] px-4 py-1.5">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          {badge && <Badge tone={badgeTone} className="!py-0 !text-xs">{badge}</Badge>}
          {aside && <div className="ml-auto min-w-0 truncate text-sm text-info">{aside}</div>}
        </header>
      )}
      <div className="p-3">{children}</div>
    </section>
  );
}
