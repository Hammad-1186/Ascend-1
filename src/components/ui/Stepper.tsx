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

/** Horizontal progress tracker: done steps get a tick, the current step is highlighted, short connectors fill as you go. */
export default function Stepper({ steps, current, maxReached, onSelect }: Props) {
  return (
    <nav aria-label="Form progress" className="rounded-lg border border-line bg-surface/60 px-3 py-3.5 sm:px-5">
      <ol className="flex items-center justify-center">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = i <= maxReached;
          const Icon = s.icon;
          return (
            <li key={s.id} className="flex min-w-0 items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className={cn('flex min-w-0 items-center gap-2.5 text-left', clickable ? 'cursor-pointer' : 'cursor-not-allowed')}
              >
                <span
                  className={cn(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 text-base font-semibold transition sm:h-12 sm:w-12',
                    done && 'border-primary bg-primary text-white',
                    active && 'border-primary bg-primary-soft text-white ring-4 ring-primary/25',
                    !done && !active && 'border-field-line bg-field text-muted',
                  )}
                >
                  {done ? <Check size={20} /> : <Icon size={20} />}
                </span>
                <span className={cn('hidden min-w-0 leading-tight', active ? 'lg:block' : 'min-[1400px]:block')}>
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted">Step {i + 1}</span>
                  <span className={cn('block max-w-[8rem] text-base font-semibold', active || done ? 'text-white' : 'text-muted')}>{s.title}</span>
                </span>
              </button>
              {i < steps.length - 1 && (
                // Short connector (was a long stretched line): fixed width so the steps sit close together.
                <span className="mx-1.5 h-0.5 w-5 shrink-0 rounded bg-field-line sm:w-8 lg:mx-1.5 lg:w-4">
                  <span className={cn('block h-full rounded bg-primary transition-all duration-300', done ? 'w-full' : 'w-0')} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2.5 truncate text-center text-base font-medium lg:hidden">
        <span className="text-muted">Step {current + 1} of {steps.length} · </span>{steps[current]?.title}
      </p>
    </nav>
  );
}
