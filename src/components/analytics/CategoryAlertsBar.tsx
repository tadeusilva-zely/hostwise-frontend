import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { CategoryAlert } from '../../services/api';

interface CategoryAlertsBarProps {
  alerts: CategoryAlert[];
  onViewReviews?: (categoryName: string) => void;
}

export function CategoryAlertsBar({ alerts, onViewReviews }: CategoryAlertsBarProps) {
  if (alerts.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-4 space-y-2"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05))',
        border: '1px solid rgba(245,158,11,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#f59e0b' }}>
            Atenção: quedas de score detectadas
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {alerts.length} {alerts.length === 1 ? 'categoria caiu' : 'categorias caíram'} mais de 0.5 pontos este mês
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.categoryId}
            className="flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{
              backgroundColor: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.12)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {alert.categoryName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                -{alert.drop.toFixed(1)} pts
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {alert.previousScore.toFixed(1)} → {alert.currentScore.toFixed(1)}
              </span>
            </div>
            {onViewReviews && (
              <button
                onClick={() => onViewReviews(alert.categoryName)}
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: '#f59e0b' }}
              >
                Ver avaliações
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
