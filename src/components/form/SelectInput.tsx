import type { SelectHTMLAttributes } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib';
import type { SelectOption } from '../../types/hr';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: LucideIcon;
  /** options: [{ value, label }] - comes from the API later, static mock now. */
  options?: SelectOption[];
  placeholder?: string;
  value: string;
}

/** The empty option stays selectable so an optional value can be cleared again. */
export default function SelectInput({ icon: Icon, options = [], placeholder, value, className, ...rest }: Props) {
  return (
    <div className="relative">
      {Icon && <Icon size={19} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />}
      <select
        value={value}
        className={cn(
          'h-11 w-full appearance-none truncate rounded-md border border-field-line bg-field pr-10 text-base',
          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60',
          value ? 'text-ink' : 'text-muted',
          Icon ? 'pl-11' : 'pl-3.5',
          className,
        )}
        {...rest}
      >
        <option value="" className="bg-field text-muted">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-field text-ink">{o.label}</option>
        ))}
      </select>
      <ChevronDown size={19} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink" />
    </div>
  );
}
