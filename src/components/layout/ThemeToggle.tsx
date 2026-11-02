import { useEffect, useState } from 'react';
import { Sun, Monitor, Moon, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib';

type Mode = 'light' | 'system' | 'dark';
const MODES: Array<{ id: Mode; icon: LucideIcon }> = [
  { id: 'light', icon: Sun },
  { id: 'system', icon: Monitor },
  { id: 'dark', icon: Moon },
];

export default function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const [mode, setMode] = useState<Mode>('system');
  // Only the dark tokens exist today; add a light block in theme.css to activate it.
  useEffect(() => { if (mode !== 'system') document.documentElement.dataset.theme = mode; }, [mode]);

  return (
    <div className={cn('flex rounded-lg border border-line p-0.5', collapsed && 'flex-col')}>
      {MODES.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={`${id} theme`}
          onClick={() => setMode(id)}
          className={cn('grid h-8 flex-1 place-items-center rounded-md text-muted transition', mode === id && 'bg-field text-white ring-1 ring-field-line')}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
