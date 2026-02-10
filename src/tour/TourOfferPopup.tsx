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
    <div className="fixed bottom-6 right-6 z-[10001] animate-[slideUp_0.3s_ease-out]">
      <div className="bg-white rounded-xl shadow-lg border border-hw-navy-100 w-80 overflow-hidden">
        {/* Purple accent bar */}
        <div className="h-1 bg-hw-purple" />

        <div className="p-5">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-hw-navy-50 transition-colors"
          >
            <X className="w-4 h-4 text-hw-navy-400" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-hw-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-hw-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-hw-navy-900 text-sm">Conheca esta pagina!</h3>
              <p className="text-sm text-hw-navy-500 mt-1">
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
