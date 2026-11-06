import { Check } from 'lucide-react';
import { cn } from '../../lib';

interface Props {
  id: string;
  checked: boolean;
  /** Text next to the box, e.g. "Selected". */
  text: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * A single yes/no tick box shown as a field-height tile: filled box with a tick = Yes, empty box = No.
 * The whole tile is clickable (button role="checkbox") so it is easy to hit.
 */
export default function CheckboxField({ id, checked, text, onChange, disabled }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-10 w-full items-center gap-3 rounded-md border px-3.5 text-left text-sm transition',
        'focus:outline-none focus:ring-1 focus:ring-primary',
        checked ? 'border-primary/60 bg-primary-soft' : 'border-field-line bg-field hover:border-primary/50',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span
        className={cn(
          'grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition',
          checked ? 'border-primary bg-primary text-white' : 'border-muted bg-transparent',
        )}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="truncate">{text}</span>
      <span className={cn('ml-auto text-xs font-medium', checked ? 'text-info' : 'text-muted')}>{checked ? 'Yes' : 'No'}</span>
    </button>
  );
}
