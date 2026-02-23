import type { ChatUsageData } from '../../services/api';

interface ChatUsageBadgeProps {
  usage: ChatUsageData | undefined;
  compact?: boolean;
}

export function ChatUsageBadge({ usage, compact = false }: ChatUsageBadgeProps) {
  if (!usage) return null;

  const used = usage.used;
  const limit = usage.limit;
  const percentage = limit > 0 ? (used / limit) * 100 : 0;

  const badgeStyle =
    percentage < 50
      ? { backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }
      : percentage < 80
        ? { backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }
        : { backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' };

  const barColor =
    percentage < 50 ? '#10b981' : percentage < 80 ? '#f59e0b' : '#f87171';

  if (compact) {
    return (
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={badgeStyle}
      >
        {used}/{limit}
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>
          {used} de {limit} mensagens
          {usage.bonusCredits > 0 && (
            <span style={{ color: '#818cf8' }}> +{usage.bonusCredits} bonus</span>
          )}
        </span>
      </div>
      <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--surface-border)' }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}
        />
      </div>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        Renova em {new Date(usage.periodEnd).toLocaleDateString('pt-BR')}
      </p>
    </div>
  );
}
