import { Check, MessageCircle, Globe, ShoppingBag, Server, Bot, Wallet, ShieldCheck } from 'lucide-react';
import { whatsappLink } from '../../lib/constants';

interface PricingSectionProps {
  t: any;
}

interface PricingItem {
  title: string;
  price: string;
  desc: string;
  features: string[];
  message: string;
}

const itemIcons = [Globe, ShoppingBag];

export function PricingSection({ t }: PricingSectionProps) {
  const p = t.pricing;

  return (
    <section id="tarifs" className="py-20 px-4 bg-white scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">{p.title}</h2>
          <p className="text-slate-600 text-xl font-light">{p.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(p.items as PricingItem[]).map((item, index) => {
            const Icon = itemIcons[index % itemIcons.length];
            const highlight = index === 0;
            return (
              <div
                key={item.title}
                className={`relative p-8 rounded-3xl border-2 flex flex-col ${highlight
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl shadow-blue-500/10'
                  : 'border-slate-200 bg-white'
                  }`}
              >
                {highlight && (
                  <div className="absolute -top-4 left-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                    {p.popular}
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{item.desc}</p>
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">{p.from}</div>
                  <div className="text-4xl md:text-5xl font-extrabold text-slate-900">{item.price}</div>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                      <Check size={16} className="text-emerald-500 mt-1 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={whatsappLink(item.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl font-bold text-center transition-colors bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  {p.cta}
                </a>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
              <Server size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="font-bold text-slate-900">{p.hostingTitle}</h3>
                <span className="text-blue-600 font-bold">{p.hostingPrice}</span>
              </div>
              <p className="text-slate-600 text-sm mt-1">{p.hostingDesc}</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{p.customTitle}</h3>
              <p className="text-slate-600 text-sm mt-1">{p.customDesc}</p>
              <a
                href={whatsappLink(p.customMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm font-bold text-blue-600 hover:underline"
              >
                {p.customCta}
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="flex items-start gap-3 text-sm">
            <Wallet size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-slate-700"><span className="font-bold text-slate-900">{p.paymentTitle} : </span>{p.paymentDesc}</p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <ShieldCheck size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-slate-700"><span className="font-bold text-slate-900">{p.guaranteeTitle} : </span>{p.guaranteeDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
