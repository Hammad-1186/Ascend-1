import { useEffect, useState } from 'react';
import { Sun, Monitor, Moon, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib';
import { applyMode, getStoredMode, type ThemeMode } from '../../utils/theme';

const MODES: Array<{ id: ThemeMode; icon: LucideIcon }> = [
  { id: 'light', icon: Sun },
  { id: 'system', icon: Monitor },
  { id: 'dark', icon: Moon },
];

export default function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  useEffect(() => {
    applyMode(mode);
    if (mode !== 'system') return;
    // While on "system", follow the OS if it switches between light and dark.
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => applyMode('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  return (
    <div className={cn('flex rounded-lg border border-line p-0.5', collapsed && 'flex-col')}>
      {MODES.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={`${id} theme`}
          aria-pressed={mode === id}
          onClick={() => setMode(id)}
          className={cn('grid h-8 flex-1 place-items-center rounded-md text-muted transition', mode === id && 'bg-field text-ink shadow-sm ring-1 ring-field-line')}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
