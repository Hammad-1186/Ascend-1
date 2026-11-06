import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  /** Unit shown inside the input on the right, e.g. "months". */
  suffix?: string;
}

export default function TextInput({ icon: Icon, suffix, className, ...rest }: Props) {
  return (
    <div className="relative">
      {Icon && <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />}
      <input
        className={cn(
          'h-10 w-full truncate rounded-md border border-field-line bg-field text-sm text-ink placeholder:text-muted',
          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          Icon ? 'pl-10' : 'pl-3.5',
          suffix ? 'pr-24' : 'pr-3',
          className,
        )}
        {...rest}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
    </div>
  );
}
