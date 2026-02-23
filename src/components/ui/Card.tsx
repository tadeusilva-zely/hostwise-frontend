import { cn } from '../../lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={cn('rounded-2xl p-6', className)}
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--surface-border)',
        boxShadow: 'var(--card-shadow)',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: CardProps) {
  return (
    <h3
      className={cn('text-lg font-semibold', className)}
      style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, Inter, system-ui, sans-serif' }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }: CardProps) {
  return (
    <p className={cn('text-sm mt-1', className)} style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

export function CardContent({ className, children }: CardProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }: CardProps) {
  return (
    <div
      className={cn('mt-4 pt-4', className)}
      style={{ borderTop: '1px solid var(--surface-border)' }}
    >
      {children}
    </div>
  );
}
