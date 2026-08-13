import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Crown,
  LogOut,
  ChevronDown,
  UserCheck,
  Activity,
  X,
  Info,
  Building2,
  Layers
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useLanguage, languageNames, Language } from '../context/LanguageContext';

interface TopHeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  setActiveTab?: (tab: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  darkMode,
  onToggleTheme,
  onLogout,
  setActiveTab,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [systemModalOpen, setSystemModalOpen] = useState(false);

  const currentUser = auth.currentUser;
  // Check if current user is the specified admin UID
  const ADMIN_UID = '9Cjupb7U1mMU8104mBDLqUugMar1';
  const isAdmin = currentUser?.uid === ADMIN_UID || currentUser?.email?.includes('admin');

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Plant Operator';
  const userEmail = currentUser?.email || 'authenticated@akakikality.gov.et';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs transition-colors duration-200">
        {/* Left side: Interactive "Akaki Kality Overtime Attendance System" text */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setSystemModalOpen(true);
              if (setActiveTab) setActiveTab('dashboard');
            }}
            className="flex items-center space-x-2 px-3 py-1 bg-slate-100 hover:bg-amber-50 text-slate-800 hover:text-amber-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-100 dark:hover:text-amber-400 rounded-xl text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xs"
            title={t('system_info_title')}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-tight group-hover:underline">
              {t('app_brand_interactive')}
            </span>
            <Activity className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
          </button>

          {/* Admin Badge Banner for Admin User */}
          {isAdmin && (
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/15 dark:bg-gradient-to-r dark:from-amber-500/20 dark:to-yellow-500/20 border border-amber-500/40 rounded-full text-amber-800 dark:text-amber-300 text-xs font-black shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-bounce" />
              <span className="uppercase tracking-wider text-[11px]">{t('admin_badge')}</span>
            </div>
          )}
        </div>

      {/* TOP RIGHT SIDE OF WEBSITE: Night Mode, Language & Admin User Controls */}
      <div className="flex items-center space-x-2.5 ml-auto">
        {/* 1. LANGUAGE OPTION DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => {
              setLangMenuOpen(!langMenuOpen);
              setUserDropdownOpen(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
            title={t('select_language')}
          >
            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="font-bold">{languageNames[language].flag}</span>
            <span className="hidden md:inline font-bold">{languageNames[language].label}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </button>

          {/* Language Menu Dropdown */}
          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1">
              {(['en', 'am', 'om'] as Language[]).map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => {
                    setLanguage(langKey);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === langKey
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-sm">{languageNames[langKey].flag}</span>
                    <span>{languageNames[langKey].label}</span>
                  </span>
                  {language === langKey && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. NIGHT MODE / DAY MODE OPTION TOGGLE (ICON ONLY) */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl transition-all cursor-pointer border shadow-xs flex items-center justify-center ${
            darkMode
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/20'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 shadow-sm'
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

        {/* 3. USER ACCOUNT CHIP WITH ADMIN BADGE */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setLangMenuOpen(false);
            }}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
          >
            <div className="relative">
              <div className={`w-7 h-7 rounded-lg text-slate-950 font-black text-xs flex items-center justify-center shadow-xs ${
                isAdmin
                  ? 'bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-400 ring-2 ring-amber-400/50'
                  : 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-white'
              }`}>
                {userName.charAt(0).toUpperCase()}
              </div>
              {isAdmin && (
                <Crown className="w-3 h-3 text-amber-500 dark:text-amber-400 absolute -top-1.5 -right-1.5 filter drop-shadow-xs" />
              )}
            </div>

            <div className="hidden sm:block text-left">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white max-w-[100px] truncate">{userName}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md uppercase">
                    ADMIN
                  </span>
                )}
              </div>
            </div>

            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* User Account Quick Popover */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-2xl shadow-2xl p-3.5 z-50 space-y-3">
              <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-800">
                <div className={`w-10 h-10 rounded-xl text-slate-950 font-black text-sm flex items-center justify-center shadow-md ${
                  isAdmin ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 ring-2 ring-amber-400/50' : 'bg-slate-700 text-white'
                }`}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-1">
                    <h4 className="text-xs font-black text-white truncate">{userName}</h4>
                    {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                </div>
              </div>

              {/* Role Indicator */}
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Privilege</span>
                <span className={`font-bold flex items-center space-x-1 mt-0.5 ${isAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isAdmin ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isAdmin ? t('sys_admin') : t('plant_supervisor')}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">ID: {currentUser?.uid || ADMIN_UID}</span>
              </div>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold text-red-300 hover:text-white bg-red-950/80 hover:bg-red-900 border border-red-500/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>{t('sign_out')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Interactive Modal Popup for "Akaki Kality Overtime Attendance System" */}
    {systemModalOpen && (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-6 relative">
          <button
            onClick={() => setSystemModalOpen(false)}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-500 rounded-2xl shadow-lg ring-4 ring-amber-500/20">
              <Building2 className="w-7 h-7 text-slate-950 font-black" />
            </div>
            <div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                {t('system_status_operational')}
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {t('app_brand_interactive')}
              </h3>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Plant Location:</span>
                <p className="text-slate-400">{t('system_location_val')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2 border-t border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Legal Compliance:</span>
                <p className="text-slate-400">{t('system_compliance_val')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2 border-t border-slate-800">
              <Layers className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Plant Infrastructure:</span>
                <p className="text-slate-400">{t('system_active_lines')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setSystemModalOpen(false);
                if (setActiveTab) setActiveTab('dashboard');
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
            >
              Go to Plant Dashboard
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
