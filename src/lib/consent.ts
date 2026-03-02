export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const CONSENT_COOKIE_NAME = 'hw_consent';

export function getConsent(): ConsentState | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name === CONSENT_COOKIE_NAME) {
      try {
        return JSON.parse(decodeURIComponent(valueParts.join('=')));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function setConsent(consent: ConsentState): void {
  const value = encodeURIComponent(JSON.stringify(consent));
  const maxAge = 365 * 24 * 60 * 60;
  const domain = window.location.hostname.includes('hostwise.pro')
    ? '; domain=.hostwise.pro'
    : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${domain}`;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return getConsent()?.marketing === true;
}
