import { cn } from '../../lib';
import type { SelectOption } from '../../types/hr';

interface Props<T extends string> {
  name: string;
  options: Array<SelectOption & { value: T }>;
  value: T;
  onChange: (value: T) => void;
}

export default function RadioCardGroup<T extends string>({ name, options, value, onChange }: Props<T>) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-3">
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <label
            key={o.value}
            className={cn(
              'flex h-10 cursor-pointer items-center gap-3 rounded-md border px-4 text-base transition',
              checked ? 'border-primary bg-primary-soft' : 'border-transparent hover:bg-surface',
            )}
          >
            <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
            <span className={cn('grid h-6 w-6 place-items-center rounded-full border-2', checked ? 'border-primary' : 'border-muted')}>
              {checked && <span className="h-3 w-3 rounded-full bg-primary" />}
            </span>
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
