import { useState } from 'react';
import { setConsent, type ConsentState } from '../../lib/consent';
import { updateConsentAndReload } from '../../lib/tracking';

interface CookieConsentBannerProps {
  onConsentGiven: () => void;
}

export function CookieConsentBanner({ onConsentGiven }: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(true);

  const handleAccept = (acceptAll: boolean) => {
    const consent: ConsentState = {
      necessary: true,
      analytics: acceptAll,
      marketing: acceptAll,
      timestamp: new Date().toISOString(),
    };
    setConsent(consent);
    updateConsentAndReload();
    setVisible(false);
    onConsentGiven();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
      style={{ backgroundColor: 'var(--surface-card)', borderTop: '1px solid var(--surface-border)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
          Utilizamos cookies para melhorar sua experiência e para fins de análise e marketing.
          Ao aceitar, você concorda com o uso de cookies conforme nossa{' '}
          <a
            href="https://hostwise.pro/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: '#818cf8' }}
          >
            Política de Privacidade
          </a>
          .
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => handleAccept(false)}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--surface-border)',
            }}
          >
            Apenas necessários
          </button>
          <button
            onClick={() => handleAccept(true)}
            className="btn-primary px-4 py-2 text-sm rounded-lg"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
