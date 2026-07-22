import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { getTranslation, Language } from './translations';

import { ConfirmModal } from './components/ConfirmModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { ContestPage } from './components/ContestPage';
import { supabase } from './lib/supabase';
import { Toaster, toast } from 'react-hot-toast';

// Layout & Sections
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { ServicesSection } from './components/sections/ServicesSection';
import { PortfolioSection } from './components/sections/PortfolioSection';
import { ProjectFormSection } from './components/sections/ProjectFormSection';
import { NewsletterSection } from './components/sections/NewsletterSection';
import { ContactSection } from './components/sections/ContactSection';

function App() {
  const [language, setLanguage] = useState<Language>('fr');
  const [selectedService, setSelectedService] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const path = window.location.pathname;
    return path === '/admin' || path === '/admin/';
  });
  const [isContestRoute, setIsContestRoute] = useState(() => {
    const path = window.location.pathname;
    return path === '/contest' || path === '/contest/';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setIsAdminRoute(true);
    }
    if (path === '/contest' || path === '/contest/') {
      setIsContestRoute(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .eq('is_active', true)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setIsAdminAuthenticated(true);
            }
          });
      }
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAdminAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dynamic page title
  useEffect(() => {
    document.title = isAdminRoute && isAdminAuthenticated
      ? 'Admin — GUELICHWEB'
      : 'GUELICHWEB — Agence Web, Design & Vidéo';
  }, [isAdminRoute, isAdminAuthenticated]);

  const t = getTranslation(language);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+229',
    projectType: '',
    budget: '',
    description: '',
    consent: false,
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false, title: '', message: '', type: 'info', onConfirm: () => { }
  });

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new FormData(e.currentTarget).get('_honey')) return; // Anti-spam Honeypot

    try {
      const { error } = await supabase
        .from('project_submissions')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          project_type: formData.projectType,
          budget: formData.budget,
          description: formData.description,
          consent: formData.consent,
        }]);

      if (error) throw error;
      toast.success(t.projectForm.successMessage, { duration: 5000 });
      setFormData({ name: '', email: '', phone: '+229', projectType: '', budget: '', description: '', consent: false });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Une erreur est survenue lors de l\'envoi du formulaire. Veuillez réessayer.', { duration: 5000 });
    }
  };

  const handleServiceSelect = (serviceId: string, serviceLabel: string) => {
    setSelectedService(serviceId);
    setFormData({ ...formData, projectType: serviceLabel });
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Only show full page loader if we are explicitly trying to access the admin area
  if (checkingAuth && isAdminRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} language={language} />;
    }
    return <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} language={language} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header 
        language={language}
        setLanguage={setLanguage}
        setIsAdminRoute={setIsAdminRoute}
        setIsContestRoute={setIsContestRoute}
        t={t}
      />

      <main className="pt-20">
        {isContestRoute ? (
          <ContestPage 
            language={language} 
            onClose={() => {
              setIsContestRoute(false);
              window.history.pushState({}, '', '/');
            }} 
          />
        ) : (
          <>
            <HeroSection t={t} />
            <ServicesSection t={t} selectedService={selectedService} onSelect={handleServiceSelect} />
            <ProjectFormSection 
              t={t} 
              formData={formData} 
              setFormData={setFormData} 
              handleFormSubmit={handleFormSubmit} 
              setShowPrivacyModal={setShowPrivacyModal} 
            />
            <PortfolioSection t={t} language={language} />
            <NewsletterSection t={t} language={language} />
            <ContactSection t={t} />
          </>
        )}
      </main>

      {!isContestRoute && (
        <Footer t={t} setShowPrivacyModal={setShowPrivacyModal} />
      )}

      {/* Floating Contest Badge */}
      {!isAdminRoute && !isContestRoute && (
        <button
          onClick={() => setIsContestRoute(true)}
          className="fixed bottom-6 left-6 z-50 group flex items-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 text-white p-4 rounded-full shadow-2xl shadow-amber-500/40 hover:shadow-orange-500/60 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
              <Gift className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm border border-amber-100 px-5 py-3 rounded-2xl shadow-2xl ml-4 transform transition-all duration-300 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 pointer-events-none">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
            <p className="text-amber-900 font-extrabold text-sm whitespace-nowrap tracking-wide">
              {t.contest.floatingBadge}
            </p>
          </div>
        </button>
      )}

      <a
        href="https://wa.me/2290166368705"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Contact WhatsApp"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </div>
        </div>
      </a>

      {!isContestRoute && (
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15860.038706346766!2d2.3451554999999997!3d6.393438450000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023559312c9c729%3A0xc3995878864f1642!2sPharmacie%20Aitchedji!5e0!3m2!1sfr!2sbj!4v1709494444444!5m2!1sfr!2sbj" width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
      )}

      {/* Modals */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center rounded-t-3xl">
              <h3 className="text-2xl font-bold text-slate-900">{t.privacy.title}</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="px-8 py-8">
              <div className="prose max-w-none">
                <p className="text-slate-600 mb-6"><strong>{t.privacy.updateDate}</strong> 28 {language === 'fr' ? 'janvier' : 'January'} 2026</p>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section1Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">{t.privacy.section1Content}</p>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section2Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">{t.privacy.section2Content}</p>
                <ul className="list-disc pl-6 mb-6 text-slate-600 space-y-2">
                  <li>{t.privacy.section2Item1}</li>
                  <li>{t.privacy.section2Item2}</li>
                  <li>{t.privacy.section2Item3}</li>
                  <li>{t.privacy.section2Item4}</li>
                </ul>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section3Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">{t.privacy.section3Content}</p>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section4Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">{t.privacy.section4Content}</p>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section5Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">{t.privacy.section5Content}</p>
                <ul className="list-disc pl-6 mb-6 text-slate-600 space-y-2">
                  <li>{t.privacy.section5Item1}</li>
                  <li>{t.privacy.section5Item2}</li>
                  <li>{t.privacy.section5Item3}</li>
                  <li>{t.privacy.section5Item4}</li>
                  <li>{t.privacy.section5Item5}</li>
                  <li>{t.privacy.section5Item6}</li>
                </ul>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section6Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {t.privacy.section6Content}<br />
                  <strong>{t.contact.email}:</strong> privacy@guelichweb.online<br />
                  <strong>{t.contact.phone}:</strong> +229 01 66 36 87 05
                </p>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section7Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">{t.privacy.section7Content}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-6 rounded-b-3xl">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                {t.privacy.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        language={language}
      />
      <Toaster position="bottom-right" toastOptions={{
        className: 'font-sans font-medium rounded-2xl shadow-xl border border-slate-100',
        success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
        error: { iconTheme: { primary: '#ef4444', secondary: 'white' } }
      }} />
    </div>
  );
}

export default App;
