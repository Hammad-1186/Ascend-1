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

/** One compact row: [Back] Title ............ actions. Keeping it to a single row leaves more height for the page below. */
export default function PageHeader({ backTo, backLabel, title, actions }: Props) {
  return (
    <header className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line pb-2">
      {backTo && (
        <Link to={backTo} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-1 text-sm text-muted transition hover:border-primary/60 hover:text-ink">
          <ArrowLeft size={15} /> {backLabel}
        </Link>
      )}
      <h1 className="min-w-0 flex-1 basis-40 truncate text-2xl font-bold leading-tight">{title}</h1>
      {actions && <div className="flex flex-wrap items-center justify-end gap-3">{actions}</div>}
    </header>
  );
}
