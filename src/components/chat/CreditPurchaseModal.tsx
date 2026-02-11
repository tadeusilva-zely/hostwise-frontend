import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, CreditCard, Sparkles } from 'lucide-react';
import { getCreditPacks, purchaseCredits } from '../../services/api';
import { cn } from '../../lib/utils';

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
      <div className="relative bg-white w-full lg:w-[420px] lg:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-hw-navy-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-hw-purple" />
            <h3 className="font-semibold text-hw-navy-900">Comprar Mensagens</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-hw-navy-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-hw-navy-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-hw-navy-600 mb-4">
            Voce atingiu seu limite mensal. Compre mensagens extras para continuar conversando com a IA.
          </p>

          {packs.map((pack) => {
            const priceFormatted = (pack.priceInCents / 100).toFixed(2).replace('.', ',');
            const perMessage = (pack.priceInCents / pack.credits / 100).toFixed(2).replace('.', ',');
            const isLoading = loadingIndex === pack.index;

            return (
              <button
                key={pack.index}
                onClick={() => handlePurchase(pack.index)}
                disabled={!pack.available || loadingIndex !== null}
                className={cn(
                  'w-full text-left border-2 rounded-xl p-4 transition-all',
                  'hover:border-hw-purple hover:shadow-md',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  pack.index === 1
                    ? 'border-hw-purple bg-hw-purple-50'
                    : 'border-hw-navy-200',
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-hw-navy-900">{pack.label}</p>
                    <p className="text-xs text-hw-navy-500 mt-0.5">
                      R$ {perMessage} por mensagem
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-hw-purple" />
                    ) : (
                      <>
                        <span className="text-lg font-bold text-hw-navy-900">
                          R$ {priceFormatted}
                        </span>
                        <CreditCard className="w-4 h-4 text-hw-navy-400" />
                      </>
                    )}
                  </div>
                </div>
                {pack.index === 1 && (
                  <span className="inline-block mt-2 text-xs font-medium text-hw-purple bg-hw-purple-100 px-2 py-0.5 rounded-full">
                    Mais popular
                  </span>
                )}
              </button>
            );
          })}

          {packs.length === 0 && (
            <p className="text-sm text-hw-navy-500 text-center py-4">
              Pacotes de creditos nao disponiveis no momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
