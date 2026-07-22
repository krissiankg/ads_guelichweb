import { Zap, Shield, Target, Award } from 'lucide-react';

export const services = [
  { id: 'website', labelKey: 'website', badge: 'popular', icon: '🌐', gradient: 'from-blue-500 to-cyan-400' },
  { id: 'mobile', labelKey: 'mobile', badge: '', icon: '📱', gradient: 'from-indigo-500 to-blue-400' },
  { id: 'startup', labelKey: 'startup', badge: 'hot', icon: '🚀', gradient: 'from-violet-500 to-purple-400' },
  { id: 'seo', labelKey: 'seo', badge: '', icon: '📈', gradient: 'from-emerald-500 to-teal-400' },
  { id: 'ecommerce', labelKey: 'ecommerce', badge: '', icon: '🛒', gradient: 'from-orange-500 to-amber-400' },
  { id: 'auditIA', labelKey: 'auditIA', badge: '', icon: '🔍', gradient: 'from-cyan-500 to-blue-400' },
  { id: 'automationIA', labelKey: 'automationIA', badge: 'hot', icon: '🤖', gradient: 'from-purple-500 to-fuchsia-400' },
  { id: 'transformationDigitale', labelKey: 'transformationDigitale', badge: '', icon: '⚡', gradient: 'from-amber-500 to-yellow-400' },
  { id: 'other', labelKey: 'other', badge: '', icon: '💡', gradient: 'from-pink-500 to-rose-400' },
];

export const benefits = [
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
