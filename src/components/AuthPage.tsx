import React, { useState, useEffect } from 'react';
import { Lock, Mail, ShieldCheck, AlertCircle, ArrowRight, Factory, LogIn, Loader2, CheckCircle2, Send, Globe, ChevronDown, Moon, Sun } from 'lucide-react';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useLanguage, languageNames, Language } from '../context/LanguageContext';
import { AIChatBot } from './AIChatBot';

interface AuthPageProps {
  onLoginSuccess?: () => void;
  unverifiedEmail?: string | null;
  darkMode?: boolean;
  onToggleTheme?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, unverifiedEmail, darkMode, onToggleTheme }) => {
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [verificationScreenEmail, setVerificationScreenEmail] = useState<string | null>(unverifiedEmail || null);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (unverifiedEmail) {
      setVerificationScreenEmail(unverifiedEmail);
    }
  }, [unverifiedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);
    setLoading(true);

    let targetEmail = email.trim();
    if (targetEmail && !targetEmail.includes('@')) {
      targetEmail = `${targetEmail}@akakimesob.com`;
    }

    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        try {
          await sendEmailVerification(userCredential.user);
        } catch (e) {
          console.error('Error sending email verification', e);
        }
        await signOut(auth);
        setLoading(false);
        setVerificationScreenEmail(targetEmail);
        return;
      }

      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setLoading(false);
      const code = err?.code || '';

      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-email'
      ) {
        setError('Email or password is incorrect');
      } else {
        setError('Email or password is incorrect');
      }
    }
  };

  const handleBackToLogin = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setVerificationScreenEmail(null);
    setError(null);
  };

  const handleResendEmail = async () => {
    if (!verificationScreenEmail) return;
    setLoading(true);
    setResendStatus(null);
    try {
      let targetEmail = verificationScreenEmail.trim();
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password || 'dummy-pass-check').catch(() => null);
      if (userCredential && userCredential.user) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setResendStatus('Verification email resent successfully.');
      } else {
        setResendStatus('Please sign in again to resend verification email.');
      }
    } catch (e) {
      setResendStatus('Email sent. Please check your inbox or spam folder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Controls: Night Mode & Language Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center space-x-2">
        {/* Night Mode / Day Mode Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer border shadow-md flex items-center justify-center ${
              darkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700 ring-1 ring-amber-400/20'
                : 'bg-white hover:bg-slate-100 text-amber-900 border-slate-200'
            }`}
            title={darkMode ? t('day_mode') : t('night_mode')}
            aria-label={darkMode ? t('day_mode') : t('night_mode')}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-amber-800 flex-shrink-0" />
            )}
          </button>
        )}

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center space-x-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{languageNames[language].label}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 min-w-[190px] space-y-1">
              {(['en', 'am', 'om'] as Language[]).map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => {
                    setLanguage(langKey);
                    setLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === langKey
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{languageNames[langKey].label}</span>
                  {language === langKey && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 rounded-2xl shadow-lg ring-4 ring-amber-500/20">
            <Factory className="w-10 h-10 text-slate-950 font-black" />
          </div>

          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80 mb-2">
              {t('ethiopia_location')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              {t('app_title')} {t('app_subtitle')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              {t('app_tagline')}
            </p>
          </div>
        </div>

        {/* Verification Screen OR Login Card */}
        {verificationScreenEmail ? (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-amber-300/70 dark:border-amber-700/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/5 space-y-6 text-center">
            <div className="inline-flex p-4 bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800/80 rounded-full text-amber-700 dark:text-amber-400 mb-2">
              <Mail className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
                {t('email_verification_required')}
              </h2>
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-center font-medium shadow-inner">
                {t('verification_sent_to')} <span className="font-bold text-amber-800 dark:text-amber-400">{verificationScreenEmail}</span>. {t('please_verify')}
              </div>
            </div>

            {resendStatus && (
              <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800/80 py-2 px-3 rounded-xl font-bold">
                {resendStatus}
              </p>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('sign_in')}</span>
              </button>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-2xl text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('resend_verification')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 dark:shadow-none space-y-5">
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t('sign_in_title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('sign_in_subtitle')}
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 p-3 rounded-xl flex items-start space-x-2 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  {t('email_address')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@akakimesob.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{t('sign_in_button')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Floating AI Chatbot Assistant on Login Page */}
      <AIChatBot darkMode={darkMode} />
    </div>
  );
};

