import { useEffect, useState } from 'react';
import { Language } from '../translations';
import { getConsent, hasTracking, onReopenConsent, setConsent } from '../lib/analytics';

const TEXT = {
  fr: {
    message: 'Nous utilisons des cookies de mesure d’audience pour améliorer ce site. Vous pouvez les accepter ou les refuser.',
    policy: 'Politique de confidentialité',
    accept: 'Accepter',
    refuse: 'Refuser',
    label: 'Consentement aux cookies',
  },
  en: {
    message: 'We use audience measurement cookies to improve this site. You can accept or refuse them.',
    policy: 'Privacy policy',
    accept: 'Accept',
    refuse: 'Refuse',
    label: 'Cookie consent',
  },
};

interface CookieBannerProps {
  language: Language;
  onOpenPolicy: () => void;
  /** Hide the banner while another dialog (the privacy policy) is open. */
  hidden?: boolean;
}

/** Shown only when a tracker is configured and the visitor has not chosen yet. */
export function CookieBanner({ language, onOpenPolicy, hidden = false }: CookieBannerProps) {
  const [visible, setVisible] = useState(() => hasTracking() && getConsent() === 'unset');
  useEffect(() => onReopenConsent(() => setVisible(hasTracking())), []);
  if (!visible || hidden) return null;

  const t = TEXT[language];
  const choose = (value: 'granted' | 'denied') => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div role="dialog" aria-label={t.label} className="fixed bottom-4 left-4 z-[55] w-[calc(100%-6.5rem)] max-w-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
        <p className="text-sm text-slate-700 leading-relaxed">
          {t.message}{' '}
          <button type="button" onClick={onOpenPolicy} className="text-blue-600 underline underline-offset-2">
            {t.policy}
          </button>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="flex-1 px-3 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            {t.refuse}
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="flex-1 px-3 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
