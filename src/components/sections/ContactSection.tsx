import { Phone, Mail, MapPin, Clock } from 'lucide-react';

interface ContactSectionProps {
  t: any;
}

export function ContactSection({ t }: ContactSectionProps) {
  return (
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
  );
}
