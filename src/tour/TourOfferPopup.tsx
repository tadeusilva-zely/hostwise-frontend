import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelpCircle, X } from 'lucide-react';
import { useTour, pathToPage } from '../contexts/TourContext';
import { Button } from '../components/ui/Button';

export function TourOfferPopup() {
  const { shouldOfferTour, startTour, dismissTour } = useTour();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const page = pathToPage[location.pathname];

  useEffect(() => {
    if (page && shouldOfferTour(page)) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [page, shouldOfferTour]);

  if (!visible || !page) return null;

  const handleDismiss = () => {
    dismissTour(page);
    setVisible(false);
  };

  const handleStart = () => {
    setVisible(false);
    // Small delay to let the popup close before starting tour
    setTimeout(() => startTour(page), 100);
  };

  return (
    <div className="fixed bottom-6 left-4 lg:left-6 z-[10001] animate-[slideUp_0.3s_ease-out]">
      <div
        className="rounded-xl shadow-2xl w-80 overflow-hidden"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--surface-border)',
        }}
      >
        {/* Indigo accent bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />

        <div className="p-5">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-secondary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.2))' }}
            >
              <HelpCircle className="w-5 h-5" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Conheca esta pagina!</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Quer fazer um tour rapido pelas funcionalidades?
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Agora nao
            </Button>
            <Button variant="primary" size="sm" onClick={handleStart}>
              Iniciar Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
