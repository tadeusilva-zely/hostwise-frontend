import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Sparkles, Copy, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { getSmartReply, markReviewAnswered } from '../../services/api';
import type { ReviewWithHotel } from '../../services/api';

interface SmartReplyPanelProps {
  review: ReviewWithHotel;
  onClose: () => void;
}

type Tone = 'empathetic' | 'formal' | 'grateful';

const TONE_OPTIONS: { value: Tone; label: string; desc: string }[] = [
  { value: 'empathetic', label: 'Empático', desc: 'Compreensivo e acolhedor' },
  { value: 'formal', label: 'Formal', desc: 'Profissional e direto' },
  { value: 'grateful', label: 'Agradecido', desc: 'Reconhecido e positivo' },
];

export function SmartReplyPanel({ review, onClose }: SmartReplyPanelProps) {
  const [tone, setTone] = useState<Tone>('empathetic');
  const [generatedReply, setGeneratedReply] = useState('');
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const smartReplyMutation = useMutation({
    mutationFn: () => getSmartReply(review.id, tone),
    onSuccess: (data) => {
      setGeneratedReply(data.reply);
    },
  });

  const markAnsweredMutation = useMutation({
    mutationFn: () => markReviewAnswered(review.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-response-stats'] });
      onClose();
    },
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAndMarkAnswered = () => {
    markAnsweredMutation.mutate();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col animate-slide-in-right"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderLeft: '1px solid var(--surface-border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--surface-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}>
                Smart Reply
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Gere uma resposta com IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Review Preview */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Avaliação
            </p>
            <div
              className="rounded-xl p-4 space-y-2"
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {review.reviewerName || 'Anônimo'}
                </p>
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: 'white',
                  }}
                >
                  {review.rating.toFixed(1)}
                </span>
              </div>
              {review.title && (
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {review.title}
                </p>
              )}
              {review.positive && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {review.positive}
                </p>
              )}
              {review.negative && (
                <p className="text-sm" style={{ color: '#f87171' }}>
                  {review.negative}
                </p>
              )}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Tom da resposta
            </p>
            <div className="space-y-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTone(opt.value)}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all duration-150"
                  style={
                    tone === opt.value
                      ? {
                          background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
                          border: '1px solid rgba(79,70,229,0.4)',
                        }
                      : {
                          backgroundColor: 'var(--surface-card)',
                          border: '1px solid var(--surface-border)',
                        }
                  }
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: tone === opt.value ? '#818cf8' : 'var(--text-primary)' }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={() => smartReplyMutation.mutate()}
            disabled={smartReplyMutation.isPending}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            {smartReplyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando resposta...
              </>
            ) : (
              <>
                {generatedReply ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {generatedReply ? 'Gerar nova resposta' : 'Gerar resposta'}
              </>
            )}
          </button>

          {/* Error */}
          {smartReplyMutation.isError && (
            <div
              className="rounded-xl p-3 text-sm"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
            >
              {(smartReplyMutation.error as Error)?.message || 'Erro ao gerar resposta. Tente novamente.'}
            </div>
          )}

          {/* Generated Reply */}
          {generatedReply && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                Resposta gerada
              </p>
              <textarea
                value={generatedReply}
                onChange={(e) => setGeneratedReply(e.target.value)}
                rows={8}
                className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79,70,229,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--surface-border)';
                  e.currentTarget.style.boxShadow = '';
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {generatedReply && (
          <div
            className="px-5 py-4 space-y-2 flex-shrink-0"
            style={{ borderTop: '1px solid var(--surface-border)' }}
          >
            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-secondary)',
              }}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span style={{ color: '#10b981' }}>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar resposta
                </>
              )}
            </button>

            <button
              onClick={handleSendAndMarkAnswered}
              disabled={markAnsweredMutation.isPending}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent-cta)' }}
            >
              {markAnsweredMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Copiar e Marcar como Respondido
            </button>
          </div>
        )}
      </div>
    </>
  );
}
