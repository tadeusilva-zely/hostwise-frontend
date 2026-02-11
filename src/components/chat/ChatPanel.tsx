import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Plus,
  MessageSquare,
  ChevronLeft,
  Trash2,
  Sparkles,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatUsageBadge } from './ChatUsageBadge';
import { CreditPurchaseModal } from './CreditPurchaseModal';
import { useChat } from '../../hooks/useChat';
import { useQuery } from '@tanstack/react-query';
import { getHotels } from '../../services/api';
import { Link } from 'react-router-dom';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  'Como estão minhas tarifas comparadas aos concorrentes?',
  'O que meus hóspedes mais elogiam?',
  'Devo reajustar o preço no feriado?',
  'Como posso melhorar minha nota?',
];

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const {
    messages,
    conversations,
    usage,
    isSending,
    showCreditModal,
    setShowCreditModal,
    messagesEndRef,
    sendMessage,
    loadConversation,
    startNewConversation,
    deleteConversation,
  } = useChat();

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });
  const hasHotels = (hotelsData?.ownHotels?.length ?? 0) > 0;

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !showHistory) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, showHistory]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    sendMessage(input.trim());
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  const quotaExhausted = usage && usage.totalAvailable <= 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Panel */}
      <div
        className={cn(
          'fixed z-50 bg-white flex flex-col shadow-2xl',
          // Mobile: fullscreen
          'inset-0',
          // Desktop: anchored panel
          'lg:inset-auto lg:bottom-24 lg:right-6 lg:w-[400px] lg:h-[600px] lg:rounded-2xl lg:border lg:border-hw-navy-200',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-hw-navy-100 bg-white lg:rounded-t-2xl">
          <div className="flex items-center gap-3">
            {showHistory ? (
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-hw-navy-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-hw-navy-600" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-hw-purple to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-hw-navy-900 text-sm">
                {showHistory ? 'Conversas' : 'HostWise AI'}
              </h3>
              {!showHistory && <ChatUsageBadge usage={usage} compact />}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!showHistory && (
              <>
                <button
                  onClick={() => setShowHistory(true)}
                  className="p-2 hover:bg-hw-navy-100 rounded-lg transition-colors"
                  title="Conversas anteriores"
                >
                  <MessageSquare className="w-4 h-4 text-hw-navy-500" />
                </button>
                <button
                  onClick={startNewConversation}
                  className="p-2 hover:bg-hw-navy-100 rounded-lg transition-colors"
                  title="Nova conversa"
                >
                  <Plus className="w-4 h-4 text-hw-navy-500" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-hw-navy-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-hw-navy-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        {showHistory ? (
          /* Conversation History View */
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <MessageSquare className="w-10 h-10 text-hw-navy-300 mb-3" />
                <p className="text-sm text-hw-navy-500">Nenhuma conversa ainda</p>
                <p className="text-xs text-hw-navy-400 mt-1">
                  Comece perguntando sobre seu hotel!
                </p>
              </div>
            ) : (
              <div className="p-2">
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);

                  const grouped: Record<string, typeof conversations> = {};
                  for (const conv of conversations) {
                    const date = new Date(conv.updatedAt);
                    date.setHours(0, 0, 0, 0);
                    let label: string;
                    if (date.getTime() === today.getTime()) {
                      label = 'Hoje';
                    } else if (date.getTime() === yesterday.getTime()) {
                      label = 'Ontem';
                    } else {
                      label = date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      });
                    }
                    if (!grouped[label]) grouped[label] = [];
                    grouped[label].push(conv);
                  }

                  return Object.entries(grouped).map(([dateLabel, convs]) => (
                    <div key={dateLabel}>
                      <p className="text-[10px] font-medium text-hw-navy-400 uppercase tracking-wider text-center py-2">
                        {dateLabel}
                      </p>
                      {convs.map((conv) => (
                        <div
                          key={conv.id}
                          className="flex items-center gap-2 p-3 rounded-xl hover:bg-hw-navy-50 transition-colors cursor-pointer group"
                        >
                          <div
                            className="flex-1 min-w-0"
                            onClick={() => {
                              loadConversation(conv.id);
                              setShowHistory(false);
                            }}
                          >
                            <p className="text-sm font-medium text-hw-navy-900 truncate">
                              {conv.title || 'Conversa sem título'}
                            </p>
                            {conv.lastMessage && (
                              <p className="text-xs text-hw-navy-500 truncate mt-0.5">
                                {conv.lastMessage}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Deseja excluir esta conversa?')) {
                                deleteConversation(conv.id);
                              }
                            }}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        ) : (
          /* Chat Messages View */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                !hasHotels ? (
                  /* No Hotels CTA */
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-hw-purple-100 flex items-center justify-center mb-4">
                      <Building2 className="w-7 h-7 text-hw-purple" />
                    </div>
                    <h4 className="font-semibold text-hw-navy-900 mb-1">
                      Cadastre seu hotel primeiro
                    </h4>
                    <p className="text-xs text-hw-navy-500 mb-5 max-w-[250px]">
                      Para usar o chat IA, você precisa ter pelo menos um hotel cadastrado. A IA usa os dados do seu hotel para responder suas perguntas.
                    </p>
                    <Link
                      to="/hotels"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-hw-purple text-white text-sm font-medium rounded-xl hover:bg-hw-purple-600 transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      Cadastrar Meu Hotel
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                /* Empty State with Suggestions */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hw-purple to-indigo-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-semibold text-hw-navy-900 mb-1">
                    Como posso ajudar?
                  </h4>
                  <p className="text-xs text-hw-navy-500 mb-5 max-w-[250px]">
                    Pergunte sobre tarifas, avaliações, ocupação ou concorrentes do seu hotel.
                  </p>
                  <div className="w-full space-y-2 overflow-x-auto lg:overflow-visible">
                    <div className="flex flex-nowrap lg:flex-wrap gap-2 px-2 lg:px-0 lg:justify-center">
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestion(suggestion)}
                          disabled={quotaExhausted || false}
                          className="flex-shrink-0 text-xs text-hw-purple bg-hw-purple-50 hover:bg-hw-purple-100 border border-hw-purple-200 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                )
              ) : (
                /* Messages */
                <>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {isSending && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Usage bar (expanded) */}
            {usage && messages.length > 0 && (
              <div className="px-4 pb-1">
                <ChatUsageBadge usage={usage} />
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-hw-navy-200 px-4 pt-4 pb-[env(safe-area-inset-bottom,16px)] lg:pb-5 bg-hw-navy-50 lg:rounded-b-2xl">
              {quotaExhausted ? (
                <button
                  onClick={() => setShowCreditModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-hw-purple to-indigo-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Comprar mais mensagens
                </button>
              ) : (
                <div className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pergunte sobre seu hotel..."
                    rows={1}
                    className="flex-1 resize-none border border-hw-navy-200 rounded-xl px-3 py-2.5 text-sm text-hw-navy-900 placeholder:text-hw-navy-400 focus:outline-none focus:border-hw-purple focus:ring-1 focus:ring-hw-purple max-h-[120px]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    className="p-2.5 bg-hw-purple text-white rounded-xl hover:bg-hw-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
      />
    </>
  );
}
