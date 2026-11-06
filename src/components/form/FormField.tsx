import type { ReactNode } from 'react';
import { cn } from '../../lib';

interface Props {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Label (+ optional required marker) and error text around any input. Long labels are truncated to one line. */
export default function FormField({ label, htmlFor, required, error, children, className }: Props) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {label && (
        <label htmlFor={htmlFor} title={label} className="truncate text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </label>
      )}
      {children}
      {error && <p className="truncate text-sm text-danger" title={error}>{error}</p>}
    </div>
  );
}
