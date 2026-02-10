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
      className="bg-white rounded-xl shadow-lg border border-hw-navy-100 max-w-sm overflow-hidden"
    >
      {/* Purple accent bar */}
      <div className="h-1 bg-hw-purple" />

      {/* Close button */}
      <button
        {...closeProps}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-hw-navy-50 transition-colors"
      >
        <X className="w-4 h-4 text-hw-navy-400" />
      </button>

      {/* Content */}
      <div className="px-5 py-4">
        {step.title && (
          <h3 className="text-base font-semibold text-hw-navy-900 mb-2 pr-6">
            {step.title as string}
          </h3>
        )}
        <p className="text-sm text-hw-navy-600 leading-relaxed">
          {step.content as string}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-hw-navy-100 bg-hw-navy-50/50">
        <span className="text-xs text-hw-navy-400">
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
