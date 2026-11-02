import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

interface Props {
  backTo?: string;
  backLabel?: string;
  icon?: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/** On phones the action buttons wrap onto their own line instead of squeezing the title. */
export default function PageHeader({ backTo, backLabel, icon: Icon, title, subtitle, actions }: Props) {
  return (
    <header className="mb-3 border-b border-line pb-3">
      {backTo && (
        <Link to={backTo} className="mb-1.5 inline-flex items-center gap-2 text-sm text-muted hover:text-white">
          <ArrowLeft size={16} /> {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-56 items-center gap-3 sm:gap-4">
          {Icon && (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft ring-2 ring-primary/50 sm:h-11 sm:w-11"><Icon size={20} /></span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold leading-tight sm:text-2xl">{title}</h1>
            {subtitle && <div className="hidden truncate text-xs uppercase tracking-wide text-muted sm:block">{subtitle}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
