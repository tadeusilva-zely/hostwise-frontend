import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, CreditCard, Sparkles } from 'lucide-react';
import { getCreditPacks, purchaseCredits } from '../../services/api';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditPurchaseModal({ isOpen, onClose }: CreditPurchaseModalProps) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const { data } = useQuery({
    queryKey: ['credit-packs'],
    queryFn: getCreditPacks,
    enabled: isOpen,
  });

  const packs = data?.packs ?? [];

  const handlePurchase = async (packIndex: number) => {
    setLoadingIndex(packIndex);
    try {
      const result = await purchaseCredits(packIndex);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      setLoadingIndex(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full lg:w-[420px] lg:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ backgroundColor: 'var(--surface-card)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 px-5 py-4 flex items-center justify-between rounded-t-2xl"
          style={{
            backgroundColor: 'var(--surface-card)',
            borderBottom: '1px solid var(--surface-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: '#818cf8' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Comprar Mensagens</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-secondary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Você atingiu seu limite mensal. Compre mensagens extras para continuar conversando com a IA.
          </p>

          {packs.map((pack) => {
            const priceFormatted = (pack.priceInCents / 100).toFixed(2).replace('.', ',');
            const perMessage = (pack.priceInCents / pack.credits / 100).toFixed(2).replace('.', ',');
            const isLoading = loadingIndex === pack.index;
            const isPopular = pack.index === 1;

            return (
              <button
                key={pack.index}
                onClick={() => handlePurchase(pack.index)}
                disabled={!pack.available || loadingIndex !== null}
                className="w-full text-left rounded-xl p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: isPopular ? '2px solid #4f46e5' : '1px solid var(--surface-border)',
                  backgroundColor: isPopular ? 'rgba(79,70,229,0.08)' : 'var(--surface-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isPopular) (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  if (!isPopular) (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)';
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      R$ {perMessage} por mensagem
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#818cf8' }} />
                    ) : (
                      <>
                        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          R$ {priceFormatted}
                        </span>
                        <CreditCard className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      </>
                    )}
                  </div>
                </div>
                {isPopular && (
                  <span
                    className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(79,70,229,0.2)', color: '#818cf8' }}
                  >
                    Mais popular
                  </span>
                )}
              </button>
            );
          })}

          {packs.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
              Pacotes de créditos não disponíveis no momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
