import type { TooltipRenderProps } from 'react-joyride';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function TourTooltip({
  continuous,
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="rounded-xl shadow-2xl max-w-sm overflow-hidden"
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--surface-border)',
      }}
    >
      {/* Indigo accent bar */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />

      {/* Close button */}
      <button
        {...closeProps}
        className="absolute top-3 right-3 p-1 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-secondary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="px-5 py-4">
        {step.title && (
          <h3 className="text-base font-semibold mb-2 pr-6" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
            {step.title as string}
          </h3>
        )}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {step.content as string}
        </p>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-secondary)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {index + 1} de {size}
        </span>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button {...backProps} variant="ghost" size="sm">
              Anterior
            </Button>
          )}
          {continuous ? (
            <Button {...primaryProps} variant="primary" size="sm">
              {index === size - 1 ? 'Concluir' : 'Proximo'}
            </Button>
          ) : (
            <Button {...closeProps} variant="primary" size="sm">
              Fechar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
