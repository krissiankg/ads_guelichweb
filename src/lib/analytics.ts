// Meta Pixel and Google Analytics 4. Nothing loads until the IDs are set:
//   VITE_META_PIXEL_ID   (Meta Events Manager)
//   VITE_GA_ID           (Google Analytics 4, "G-XXXXXXXXXX")
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

type Tracker = (...args: unknown[]) => void;
type FbqStub = Tracker & {
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: Tracker;
  callMethod?: Tracker;
};

declare global {
  interface Window {
    fbq?: Tracker;
    _fbq?: Tracker;
    gtag?: Tracker;
    dataLayer?: unknown[];
  }
}

function loadScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function track(metaEvent: string, gaEvent: string, params: Record<string, unknown> = {}) {
  window.fbq?.('track', metaEvent, params);
  window.gtag?.('event', gaEvent, params);
}

const CONSENT_KEY = 'gw-cookie-consent';
let started = false;

export type Consent = 'granted' | 'denied' | 'unset';

/** True when at least one tracker is configured, outside the admin area. */
export function hasTracking() {
  return Boolean(PIXEL_ID || GA_ID) && !window.location.pathname.startsWith('/admin');
}

export function getConsent(): Consent {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'unset';
  } catch {
    // Storage unavailable (private mode): ask again on each visit.
    return 'unset';
  }
}

/** Save the visitor's choice and start tracking if they accepted. */
export function setConsent(value: 'granted' | 'denied') {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Keep the choice for this page view only.
  }
  if (value === 'granted') startTracking();
  // Trackers already running on this page can only be stopped by a reload.
  else if (started) window.location.reload();
}

const REOPEN_EVENT = 'gw-cookie-consent-reopen';

/** Show the banner again so the visitor can change their choice. */
export function reopenConsent() {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function onReopenConsent(listener: () => void) {
  window.addEventListener(REOPEN_EVENT, listener);
  return () => window.removeEventListener(REOPEN_EVENT, listener);
}

/** Call once at startup: trackers load only for visitors who already accepted. */
export function initAnalytics() {
  if (hasTracking() && getConsent() === 'granted') startTracking();
}

function startTracking() {
  if (started || !hasTracking()) return;
  started = true;

  if (PIXEL_ID) {
    // Same contract as Meta's official snippet: queue calls until fbevents.js
    // has loaded, then hand them to the `callMethod` it installs.
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }) as FbqStub;
    fbq.push = fbq;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    window._fbq = fbq;
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }

  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    // gtag.js expects the raw `arguments` object in the data layer.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
  }

  // Count every click on a WhatsApp or phone link as a conversion.
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]');
    const href = link?.getAttribute('href') ?? '';
    if (href.includes('wa.me') || href.includes('api.whatsapp.com')) {
      track('Contact', 'whatsapp_click', { method: 'whatsapp' });
    } else if (href.startsWith('tel:')) {
      track('Contact', 'phone_click', { method: 'phone' });
    }
  });
}

/** A visitor sent the project form. */
export function trackLead() {
  track('Lead', 'generate_lead');
}
