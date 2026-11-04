import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Props {
  /** Omit on top-level pages (the sidebar already navigates there). */
  backTo?: string;
  backLabel?: string;
  title: string;
  /** Right-hand corner, e.g. Cancel / Save. */
  actions?: ReactNode;
}

/** Plain title on the left, actions on the right. No icon, no sub-line. */
export default function PageHeader({ backTo, backLabel, title, actions }: Props) {
  return (
    <header className="mb-2 border-b border-line pb-2">
      {backTo && (
        <Link to={backTo} className="mb-0.5 inline-flex items-center gap-2 text-base text-muted hover:text-ink">
          <ArrowLeft size={16} /> {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="min-w-0 flex-1 basis-40 truncate text-2xl font-bold leading-tight">{title}</h1>
        {actions && <div className="flex flex-wrap items-center justify-end gap-3">{actions}</div>}
      </div>
    </header>
  );
}
