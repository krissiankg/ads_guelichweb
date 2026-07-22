import { Language } from '../../translations';
import { PortfolioContent } from './PortfolioContent';

interface PortfolioSectionProps {
  t: any;
  language: Language;
}

export function PortfolioSection({ t, language }: PortfolioSectionProps) {
  return (
    <section id="portfolio" className="py-20 px-4 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            {t.portfolio.title}
          </h3>
          <p className="text-slate-600 mb-12 text-xl font-light">
            {t.portfolio.subtitle}
          </p>
        </div>
        
        <PortfolioContent language={language} />

        <div className="flex justify-center items-center mt-12">
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
  );
}
