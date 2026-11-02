import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib';

export interface StepperItem { id: string; title: string; icon: LucideIcon }

interface Props {
  steps: StepperItem[];
  current: number;
  /** Furthest step that may be clicked. */
  maxReached: number;
  onSelect: (index: number) => void;
}

/** Horizontal progress tracker: done steps get a tick, the current step is highlighted, connectors fill as you go. */
export default function Stepper({ steps, current, maxReached, onSelect }: Props) {
  return (
    <nav aria-label="Form progress" className="rounded-lg border border-line bg-surface/60 px-5 py-3">
      <ol className="flex items-center">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = i <= maxReached;
          const Icon = s.icon;
          return (
            <li key={s.id} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className={cn('flex min-w-0 items-center gap-2.5 text-left', clickable ? 'cursor-pointer' : 'cursor-not-allowed')}
              >
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition',
                    done && 'border-primary bg-primary text-white',
                    active && 'border-primary bg-primary-soft text-white ring-4 ring-primary/25',
                    !done && !active && 'border-field-line bg-field text-muted',
                  )}
                >
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[11px] uppercase tracking-wide text-muted">Step {i + 1}</span>
                  <span className={cn('block max-w-[9.5rem] truncate text-sm font-medium', active || done ? 'text-white' : 'text-muted')}>{s.title}</span>
                </span>
              </button>
              {i < steps.length - 1 && (
                <span className="mx-3 h-0.5 min-w-4 flex-1 rounded bg-field-line">
                  <span className={cn('block h-full rounded bg-primary transition-all duration-300', done ? 'w-full' : 'w-0')} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
