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
    <div role="dialog" aria-label={t.label} className="fixed bottom-0 inset-x-0 z-[60] p-4">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm text-slate-700 leading-relaxed flex-grow">
          {t.message}{' '}
          <button type="button" onClick={onOpenPolicy} className="text-blue-600 underline underline-offset-2">
            {t.policy}
          </button>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            {t.refuse}
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
