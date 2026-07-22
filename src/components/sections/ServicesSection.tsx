import { Check } from 'lucide-react';
import { services } from '../../lib/constants';

interface ServicesSectionProps {
  t: any;
  selectedService: string;
  onSelect: (serviceId: string, serviceLabel: string) => void;
}

export function ServicesSection({ t, selectedService, onSelect }: ServicesSectionProps) {
  return (
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
                onClick={() => onSelect(service.id, serviceLabel)}
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
  );
}
