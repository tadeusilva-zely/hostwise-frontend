import { getConsent, hasAnalyticsConsent, hasMarketingConsent } from './consent';

const GA4_ID = import.meta.env.VITE_GA4_ID || 'G-1MML14E2SL';
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '1236659718454612';

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

let ga4Loaded = false;
let metaPixelLoaded = false;

function initGoogleConsentMode(): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments as unknown as Record<string, unknown>);
  };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  });

  const consent = getConsent();
  if (consent) {
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
    });
  }
}

function loadGA4(): void {
  if (ga4Loaded) return;
  ga4Loaded = true;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: false });
}

function loadMetaPixel(): void {
  if (metaPixelLoaded) return;
  metaPixelLoaded = true;

  /* eslint-disable */
  (function (f: Window, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', META_PIXEL_ID);
}

/**
 * Inicializa tracking. Retorna true se o cookie de consentimento existe.
 */
export function initTracking(): boolean {
  initGoogleConsentMode();

  const consent = getConsent();
  if (!consent) return false;

  if (consent.analytics) loadGA4();
  if (consent.marketing) loadMetaPixel();

  return true;
}

/**
 * Chamado apos o usuario dar consentimento pelo banner.
 */
export function updateConsentAndReload(): void {
  const consent = getConsent();
  if (!consent) return;

  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
    });
  }

  if (consent.analytics && !ga4Loaded) loadGA4();
  if (consent.marketing && !metaPixelLoaded) loadMetaPixel();
}

// ─── Eventos ─────────────────────────────────────────────────────

const PLAN_PRICES: Record<string, number> = {
  STARTER: 57,
  INSIGHT: 127,
  PRO: 297,
};

export function trackCompleteRegistration(): void {
  if (hasAnalyticsConsent() && window.gtag) {
    window.gtag('event', 'Complete_Registration', { method: 'email' });
  }

  if (hasMarketingConsent() && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'HostWise Registration',
      status: true,
      currency: 'BRL',
      value: 0,
    });
  }
}

export function trackStartTrial(): void {
  if (hasAnalyticsConsent() && window.gtag) {
    window.gtag('event', 'Start_Trial', {
      currency: 'BRL',
      value: 57,
      plan: 'STARTER',
      trial_days: 7,
    });
  }

  if (hasMarketingConsent() && window.fbq) {
    window.fbq('track', 'StartTrial', {
      currency: 'BRL',
      value: 57.0,
      predicted_ltv: 57.0,
      content_name: 'Starter Plan',
      trial_period: 7,
    });
  }
}

export function trackPurchase(planName: string): void {
  const value = PLAN_PRICES[planName] || 0;

  if (hasAnalyticsConsent() && window.gtag) {
    window.gtag('event', 'purchase', {
      currency: 'BRL',
      value,
      transaction_id: `hw_${Date.now()}`,
      items: [
        {
          item_id: planName.toLowerCase(),
          item_name: `HostWise ${planName}`,
          price: value,
          quantity: 1,
          item_category: 'subscription',
        },
      ],
    });
  }

  if (hasMarketingConsent() && window.fbq) {
    window.fbq('track', 'Purchase', {
      currency: 'BRL',
      value,
      content_name: `HostWise ${planName}`,
      content_type: 'subscription',
      content_ids: [planName.toLowerCase()],
      num_items: 1,
    });
  }
}
