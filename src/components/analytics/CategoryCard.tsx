import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReviewCategory } from '../../services/api';

interface CategoryCardProps {
  category: ReviewCategory;
  isSelected: boolean;
  onClick: () => void;
  showCompetitor?: boolean;
}

export function CategoryCard({ category, isSelected, onClick, showCompetitor }: CategoryCardProps) {
  const score = category.score ?? 0;
  const compScore = category.competitorScore ?? 0;
  const maxScore = 10;
  const pct = Math.min((score / maxScore) * 100, 100);
  const compPct = Math.min((compScore / maxScore) * 100, 100);

  const scoreColor =
    score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : score > 0 ? '#ef4444' : '#8b95b0';

  const compScoreColor =
    compScore >= 8 ? '#10b981' : compScore >= 6 ? '#f59e0b' : compScore > 0 ? '#ef4444' : '#8b95b0';

  const hasTrend = category.trend !== null && category.trend !== undefined;
  const trendUp = hasTrend && (category.trend ?? 0) > 0;
  const trendDown = hasTrend && (category.trend ?? 0) < 0;

  const hasCompetitorScore = showCompetitor && category.competitorScore !== null;

  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-2xl p-4 transition-all duration-200"
      style={
        isSelected
          ? {
              background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08))',
              border: '1px solid rgba(79,70,229,0.35)',
            }
          : {
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--surface-border)',
            }
      }
    >
      <div className="flex items-start justify-between mb-3">
        <p
          className="text-sm font-semibold"
          style={{ color: isSelected ? '#818cf8' : 'var(--text-secondary)' }}
        >
          {category.name}
        </p>
        {hasTrend && (
          <span
            className="flex items-center gap-0.5 text-xs font-medium"
            style={{
              color: trendUp ? '#10b981' : trendDown ? '#ef4444' : '#8b95b0',
            }}
          >
            {trendUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : trendDown ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {hasTrend && Math.abs(category.trend ?? 0).toFixed(1)}
          </span>
        )}
      </div>

      {hasCompetitorScore ? (
        // Comparison view: two scores side by side
        <div className="flex items-end gap-3 mb-2">
          <div>
            <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Meu Hotel
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: scoreColor, fontFamily: 'Lexend, sans-serif' }}
            >
              {score > 0 ? score.toFixed(1) : '—'}
            </p>
          </div>
          <div
            className="w-px self-stretch"
            style={{ backgroundColor: 'var(--surface-border)' }}
          />
          <div>
            <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Concorrentes
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: compScoreColor, fontFamily: 'Lexend, sans-serif' }}
            >
              {compScore > 0 ? compScore.toFixed(1) : '—'}
            </p>
          </div>
          {score > 0 && compScore > 0 && (
            <div className="ml-auto text-right">
              <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
                Diferença
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  color:
                    score - compScore > 0
                      ? '#10b981'
                      : score - compScore < 0
                        ? '#ef4444'
                        : '#8b95b0',
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                {score - compScore > 0 ? '+' : ''}
                {(score - compScore).toFixed(1)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p
          className="text-3xl font-bold mb-2"
          style={{ color: scoreColor, fontFamily: 'Lexend, sans-serif' }}
        >
          {score > 0 ? score.toFixed(1) : '—'}
        </p>
      )}

      {/* Progress bars */}
      {hasCompetitorScore ? (
        <div className="space-y-1.5">
          <div
            className="w-full rounded-full h-1.5"
            style={{ backgroundColor: 'var(--surface-border)' }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: score > 0 ? `${pct}%` : '0%', backgroundColor: '#10b981' }}
            />
          </div>
          <div
            className="w-full rounded-full h-1.5"
            style={{ backgroundColor: 'var(--surface-border)' }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: compScore > 0 ? `${compPct}%` : '0%', backgroundColor: '#f59e0b', opacity: 0.7 }}
            />
          </div>
        </div>
      ) : (
        <div
          className="w-full rounded-full h-1.5"
          style={{ backgroundColor: 'var(--surface-border)' }}
        >
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: score > 0 ? `${pct}%` : '0%', backgroundColor: scoreColor }}
          />
        </div>
      )}

      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        {category.reviewCount} {category.reviewCount === 1 ? 'avaliação' : 'avaliações'}
      </p>
    </button>
  );
}
