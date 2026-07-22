import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Language } from '../../translations';

interface NewsletterSectionProps {
  t: any;
  language: Language;
}

export function NewsletterSection({ t, language }: NewsletterSectionProps) {
  const [newsletterData, setNewsletterData] = useState({
    name: '',
    email: '',
    consent: false,
  });

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new FormData(e.currentTarget).get('_honey')) return; // Anti-spam Honeypot

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-subscribe`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name: newsletterData.name,
          email: newsletterData.email,
          consent: newsletterData.consent,
          language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t.newsletter.successMessage, { duration: 5000 });
        setNewsletterData({ name: '', email: '', consent: false });
      } else {
        toast.error(data.error || 'Une erreur est survenue', { duration: 5000 });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue lors de l\'inscription', { duration: 5000 });
    }
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <span className="text-sm font-bold text-white">{t.newsletter.badge}</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t.newsletter.title} <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">{t.newsletter.discount}</span> {t.newsletter.titleEnd}
          </h3>
          <p className="text-xl text-blue-100 font-light">
            {t.newsletter.subtitle}
          </p>
        </div>

        <form onSubmit={handleNewsletterSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6">
          <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <div>
            <input
              type="text"
              value={newsletterData.name}
              onChange={(e) => setNewsletterData({ ...newsletterData, name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all duration-300"
              placeholder={t.newsletter.placeholderName}
            />
          </div>

          <div>
            <input
              type="email"
              required
              value={newsletterData.email}
              onChange={(e) => setNewsletterData({ ...newsletterData, email: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all duration-300"
              placeholder={t.newsletter.placeholderEmail}
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="newsletter-consent"
              required
              checked={newsletterData.consent}
              onChange={(e) => setNewsletterData({ ...newsletterData, consent: e.target.checked })}
              className="mt-1 w-5 h-5 border-white/30 rounded focus:ring-white/50 bg-white/10"
            />
            <label htmlFor="newsletter-consent" className="ml-3 text-sm text-white/90 leading-relaxed">
              {t.newsletter.consent}
            </label>
          </div>

          <button
            type="submit"
            className="w-full relative group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <span className="relative z-10">{t.newsletter.cta}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
