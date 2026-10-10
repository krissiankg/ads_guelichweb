import { useState, useEffect } from 'react';
import { Lock, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../translations';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  language: Language;
  /** Opened from the "reset password" email link: show the new password form */
  isPasswordRecovery?: boolean;
  onPasswordUpdated?: () => void;
}

const RightSidePresentation = ({ language }: { language: Language }) => (
  <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#EAE91F] via-[#75D875] to-[#25A1A8] relative items-center justify-center overflow-hidden p-12">
    <div className="relative z-10 w-full max-w-md space-y-6">
      {/* Top Widget */}
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl transform hover:-translate-y-2 transition-transform duration-500">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-500 font-medium text-sm">
            {language === 'fr' ? 'Business Transformé' : 'Business Contest'}
          </span>
          <span className="text-emerald-500 font-bold text-sm flex items-center">↑ 24%</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-4xl font-bold text-slate-900">42</span>
            <span className="text-slate-500 font-medium ml-2 text-sm">
              {language === 'fr' ? 'Candidatures' : 'Applications'}
            </span>
          </div>
          <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-inner">
            🏆 {language === 'fr' ? 'Concours' : 'Contest'}
          </div>
        </div>
      </div>

      {/* Bottom Widget */}
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl transform hover:-translate-y-2 transition-transform duration-500">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-800 font-bold">
            {language === 'fr' ? 'Demandes de Projet' : 'Project Requests'}
          </span>
          <span className="text-slate-500 font-medium text-sm">
            {language === 'fr' ? 'Ce mois' : 'This month'}
          </span>
        </div>
        <div className="mb-6">
          <span className="text-5xl font-bold text-slate-900">128</span>
          <span className="text-slate-500 font-medium ml-2 text-sm">
            {language === 'fr' ? 'Demandes' : 'Requests'}
          </span>
        </div>
        
        {/* Mock Chart */}
        <div className="space-y-4">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>0</span>
            <span>200</span>
          </div>
          <div className="flex gap-1 h-12 items-end">
            {[4, 5, 8, 7, 6, 8, 7, 9, 8, 10, 9, 8, 7, 6, 5, 4, 3, 4, 5, 6, 7].map((h, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-sm transition-all duration-300 hover:opacity-80 ${i < 12 ? (i > 8 ? 'bg-[#EAE91F]' : 'bg-[#14C9CB]') : 'bg-slate-200'}`} 
                style={{ height: `${h * 10}%` }}
              ></div>
            ))}
          </div>
          <p className="text-sm text-slate-500 font-medium">
            {language === 'fr' ? 'En hausse de ' : 'Increase of '}
            <span className="text-emerald-500 font-bold">15%</span> 
            {language === 'fr' ? ' ce mois' : ' this month'}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export function AdminLogin({ onLoginSuccess, language, isPasswordRecovery = false, onPasswordUpdated }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(isPasswordRecovery);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isPasswordRecovery) setShowResetPassword(true);
  }, [isPasswordRecovery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', authData.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (adminError) throw adminError;

        if (!adminData) {
          await supabase.auth.signOut();
          throw new Error('Unauthorized: You are not an admin user');
        }

        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', authData.user.id);

        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });

      if (resetError) throw resetError;

      setSuccess(
        language === 'fr'
          ? 'Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.'
          : 'A password reset email has been sent. Check your inbox.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(
        language === 'fr'
          ? 'Les mots de passe ne correspondent pas'
          : 'Passwords do not match'
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        language === 'fr'
          ? 'Le mot de passe doit contenir au moins 6 caractères'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(
        language === 'fr'
          ? 'Mot de passe mis à jour avec succès! Vous pouvez maintenant vous connecter.'
          : 'Password updated successfully! You can now sign in.'
      );

      setTimeout(() => {
        setShowResetPassword(false);
        setNewPassword('');
        setConfirmPassword('');
        onPasswordUpdated?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const LogoIcon = () => (
    <div className="mb-4">
      <img
        src="/logo_couleur.png"
        alt="GUELICHWEB"
        className="h-14 w-auto object-contain"
      />
    </div>
  );

  const MessageBanner = () => (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
          <p className="text-emerald-700 text-sm font-medium">{success}</p>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    if (showResetPassword) {
      return (
        <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => setShowResetPassword(false)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'fr' ? 'Retour' : 'Back'}
          </button>

          <LogoIcon />
          <h2 className="text-4xl font-bold text-slate-900 mt-8 mb-2">
            {language === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
          </h2>
          <p className="text-slate-500 font-medium mb-10">
            {language === 'fr' ? 'Définissez votre nouveau mot de passe' : 'Set your new password'}
          </p>

          <MessageBanner />

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                {language === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent placeholder-slate-400 font-medium text-slate-900"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                {language === 'fr' ? 'Confirmer' : 'Confirm'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent placeholder-slate-400 font-medium text-slate-900"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mx-auto"></div>
              ) : (
                language === 'fr' ? 'Mettre à jour' : 'Update Password'
              )}
            </button>
          </form>
        </div>
      );
    }

    if (showForgotPassword) {
      return (
        <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setError('');
              setSuccess('');
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'fr' ? 'Retour' : 'Back'}
          </button>

          <LogoIcon />
          <h2 className="text-4xl font-bold text-slate-900 mt-8 mb-2">
            {language === 'fr' ? 'Mot de passe oublié' : 'Forgot Password'}
          </h2>
          <p className="text-slate-500 font-medium mb-10">
            {language === 'fr'
              ? 'Entrez votre email pour recevoir un lien'
              : 'Enter your email to receive a link'}
          </p>

          <MessageBanner />

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                {language === 'fr' ? 'Email' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent placeholder-slate-400 font-medium text-slate-900"
                  placeholder="admin@guelichweb.online"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mx-auto"></div>
              ) : (
                language === 'fr' ? 'Envoyer le lien' : 'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-8 text-center bg-emerald-50 rounded-2xl p-4">
            <button
              onClick={() => setShowResetPassword(true)}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-bold transition-colors"
            >
              {language === 'fr'
                ? 'J\'ai déjà un lien, réinitialiser ici'
                : 'I have a link, reset here'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors mb-10 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {language === 'fr' ? 'Retour au site' : 'Back to website'}
        </a>

        <LogoIcon />

        <h2 className="text-4xl font-bold text-slate-900 mt-8 mb-2">
          {language === 'fr' ? 'Bon retour !' : 'Welcome Back !'}
        </h2>
        <p className="text-slate-500 font-medium mb-10">
          {language === 'fr' ? 'Connectez-vous à votre cockpit.' : 'Sign in to your cockpit.'}
        </p>

        <MessageBanner />

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              {language === 'fr' ? 'Email' : 'Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent placeholder-slate-400 font-medium text-slate-900"
                placeholder="Your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              {language === 'fr' ? 'Mot de passe' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition-colors bg-transparent placeholder-slate-400 font-medium text-slate-900"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
            >
              {language === 'fr' ? 'Mot de passe oublié?' : 'Forgot Password?'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mx-auto"></div>
            ) : (
              language === 'fr' ? 'Se connecter' : 'Sign in'
            )}
          </button>
        </form>


      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#FCFBF6] selection:bg-emerald-200 selection:text-emerald-900">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24">
        {renderContent()}
      </div>

      <RightSidePresentation language={language} />
    </div>
  );
}
