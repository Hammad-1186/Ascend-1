import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib';

export interface ViewToggleOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

interface ViewToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewToggleOption<T>[];
  className?: string;
}

/** Segmented switch (e.g. Table View | Grid View). Reusable for any page with more than one layout. */
export default function ViewToggle<T extends string>({ value, onChange, options, className }: ViewToggleProps<T>) {
  return (
    <div role="group" aria-label="View mode" className={cn('inline-flex rounded-lg border border-line bg-surface/60 p-1', className)}>
      {options.map(({ value: v, label, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition',
              active ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-muted hover:text-white',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        );
      })}
    </div>
  );
}
