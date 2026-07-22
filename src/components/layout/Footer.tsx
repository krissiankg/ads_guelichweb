import { Phone, Mail, MapPin, Clock, Lock } from 'lucide-react';

interface FooterProps {
  t: any;
  setShowPrivacyModal: (val: boolean) => void;
}

export function Footer({ t, setShowPrivacyModal }: FooterProps) {
  return (
    <>
      {/* Footer CTA Banner */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-72 h-72 -top-36 -left-36 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute w-72 h-72 -bottom-36 -right-36 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            {t.footer.ctaTitle}
          </h3>
          <p className="text-blue-100 text-lg mb-8 font-light">
            {t.footer.ctaSubtitle}
          </p>
          <button
            onClick={() => document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="relative z-10">{t.footer.ctaButton}</span>
          </button>
        </div>
      </section>

      <footer className="relative bg-slate-950 text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Column 1: Brand */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img
                  src="/logo_couleur.png"
                  alt="GUELICHWEB"
                  className="h-14 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-slate-400 leading-relaxed mb-8 text-sm">
                {t.footer.tagline}
              </p>
              {/* Social Links */}
              <div>
                <h6 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">{t.footer.followUs}</h6>
                <div className="flex items-center space-x-3">
                  <a href="https://wa.me/2290166368705" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center hover:bg-green-500 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  </a>
                  <a href="https://www.linkedin.com/company/guelichweb" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                  <a href="https://www.instagram.com/guelichweb" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:border-pink-400 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </a>
                  <a href="https://www.facebook.com/guelichweb" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center hover:bg-blue-700 hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-700/25">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Services */}
            <div>
              <h5 className="font-bold mb-6 text-lg relative">
                <span className="relative">
                  {t.footer.services}
                  <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></span>
                </span>
              </h5>
              <ul className="space-y-3">
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mr-3 group-hover:bg-blue-400 transition-colors"></span>{t.footer.service1}</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mr-3 group-hover:bg-blue-400 transition-colors"></span>{t.footer.service2}</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mr-3 group-hover:bg-blue-400 transition-colors"></span>{t.footer.service3}</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-violet-500/50 mr-3 group-hover:bg-violet-400 transition-colors"></span>{t.footer.service4}</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-violet-500/50 mr-3 group-hover:bg-violet-400 transition-colors"></span>{t.footer.service5}</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-violet-500/50 mr-3 group-hover:bg-violet-400 transition-colors"></span>{t.footer.service6}</span></li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div>
              <h5 className="font-bold mb-6 text-lg relative">
                <span className="relative">
                  {t.footer.solutions}
                  <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></span>
                </span>
              </h5>
              <ul className="space-y-3">
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mr-3 group-hover:bg-emerald-400 transition-colors"></span>{t.footer.solution1}</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mr-3 group-hover:bg-emerald-400 transition-colors"></span>{t.footer.solution2}</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mr-3 group-hover:bg-emerald-400 transition-colors"></span>{t.footer.solution3}</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mr-3 group-hover:bg-emerald-400 transition-colors"></span>{t.footer.solution4}</span></li>
              </ul>

              {/* Legal */}
              <h5 className="font-bold mb-4 text-lg mt-8 relative">
                <span className="relative">
                  {t.footer.legal}
                  <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-transparent rounded-full"></span>
                </span>
              </h5>
              <ul className="space-y-3 mt-4">
                <li>
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {t.footer.privacy}
                  </button>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                    {t.footer.terms}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h5 className="font-bold mb-6 text-lg relative">
                <span className="relative">
                  {t.footer.contact}
                  <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></span>
                </span>
              </h5>
              <div className="space-y-4">
                <a href="tel:+2290166368705" className="flex items-center space-x-3 text-slate-400 hover:text-white transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:border-blue-500/30 transition-all duration-300">
                    <Phone size={16} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">+229 01 66 36 87 05</span>
                </a>
                <a href="mailto:christ@guelichweb.online" className="flex items-center space-x-3 text-slate-400 hover:text-white transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:bg-emerald-600/20 group-hover:border-emerald-500/30 transition-all duration-300">
                    <Mail size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">christ@guelichweb.online</span>
                </a>
                <div className="flex items-center space-x-3 text-slate-400">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
                    <MapPin size={16} className="text-violet-400" />
                  </div>
                  <span className="text-sm font-medium">{t.contact.locationValue}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <span className="text-sm font-medium">{t.contact.hoursValue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800/80 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-2 text-slate-500 text-sm">
                <span>&copy; {new Date().getFullYear()} GUELICHWEB.</span>
                <span>{t.footer.copyright}</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-500 text-sm">
                <span>{t.footer.madeWith}</span>
                <span className="text-red-500 animate-pulse">❤️</span>
                <span>{t.footer.inBenin}</span>
                <span className="mx-2 text-slate-700">•</span>
                <a href="/admin" className="text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1.5">
                  <Lock size={12} />
                  <span>Admin</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
