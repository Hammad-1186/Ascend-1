import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib';

/** Fixed size (no resize handle) so the form never grows; a counter shows the remaining room. */
export default function TextAreaInput({ className, value, maxLength, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="relative">
      <textarea
        rows={3}
        value={value}
        maxLength={maxLength}
        className={cn(
          'w-full resize-none rounded-md border border-field-line bg-field px-3 py-2 text-sm text-ink placeholder:text-muted',
          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          className,
        )}
        {...rest}
      />
      {maxLength && <span className="pointer-events-none absolute bottom-1.5 right-3 text-xs text-muted">{String(value ?? '').length}/{maxLength}</span>}
    </div>
  );
}
