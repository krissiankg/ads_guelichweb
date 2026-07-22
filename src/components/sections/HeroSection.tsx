import { Sparkles } from 'lucide-react';

interface HeroSectionProps {
  t: any;
}

export function HeroSection({ t }: HeroSectionProps) {
  return (
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
  );
}
