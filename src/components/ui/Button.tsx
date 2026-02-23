import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] focus:ring-[var(--accent-primary)]',
    secondary:
      'bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--surface-border)] hover:bg-[var(--surface-card)] hover:border-[var(--surface-border-hover)] focus:ring-[var(--accent-primary)]',
    success:
      'bg-[var(--accent-cta)] text-white hover:bg-[var(--accent-cta-hover)] focus:ring-[var(--accent-cta)]',
    ghost:
      'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] focus:ring-[var(--accent-primary)]',
    danger:
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
