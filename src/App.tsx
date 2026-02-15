import { useState, useEffect } from 'react';
import { Menu, X, Check, Phone, Mail, MapPin, Clock, ChevronDown, User, MessageSquare, Sparkles, Shield, Zap, Target, Award, Lock } from 'lucide-react';
import { getTranslation, Language } from './translations';
import { PortfolioModal } from './components/PortfolioModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './lib/supabase';

function App() {
  const [language, setLanguage] = useState<Language>('fr');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [currentPortfolioIndex, setCurrentPortfolioIndex] = useState(0);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setIsAdminRoute(true);
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
  const [newsletterData, setNewsletterData] = useState({
    name: '',
    email: '',
    consent: false,
  });

  const services = [
    { id: 'website', labelKey: 'website', badge: 'popular', icon: '🌐', gradient: 'from-blue-500 to-cyan-400' },
    { id: 'mobile', labelKey: 'mobile', badge: '', icon: '📱', gradient: 'from-indigo-500 to-blue-400' },
    { id: 'startup', labelKey: 'startup', badge: 'hot', icon: '🚀', gradient: 'from-violet-500 to-purple-400' },
    { id: 'seo', labelKey: 'seo', badge: '', icon: '📈', gradient: 'from-emerald-500 to-teal-400' },
    { id: 'ecommerce', labelKey: 'ecommerce', badge: '', icon: '🛒', gradient: 'from-orange-500 to-amber-400' },
    { id: 'other', labelKey: 'other', badge: '', icon: '💡', gradient: 'from-pink-500 to-rose-400' },
  ];

  const benefits = [
    {
      titleKey: 'benefit1Title',
      descKey: 'benefit1Desc',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      titleKey: 'benefit2Title',
      descKey: 'benefit2Desc',
      icon: Shield,
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      titleKey: 'benefit3Title',
      descKey: 'benefit3Desc',
      icon: Target,
      gradient: 'from-violet-500 to-purple-400',
    },
    {
      titleKey: 'benefit4Title',
      descKey: 'benefit4Desc',
      icon: Award,
      gradient: 'from-orange-500 to-amber-400',
    },
  ];

  const portfolioProjects = [
    'Afrique Mobilités',
    'Ayawood France',
    'Ayawood Main',
    'CEC-TI SARL',
    'CLIRAP TOGO',
    'CRI-CD',
    'Kayida House',
    'Numerex',
    'Sakira Braiding',
    'Soproem',
    'Tata Koko',
    'Top Revolution Barber Shop',
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(t.projectForm.successMessage);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        alert(t.newsletter.successMessage);
        setNewsletterData({ name: '', email: '', consent: false });
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue lors de l\'inscription');
    }
  };

  if (checkingAuth) {
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
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 fixed w-full top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <a href="#" className="flex items-center">
                <img
                  src="/logo_couleur.png"
                  alt="GUELICHWEB"
                  className="h-12 w-auto object-contain"
                />
              </a>
              <div className="ml-8 hidden md:flex items-center space-x-1 text-sm">
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${language === 'fr'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  FR
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${language === 'en'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#contact"
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
              >
                {t.header.freeQuote}
              </a>
              <button
                onClick={() => document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="relative z-10">{t.header.startProject}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-200">
              <div className="flex items-center space-x-2 px-2 py-2">
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${language === 'fr'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${language === 'en'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  EN
                </button>
              </div>
              <a href="#contact" className="block text-slate-700 hover:text-blue-600 font-medium px-2 py-2">
                {t.header.freeQuote}
              </a>
              <button
                onClick={() => {
                  document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
              >
                {t.header.startProject}
              </button>
            </div>
          )}
        </nav>
      </header>

      <main className="pt-20">
        <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8">
              <Sparkles size={16} className="text-cyan-300" />
              <span className="text-sm font-medium text-white/90">{t.hero.badge}</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              {t.hero.title1} <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent">{t.hero.titleHighlight1}</span> {t.hero.title2}<br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">{t.hero.titleHighlight2}</span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto font-light">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <button
                onClick={() => document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10">{t.hero.cta1}</span>
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="relative bg-white/5 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                {t.hero.cta2}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{t.hero.stat1}</div>
                <div className="text-blue-100 font-medium">{t.hero.stat1Label}</div>
              </div>
              <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{t.hero.stat2}</div>
                <div className="text-blue-100 font-medium">{t.hero.stat2Label}</div>
              </div>
              <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{t.hero.stat3}</div>
                <div className="text-blue-100 font-medium">{t.hero.stat3Label}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                {t.services.title}
              </h3>
              <p className="text-slate-600 text-xl font-light">
                {t.services.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const serviceLabel = t.services[service.labelKey as keyof typeof t.services] as string;
                const badgeText = service.badge === 'popular' ? t.services.badgePopular : service.badge === 'hot' ? t.services.badgeHot : '';
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.id);
                      setFormData({ ...formData, projectType: serviceLabel });
                      document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${selectedService === service.id
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl shadow-blue-500/10'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
                      }`}
                  >
                    {service.badge && (
                      <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full ${service.badge === 'popular'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                        }`}>
                        {badgeText}
                      </div>
                    )}
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{serviceLabel}</h4>
                    {selectedService === service.id && (
                      <div className={`absolute bottom-4 right-4 w-8 h-8 rounded-full bg-gradient-to-r ${service.gradient} flex items-center justify-center shadow-lg`}>
                        <Check className="text-white" size={18} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="project-form" className="py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                {t.projectForm.title}
              </h3>
              <p className="text-slate-600 text-xl font-light">
                {t.projectForm.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-6">{t.projectForm.whyChoose}</h4>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => {
                      const IconComponent = benefit.icon;
                      const title = t.projectForm[benefit.titleKey as keyof typeof t.projectForm] as string;
                      const desc = t.projectForm[benefit.descKey as keyof typeof t.projectForm] as string;
                      return (
                        <div key={index} className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-white transition-all duration-300">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="text-white" size={24} />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 mb-1">{title}</h5>
                            <p className="text-slate-600 text-sm">{desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h5 className="font-bold text-slate-900 mb-4">{t.projectForm.needHelp}</h5>
                  <div className="space-y-3">
                    <a href="tel:+2290166368705" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors group">
                      <Phone className="group-hover:scale-110 transition-transform" size={18} />
                      <span className="font-medium">+229 01 66 36 87 05</span>
                    </a>
                    <a href="mailto:christ@guelichweb.online" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors group">
                      <Mail className="group-hover:scale-110 transition-transform" size={18} />
                      <span className="font-medium">christ@guelichweb.online</span>
                    </a>
                    <div className="flex items-center space-x-3 text-slate-600">
                      <MapPin size={18} />
                      <span className="font-medium">Abomey-Calavi, Bénin</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/5 p-8 md:p-10 border border-slate-200/60">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <User size={16} className="mr-2 text-blue-600" />
                      {t.projectForm.fullName} <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-slate-50 hover:bg-white"
                      placeholder={t.projectForm.placeholderName}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <Mail size={16} className="mr-2 text-blue-600" />
                        {t.projectForm.email} <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-slate-50 hover:bg-white"
                        placeholder={t.projectForm.placeholderEmail}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <Phone size={16} className="mr-2 text-blue-600" />
                        {t.projectForm.phone}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-slate-50 hover:bg-white"
                        placeholder={t.projectForm.placeholderPhone}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="projectType" className="block text-sm font-semibold text-slate-700 mb-2">
                      {t.projectForm.projectType} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="projectType"
                        required
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 appearance-none bg-slate-50 hover:bg-white"
                      >
                        <option value="">{t.projectForm.placeholderProjectType}</option>
                        {services.map((service) => {
                          const serviceLabel = t.services[service.labelKey as keyof typeof t.services] as string;
                          return (
                            <option key={service.id} value={serviceLabel}>
                              {serviceLabel}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-semibold text-slate-700 mb-2">
                      {t.projectForm.budget}
                    </label>
                    <select
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 appearance-none bg-slate-50 hover:bg-white"
                    >
                      <option value="">{t.projectForm.placeholderBudget}</option>
                      <option value="not-specified">{t.projectForm.budget0}</option>
                      <option value="0-200000">{t.projectForm.budget1}</option>
                      <option value="200000-500000">{t.projectForm.budget2}</option>
                      <option value="500000-1000000">{t.projectForm.budget3}</option>
                      <option value="1000000-3000000">{t.projectForm.budget4}</option>
                      <option value="3000000-5000000">{t.projectForm.budget5}</option>
                      <option value="5000000+">{t.projectForm.budget6}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <MessageSquare size={16} className="mr-2 text-blue-600" />
                      {t.projectForm.description}
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 resize-none bg-slate-50 hover:bg-white"
                      placeholder={t.projectForm.placeholderDescription}
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="consent" className="ml-3 text-sm text-slate-600 leading-relaxed">
                      {t.projectForm.consent}{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        {t.projectForm.privacyPolicy}
                      </button>
                      . <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <span className="relative z-10">{t.projectForm.submit}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              {t.portfolio.title}
            </h3>
            <p className="text-slate-600 mb-12 text-xl font-light">
              {t.portfolio.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowPortfolioModal(true)}
                className="relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
              >
                {t.portfolio.cta}
              </button>
              <a
                href="https://www.guelichweb.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {t.portfolio.officialWebsite}
              </a>
            </div>
          </div>
        </section>

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

        <section id="contact" className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-16 tracking-tight">
              {t.contact.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 transform hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="text-white" size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{t.contact.phone}</h4>
                <a href="tel:+2290166368705" className="text-blue-600 hover:text-blue-700 font-medium">
                  +229 01 66 36 87 05
                </a>
              </div>

              <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50 border border-slate-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 transform hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 mb-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="text-white" size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{t.contact.email}</h4>
                <a href="mailto:christ@guelichweb.online" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  christ@guelichweb.online
                </a>
              </div>

              <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50 border border-slate-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 transform hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 mb-4 shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="text-white" size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{t.contact.location}</h4>
                <p className="text-violet-600 font-medium">{t.contact.locationValue}</p>
              </div>

              <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50 border border-slate-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 transform hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 mb-4 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="text-white" size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{t.contact.hours}</h4>
                <p className="text-orange-600 font-medium">{t.contact.hoursValue}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="mb-6">
                <img
                  src="/logo_couleur.png"
                  alt="GUELICHWEB"
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-slate-400 leading-relaxed">
                {t.footer.tagline}
              </p>
            </div>

            <div>
              <h5 className="font-bold mb-4 text-lg">{t.footer.services}</h5>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">{t.footer.service1}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t.footer.service2}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t.footer.service3}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t.footer.service4}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t.footer.service5}</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4 text-lg">{t.footer.legal}</h5>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {t.footer.privacy}
                  </button>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    {t.footer.terms}
                  </a>
                </li>
                <li>
                  <a href="/admin" className="text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-2 text-sm">
                    <Lock size={14} />
                    Admin
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="text-center text-slate-400">
              <p className="mb-2">&copy; {new Date().getFullYear()} GUELICHWEB. {t.footer.copyright}</p>
              <p className="text-sm">{t.contact.locationValue} | christ@guelichweb.online | privacy@guelichweb.online</p>
            </div>
          </div>
        </div>
      </footer>

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
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {t.privacy.section1Content}
                </p>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section2Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {t.privacy.section2Content}
                </p>
                <ul className="list-disc pl-6 mb-6 text-slate-600 space-y-2">
                  <li>{t.privacy.section2Item1}</li>
                  <li>{t.privacy.section2Item2}</li>
                  <li>{t.privacy.section2Item3}</li>
                  <li>{t.privacy.section2Item4}</li>
                </ul>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section3Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {t.privacy.section3Content}
                </p>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section4Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {t.privacy.section4Content}
                </p>

                <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">{t.privacy.section5Title}</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {t.privacy.section5Content}
                </p>
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
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {t.privacy.section7Content}
                </p>
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

      <PortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        language={language}
      />

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
    </div>
  );
}

export default App;
