import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-900 active:bg-primary-900 border border-transparent',
  secondary:
    'bg-surface text-primary-900 border border-line-strong hover:bg-primary-50',
  ghost: 'bg-transparent text-primary-700 border border-transparent hover:bg-primary-50',
  quiet: 'bg-transparent text-ink-600 border border-transparent hover:bg-sunken',
};

const SIZES: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1',
  md: 'text-base px-4 py-2.5 gap-2',
  lg: 'text-md px-6 py-3.5 gap-2',
};

const BASE =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors ' +
  'disabled:opacity-45 disabled:cursor-not-allowed select-none';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** 横幅いっぱいに広げる(スマホの主要操作で使う) */
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', block, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && 'w-full', className)}
      {...rest}
    />
  );
});

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  block,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && 'w-full', className)}
      {...rest}
    />
  );
}
