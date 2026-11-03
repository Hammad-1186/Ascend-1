import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib';

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary/90 disabled:opacity-60',
  outline: 'border border-line bg-transparent text-white hover:bg-surface disabled:opacity-40',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

/** Class string so <Link> and <button> can look identical. */
export const buttonClasses = (variant: ButtonVariant = 'primary', className?: string) =>
  cn('inline-flex items-center gap-2 rounded-lg px-4 py-3 text-base sm:px-6 font-medium transition disabled:cursor-not-allowed', VARIANTS[variant], className);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
}

export default function Button({ variant = 'primary', icon: Icon, children, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, className)} {...rest}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
