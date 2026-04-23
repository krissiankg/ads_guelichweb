import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  Sparkles, 
  Gift, 
  Calendar, 
  ArrowRight, 
  Star, 
  Rocket, 
  User, 
  Mail, 
  MessageSquare, 
  Globe, 
  Phone,
  ArrowLeft
} from 'lucide-react';
import { supabase, SITE_SETTING_CONTEST_DEADLINE, DEFAULT_CONTEST_DEADLINE } from '../lib/supabase';
import { Language, getTranslation } from '../translations';
import { toast } from 'react-hot-toast';

interface ContestPageProps {
  language: Language;
  onClose: () => void;
}

export const ContestPage: React.FC<ContestPageProps> = ({ language, onClose }) => {
  const t = getTranslation(language);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    companyName: '',
    sector: '',
    hasClients: false,
    hasSocialMedia: false,
    activityDescription: '',
    whyWin: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [contestDeadlineIso, setContestDeadlineIso] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', SITE_SETTING_CONTEST_DEADLINE)
        .maybeSingle();
      if (!cancelled && data?.value) setContestDeadlineIso(data.value);
    })();
    return () => { cancelled = true; };
  }, []);

  const formattedClosingDate = useMemo(() => {
    const raw = contestDeadlineIso ?? DEFAULT_CONTEST_DEADLINE;
    const d = new Date(`${raw}T12:00:00`);
    if (Number.isNaN(d.getTime())) {
      return t.contest.deadline.split(':').pop()?.trim() ?? raw;
    }
    return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [contestDeadlineIso, language, t.contest.deadline]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new FormData(e.currentTarget).get('_honey')) return; // Anti-spam Honeypot

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contest_submissions')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          whatsapp: formData.whatsapp,
          company_name: formData.companyName,
          sector: formData.sector,
          has_clients: formData.hasClients,
          has_social_media: formData.hasSocialMedia,
          activity_description: formData.activityDescription,
          why_win: formData.whyWin,
        }]);

      if (error) throw error;
      toast.success(t.contest.form.success, { duration: 5000 });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting contest application:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.', { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
              <Check className="text-white w-12 h-12" strokeWidth={3} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">{t.contest.form.success}</h2>
            <p className="text-slate-600 text-lg">{t.contest.form.redirecting}</p>
          </div>

          <div className="pt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
              {t.contest.backToHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-100/50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={onClose}
            className="mb-12 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </div>
            <span>{t.contest.backToHome}</span>
          </button>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center space-x-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-2">
                <Sparkles size={16} className="text-amber-600" />
                <span className="text-sm font-bold text-amber-700 tracking-wide uppercase">Concours Guelichweb</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
                {t.contest.title.split(' ').map((word, i) => (
                  <span key={i} className={i >= 3 ? "bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                {t.contest.subtitle}
              </p>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xl shadow-slate-200/50 flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                  <Rocket className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg leading-tight mb-1">
                    {t.contest.highlight}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-50 bg-slate-200 overflow-hidden ring-2 ring-amber-400/20">
                      <img src={`https://i.pravatar.cc/150?u=guelich${i}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-slate-50 bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                    +42
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Déjà <span className="text-slate-900 font-bold">42 entrepreneurs</span> inscrits
                </p>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100">
                  <div className="absolute -top-6 -right-6 bg-orange-600 text-white font-black px-6 py-3 rounded-2xl shadow-xl rotate-12 flex items-center space-x-2">
                    <Star size={20} fill="currentColor" />
                    <span>GRATUIT</span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <Gift className="mr-3 text-amber-500" />
                    {t.contest.prizesTitle}
                  </h3>

                  <div className="space-y-4">
                    {[
                      { text: t.contest.prize1, icon: Globe },
                      { text: t.contest.prize2, icon: Sparkles },
                      { text: t.contest.prize3, icon: Rocket },
                      { text: t.contest.prize4, icon: Star },
                      { text: t.contest.prize5, icon: MessageSquare },
                    ].map((prize, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-amber-200 transition-colors">
                          <prize.icon size={20} className="text-slate-400 group-hover:text-amber-500" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{prize.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 uppercase tracking-widest font-black mb-1">Valeur estimée</p>
                      <p className="text-3xl font-black text-slate-900">300 000 FCFA</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-orange-600 font-bold">
                        <Calendar size={18} className="mr-2" />
                        <span>{t.contest.deadlinePrefix} {formattedClosingDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="contest-form" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Candidature au Concours</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Remplissez chaque champ avec soin. Nous recherchons des projets porteurs de sens et d'ambition.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 space-y-10">
            <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nom Complet */}
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                  <User size={16} className="mr-2 text-amber-500" />
                  {t.contest.form.fullName}
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl outline-none transition-all duration-300 placeholder-slate-400 font-medium text-slate-800"
                />
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                  <Mail size={16} className="mr-2 text-amber-500" />
                  {t.contest.form.email}
                </label>
                <input
                  required
                  type="email"
                  placeholder="jean@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl outline-none transition-all duration-300 placeholder-slate-400 font-medium text-slate-800"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                  <Phone size={16} className="mr-2 text-amber-500" />
                  {t.contest.form.whatsapp}
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+229 XX XX XX XX"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl outline-none transition-all duration-300 placeholder-slate-400 font-medium text-slate-800"
                />
              </div>

              {/* Nom Entreprise */}
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                  <Rocket size={16} className="mr-2 text-amber-500" />
                  {t.contest.form.companyName}
                </label>
                <input
                  required
                  type="text"
                  placeholder="Nom de votre projet"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl outline-none transition-all duration-300 placeholder-slate-400 font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Secteur */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {t.contest.form.sector}
              </label>
              <input
                required
                type="text"
                placeholder="Ex: E-commerce, Restauration, Services..."
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl outline-none transition-all duration-300 placeholder-slate-400 font-medium text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              {/* Deja des clients */}
              <div className="space-y-4">
                <p className="font-bold text-slate-900">{t.contest.form.hasClients}</p>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, hasClients: true})}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 ${formData.hasClients ? 'bg-amber-100 text-amber-700 border-2 border-amber-400' : 'bg-slate-50 text-slate-600 border-2 border-transparent'}`}
                  >
                    {t.contest.form.yes}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, hasClients: false})}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 ${!formData.hasClients ? 'bg-amber-100 text-amber-700 border-2 border-amber-400' : 'bg-slate-50 text-slate-600 border-2 border-transparent'}`}
                  >
                    {t.contest.form.no}
                  </button>
                </div>
              </div>

              {/* Reseaux Sociaux */}
              <div className="space-y-4">
                <p className="font-bold text-slate-900">{t.contest.form.hasSocialMedia}</p>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, hasSocialMedia: true})}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 ${formData.hasSocialMedia ? 'bg-amber-100 text-amber-700 border-2 border-amber-400' : 'bg-slate-50 text-slate-600 border-2 border-transparent'}`}
                  >
                    {t.contest.form.yes}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, hasSocialMedia: false})}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 ${!formData.hasSocialMedia ? 'bg-amber-100 text-amber-700 border-2 border-amber-400' : 'bg-slate-50 text-slate-600 border-2 border-transparent'}`}
                  >
                    {t.contest.form.no}
                  </button>
                </div>
              </div>
            </div>

            {/* Description Activité */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                <MessageSquare size={16} className="mr-2 text-amber-500" />
                {t.contest.form.description}
              </label>
              <textarea
                required
                rows={4}
                value={formData.activityDescription}
                onChange={(e) => setFormData({...formData, activityDescription: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl outline-none transition-all duration-300 placeholder-slate-400 font-medium text-slate-800 resize-none"
              />
            </div>

            {/* Pourquoi Gagner */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                <Star size={16} className="mr-2 text-amber-500" />
                {t.contest.form.whyWin}
              </label>
              <textarea
                required
                rows={4}
                value={formData.whyWin}
                onChange={(e) => setFormData({...formData, whyWin: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl outline-none transition-all duration-300 placeholder-slate-400 font-medium text-slate-800 resize-none"
              />
            </div>


            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300 group-disabled:opacity-0"></div>
                <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 text-white py-6 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-70 disabled:translate-y-0 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{t.contest.form.submit}</span>
                      <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
              
              <p className="text-center mt-6 text-slate-400 text-sm font-medium leading-relaxed">
                {t.contest.form.consent}
              </p>
            </div>
          </form>
        </div>
      </section>
      
      {/* Testimonials or social proof can be added here if needed */}
    </div>
  );
};
