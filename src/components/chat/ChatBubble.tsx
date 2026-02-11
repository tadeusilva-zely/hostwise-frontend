import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChatPanel } from './ChatPanel';

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (isOpen) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Chat Panel */}
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-tour="chat-bubble"
          className={cn(
            'fixed z-50 flex items-center justify-center',
            'bg-gradient-to-br from-hw-purple to-indigo-600 text-white',
            'shadow-lg hover:shadow-xl transition-all hover:scale-105',
            'active:scale-95',
            // Mobile
            'bottom-4 right-4 w-12 h-12 rounded-full',
            // Desktop
            'lg:bottom-6 lg:right-6 lg:w-14 lg:h-14',
          )}
          aria-label="Abrir chat IA"
        >
          <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      )}
    </>
  );
}
