import { useState } from 'react';
import { Lock, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getTranslation, Language } from '../translations';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  language: Language;
}

export function AdminLogin({ onLoginSuccess, language }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const t = getTranslation(language);

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
        redirectTo: `${window.location.origin}/admin/reset-password`,
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
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <button
            onClick={() => setShowResetPassword(false)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'fr' ? 'Retour' : 'Back'}
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
              <Lock className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {language === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
            </h2>
            <p className="text-slate-600">
              {language === 'fr' ? 'Définissez votre nouveau mot de passe' : 'Set your new password'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {language === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {language === 'fr' ? 'Mise à jour...' : 'Updating...'}
                </span>
              ) : (
                language === 'fr' ? 'Mettre à jour' : 'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setError('');
              setSuccess('');
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'fr' ? 'Retour' : 'Back'}
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
              <Mail className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {language === 'fr' ? 'Mot de passe oublié' : 'Forgot Password'}
            </h2>
            <p className="text-slate-600">
              {language === 'fr'
                ? 'Entrez votre email pour recevoir un lien de réinitialisation'
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {language === 'fr' ? 'Email' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@guelichweb.online"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {language === 'fr' ? 'Envoi...' : 'Sending...'}
                </span>
              ) : (
                language === 'fr' ? 'Envoyer le lien' : 'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowResetPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {language === 'fr'
                ? 'Vous avez déjà un lien? Réinitialisez maintenant'
                : 'Already have a reset link? Reset now'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to home link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-all duration-300 group backdrop-blur-sm bg-white/10 px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{language === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}</span>
        </a>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            {/* Logo/Icon with animation */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-6 shadow-lg shadow-blue-500/50 animate-in zoom-in duration-700">
              <Lock className="text-white animate-pulse" size={36} />
            </div>

            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-3">
              {language === 'fr' ? 'Espace Admin' : 'Admin Space'}
            </h2>
            <p className="text-slate-600 text-lg">
              {language === 'fr' ? 'Connectez-vous pour gérer le portfolio' : 'Sign in to manage portfolio'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="text-red-600 flex-shrink-0 animate-pulse" size={20} />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-blue-600" />
                {language === 'fr' ? 'Email' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 hover:bg-white focus:bg-white"
                  placeholder="admin@guelichweb.online"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-blue-600" />
                {language === 'fr' ? 'Mot de passe' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 hover:bg-white focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors hover:underline"
              >
                {language === 'fr' ? 'Mot de passe oublié?' : 'Forgot password?'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    {language === 'fr' ? 'Connexion...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    {language === 'fr' ? 'Se connecter' : 'Sign in'}
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Decorative footer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              🔒 {language === 'fr' ? 'Connexion sécurisée' : 'Secure connection'}
            </p>
          </div>
        </div>

        {/* GUELICHWEB branding */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} <span className="font-bold text-white/80">GUELICHWEB</span>
          </p>
        </div>
      </div>
    </div>
  );
}
