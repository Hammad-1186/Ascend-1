import { cn } from '../../lib';

export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-9 w-9 shrink-0', className)} aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#logo-g)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4 4 10l12 6 12-6z" /><path d="M4 16l12 6 12-6" /><path d="M4 22l12 6 12-6" />
      </g>
    </svg>
  );
}
