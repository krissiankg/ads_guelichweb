import { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { Language } from '../../translations';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  setIsAdminRoute: (val: boolean) => void;
  setIsContestRoute: (val: boolean) => void;
  t: any;
}

export function Header({
  language,
  setLanguage,
  setIsAdminRoute,
  setIsContestRoute,
  t
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 fixed w-full top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button 
              onClick={() => {
                setIsAdminRoute(false);
                setIsContestRoute(false);
                window.history.pushState({}, '', '/');
              }}
              className="flex items-center"
            >
              <img
                src="/logo_couleur.png"
                alt="GUELICHWEB"
                className="h-12 w-auto object-contain"
              />
            </button>
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
            <button
              onClick={() => {
                setIsContestRoute(true);
                window.history.pushState({}, '', '/contest');
              }}
              className="relative group overflow-hidden bg-white border-2 border-amber-500 text-amber-600 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:bg-amber-50 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <Sparkles size={18} className="text-amber-500 animate-pulse" />
              <span>{t.contest.navButton}</span>
            </button>

            <a
              href="#portfolio"
              className="text-slate-700 hover:text-blue-600 font-medium transition-all duration-300 px-4 py-2 rounded-xl hover:bg-slate-100 flex items-center space-x-2"
            >
              <span>{t.header.portfolio}</span>
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
            <button
              onClick={() => {
                setIsAdminRoute(false);
                setIsContestRoute(false);
                setMobileMenuOpen(false);
                window.history.pushState({}, '', '/');
              }}
              className="block w-full text-left text-slate-900 font-black px-2 py-3 border-b border-slate-100 uppercase tracking-wider text-xs"
            >
              {t.header.home}
            </button>
            <button
              onClick={() => {
                setIsContestRoute(true);
                setMobileMenuOpen(false);
                window.history.pushState({}, '', '/contest');
              }}
              className="flex items-center space-x-2 w-full text-amber-600 font-bold px-2 py-3 bg-amber-50 rounded-xl border border-amber-200 shadow-sm shadow-amber-500/10"
            >
              <Sparkles size={18} className="text-amber-500 animate-pulse" />
              <span>{t.contest.navButton}</span>
            </button>


              <a
                href="#portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg"
              >
                {t.header.portfolio}
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
  );
}
