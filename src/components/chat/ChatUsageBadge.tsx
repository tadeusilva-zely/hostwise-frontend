import { cn } from '../../lib/utils';
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

  const colorClass =
    percentage < 50
      ? 'bg-green-100 text-green-700'
      : percentage < 80
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';

  const barColor =
    percentage < 50 ? 'bg-green-500' : percentage < 80 ? 'bg-yellow-500' : 'bg-red-500';

  if (compact) {
    return (
      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colorClass)}>
        {used}/{limit}
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-hw-navy-500">
        <span>
          {used} de {limit} mensagens
          {usage.bonusCredits > 0 && (
            <span className="text-hw-purple"> +{usage.bonusCredits} bonus</span>
          )}
        </span>
      </div>
      <div className="w-full bg-hw-navy-100 rounded-full h-1.5">
        <div
          className={cn('h-1.5 rounded-full transition-all', barColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-hw-navy-400">
        Renova em {new Date(usage.periodEnd).toLocaleDateString('pt-BR')}
      </p>
    </div>
  );
}
