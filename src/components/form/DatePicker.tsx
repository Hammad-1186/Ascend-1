import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib';
import { MONTH_NAMES, formatDate, parseIso, todayParts, toIso, type DateParts } from '../../utils/date';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const YEARS = Array.from({ length: 61 }, (_, i) => 1990 + i);
const POPOVER_W = 288;
const POPOVER_H = 360;

interface Props {
  id: string;
  /** ISO `YYYY-MM-DD` or ''. */
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
}

/** Calendar popover. The chosen date is shown on the button as "DD Mon YYYY" and stored as ISO. */
export default function DatePicker({ id, value, onChange, placeholder = 'Select date' }: Props) {
  const selected = parseIso(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<{ y: number; m: number }>(() => {
    const base = selected ?? todayParts();
    return { y: base.y, m: base.m };
  });
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Position the popover with `fixed` so no parent (overflow-hidden form) can clip it; flip above when there's no room below.
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const top = below >= POPOVER_H + 8 ? r.bottom + 6 : Math.max(8, r.top - POPOVER_H - 6);
    setPos({ top, left: Math.max(8, Math.min(r.left, window.innerWidth - POPOVER_W - 8)) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const base = selected ?? todayParts();
      setView({ y: base.y, m: base.m });
    }
    setOpen((o) => !o);
  };

  // 6 x 7 grid, starting on the Sunday on/before the 1st.
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1).getDay();
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(view.y, view.m, 1 - first + i);
      return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate(), inMonth: d.getMonth() === view.m };
    });
  }, [view]);

  const shiftMonth = (delta: number) => setView(({ y, m }) => {
    const d = new Date(y, m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const pick = (p: DateParts) => { onChange(toIso(p)); setOpen(false); btnRef.current?.focus(); };
  const today = todayParts();
  const same = (a: DateParts | null, b: DateParts) => !!a && a.y === b.y && a.m === b.m && a.d === b.d;

  const navBtn = 'grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-primary-soft hover:text-white';
  const selectCls = 'h-8 rounded-md border border-field-line bg-field px-2 text-sm text-white focus:border-primary focus:outline-none';

  return (
    <>
      <button
        ref={btnRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          'relative flex h-12 w-full items-center rounded-md border border-field-line bg-field pl-11 pr-10 text-left text-base',
          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          open && 'border-primary ring-1 ring-primary',
        )}
      >
        <CalendarDays size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white" />
        <span className={cn('truncate', value ? 'text-white' : 'text-muted')}>{value ? formatDate(value) : placeholder}</span>
        {value && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear date"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-white"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {open && pos && createPortal(
        <div
          ref={popRef}
          role="dialog"
          aria-label="Choose date"
          style={{ top: pos.top, left: pos.left, width: POPOVER_W }}
          className="fixed z-50 rounded-lg border border-field-line bg-surface p-3 shadow-2xl shadow-black/50"
        >
          <div className="mb-2 flex items-center gap-1">
            <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} className={navBtn}><ChevronLeft size={16} /></button>
            <select aria-label="Month" value={view.m} onChange={(e) => setView((v) => ({ ...v, m: Number(e.target.value) }))} className={cn(selectCls, 'flex-1')}>
              {MONTH_NAMES.map((n, i) => <option key={n} value={i} className="bg-field">{n}</option>)}
            </select>
            <select aria-label="Year" value={view.y} onChange={(e) => setView((v) => ({ ...v, y: Number(e.target.value) }))} className={selectCls}>
              {YEARS.map((y) => <option key={y} value={y} className="bg-field">{y}</option>)}
            </select>
            <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} className={navBtn}><ChevronRight size={16} /></button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium uppercase text-muted">
            {WEEKDAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((c) => {
              const isSel = same(selected, c);
              return (
                <button
                  key={`${c.y}-${c.m}-${c.d}`}
                  type="button"
                  onClick={() => pick(c)}
                  className={cn(
                    'mx-auto grid h-9 w-9 place-items-center rounded-full text-sm transition',
                    isSel ? 'bg-primary font-semibold text-white' : c.inMonth ? 'text-white hover:bg-primary-soft' : 'text-muted/50 hover:bg-primary-soft',
                    !isSel && same(today, c) && 'ring-1 ring-primary-2',
                  )}
                >
                  {c.d}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-xs">
            <button type="button" onClick={() => pick(today)} className="rounded px-2 py-1 font-medium text-info hover:bg-primary-soft">Today</button>
            <span className="truncate px-2 text-muted">{selected ? formatDate(value) : 'No date selected'}</span>
            <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="rounded px-2 py-1 text-muted hover:bg-primary-soft hover:text-white">Clear</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
