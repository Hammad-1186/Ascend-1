import { cn } from '../../lib';
import type { HrType } from '../../types/hr';
import { hrTypeLabel } from './hrFormConfig';

/**
 * HR type pill for the directory table, styled like the status pills elsewhere in the app (Approved / Initiated ...):
 *   dark theme  -> tinted translucent fill, bright coloured text, faint coloured border
 *   light theme -> pastel fill, darker coloured text, pale coloured border
 * Strategic = blue, Contractual = green. Fixed width so every row lines up.
 *
 * Self-contained: built-in Tailwind colours only (no theme variables). Class names are written out in full so
 * Tailwind can find them; the light variants switch on <html data-theme="light">.
 */
const STYLE: Record<HrType, string> = {
  strategic:
    'border-blue-400/40 bg-blue-500/20 text-blue-300 [[data-theme=light]_&]:border-blue-200 [[data-theme=light]_&]:bg-blue-50 [[data-theme=light]_&]:text-blue-700',
  contractual:
    'border-emerald-400/40 bg-emerald-500/15 text-emerald-400 [[data-theme=light]_&]:border-emerald-200 [[data-theme=light]_&]:bg-emerald-50 [[data-theme=light]_&]:text-emerald-700',
};

export default function HrTypeBadge({ type, className }: { type: HrType; className?: string }) {
  return (
    <span className={cn('inline-flex h-7 w-28 items-center justify-center rounded-full border text-xs font-medium', STYLE[type], className)}>
      {hrTypeLabel(type)}
    </span>
  );
}
