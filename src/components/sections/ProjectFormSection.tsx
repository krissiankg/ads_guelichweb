import { Phone, Mail, MapPin, ChevronDown, User, MessageSquare } from 'lucide-react';
import { services, benefits } from '../../lib/constants';

interface ProjectFormSectionProps {
  t: any;
  formData: any;
  setFormData: (data: any) => void;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setShowPrivacyModal: (val: boolean) => void;
}

export function ProjectFormSection({ t, formData, setFormData, handleFormSubmit, setShowPrivacyModal }: ProjectFormSectionProps) {
  return (
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
              <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
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
  );
}
