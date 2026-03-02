import { useState, useEffect } from 'react';
import { initTracking } from '../lib/tracking';

export function useTracking() {
  const [showConsentBanner, setShowConsentBanner] = useState(false);

  useEffect(() => {
    const hasConsent = initTracking();
    if (!hasConsent) {
      setShowConsentBanner(true);
    }
  }, []);

  const handleConsentGiven = () => {
    setShowConsentBanner(false);
  };

  return { showConsentBanner, handleConsentGiven };
}
