import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);

  return pages;
}

export function Pagination({ page, totalPages, onPageChange, isLoading }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || isLoading}
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          color: 'var(--text-muted)',
          border: '1px solid var(--surface-border)',
        }}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed"
            style={
              p === page
                ? {
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                  }
                : {
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--surface-border)',
                  }
            }
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || isLoading}
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          color: 'var(--text-muted)',
          border: '1px solid var(--surface-border)',
        }}
        aria-label="Próxima página"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
