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

/**
 * Numbered step tabs, left-aligned: the current step is solid blue, finished steps get a tick.
 * No icons and no connector lines; if the screen is narrow the tabs wrap onto a second row.
 */
export default function Stepper({ steps, current, maxReached, onSelect }: Props) {
  return (
    <nav aria-label="Form progress" className="rounded-lg border border-line bg-surface p-1">
      <ol className="flex flex-wrap items-center justify-start gap-0.5">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = i <= maxReached;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2.5 text-base font-semibold transition',
                  active ? 'bg-primary text-white' : 'text-muted',
                  !active && clickable && 'hover:bg-ink/5 hover:text-ink',
                  !clickable && 'cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded text-sm font-bold',
                    active ? 'bg-white/20 text-white' : done ? 'bg-primary text-white' : 'bg-ink/10 text-muted',
                  )}
                >
                  {done ? <Check size={14} /> : i + 1}
                </span>
                {s.title}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
