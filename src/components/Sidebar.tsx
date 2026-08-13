import React, { useState, useEffect } from 'react';
import {
  Factory,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  CalendarDays,
  Settings,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Search,
  Shield,
  ChevronUp,
  ChevronDown,
  Activity,
  Key,
  Crown
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingRequestsCount: number;
  exceededLimitCount: number;
  onResetData?: () => void;
  onQuickClockIn: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingRequestsCount,
  exceededLimitCount,
  onQuickClockIn,
  onLogout,
}) => {
  // Default to collapsed mode per request
  const [isManualCollapsed, setIsManualCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // When chosen collapsed mode, sidebar stays in collapsed mode (w-20)
  const isCollapsed = isManualCollapsed;

  // Live Ethiopian Local Time (EAT) Clock Ticker
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Addis_Ababa',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentTime(now.toLocaleTimeString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: Factory },
    { id: 'clocking', label: t('nav_clocking'), icon: Clock },
    { id: 'requests', label: t('nav_requests'), icon: ShieldCheck, badge: pendingRequestsCount },
    { id: 'attendance', label: t('nav_attendance'), icon: FileSpreadsheet },
    { id: 'roster', label: t('nav_roster'), icon: Users, alertBadge: exceededLimitCount },
    { id: 'scheduler', label: t('nav_scheduler'), icon: CalendarDays },
    { id: 'policy', label: t('nav_policy'), icon: Settings },
    { id: 'access_logs', label: t('nav_access_logs'), icon: Shield },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(navSearch.toLowerCase())
  );

  const currentUser = auth.currentUser;
  const ADMIN_UID = '9Cjupb7U1mMU8104mBDLqUugMar1';
  const isAdmin = currentUser?.uid === ADMIN_UID || currentUser?.email?.includes('admin');

  const userName = currentUser?.displayName || (isAdmin ? 'System Administrator' : currentUser?.email?.split('@')[0] || 'Plant Operator');
  const userEmail = currentUser?.email || 'authenticated@akakikality.gov.et';

  return (
    <>
      {/* Mobile Top Navigation Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-500 rounded-xl shadow-md">
            <Factory className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase leading-none font-sans">
              {t('app_title')}
            </h1>
            <p className="text-[10px] text-amber-400 font-bold">{t('app_subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onQuickClockIn}
            className="flex items-center space-x-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-black shadow-sm cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('clock_terminal')}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar (Sticky on Desktop, Slide Drawer on Mobile) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between relative">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 rounded-2xl shadow-lg ring-2 ring-amber-400/30 flex-shrink-0">
              <Factory className="w-6 h-6 text-slate-950 font-black" />
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase truncate font-sans">
                    {t('app_title')}
                  </h1>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase truncate">
                    {t('app_subtitle')}
                  </span>
                  <span className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700/80 flex-shrink-0">
                    {t('app_ethiopia')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button (3-in-a-row icon) */}
          <button
            onClick={() => setIsManualCollapsed(!isManualCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer group"
            title={isManualCollapsed ? t('expand_sidebar') : t('collapse_sidebar')}
            aria-label={isManualCollapsed ? t('expand_sidebar') : t('collapse_sidebar')}
          >
            <div className="flex items-center space-x-1 px-0.5" title="Toggle Sidebar">
              <span className="w-1 h-3.5 bg-amber-500 dark:bg-amber-400 rounded-full group-hover:scale-110 transition-transform" />
              <span className="w-1 h-3.5 bg-amber-500/80 dark:bg-amber-400/80 rounded-full group-hover:scale-110 transition-transform delay-75" />
              <span className="w-1 h-3.5 bg-amber-500/60 dark:bg-amber-400/60 rounded-full group-hover:scale-110 transition-transform delay-150" />
            </div>
          </button>
        </div>

        {/* Live Plant Clock Ticker */}
        {!isCollapsed ? (
          <div className="mx-3 mt-3 px-3 py-2 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/90 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t('live_plant_clock')}</span>
            </div>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold tracking-tight">{currentTime}</span>
          </div>
        ) : (
          <div className="mx-auto mt-3 p-2 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-center" title={`${t('live_plant_clock')}: ${currentTime}`}>
            <span className="relative flex h-2 w-2 mx-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        )}

        {/* Quick Clock-In Terminal Action Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onQuickClockIn();
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all transform active:scale-95 hover:scale-[1.02] cursor-pointer ${
              isCollapsed ? 'p-3' : 'py-2.5 px-3'
            }`}
            title={t('badge_clock_terminal')}
          >
            <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
            {!isCollapsed && <span className="truncate">{t('badge_clock_terminal')}</span>}
          </button>
        </div>

        {/* Interactive Search Filter in Sidebar */}
        {!isCollapsed && (
          <div className="px-3 mb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder={t('filter_navigation')}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80"
              />
              {navSearch && (
                <button
                  onClick={() => setNavSearch('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className="flex-1 px-3 py-1 space-y-1 overflow-y-auto custom-scrollbar">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
              {t('management_portal')}
            </p>
          )}

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  onMouseEnter={() => setHoveredTab(item.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400/50 font-black'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white'
                  }`}
                >
                  {/* Left Active Glow Indicator Strip */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-slate-950 rounded-r" />
                  )}

                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors'}`} />

                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* Badge Indicators */}
                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-amber-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {!isCollapsed && item.alertBadge !== undefined && item.alertBadge > 0 && (
                    <span className="ml-auto bg-red-950 text-red-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/40 flex items-center space-x-0.5">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span>{item.alertBadge}</span>
                    </span>
                  )}

                  {/* Collapsed dot indicators */}
                  {isCollapsed && ((item.badge && item.badge > 0) || (item.alertBadge && item.alertBadge > 0)) && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-900" />
                  )}
                </button>

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && hoveredTab === item.id && (
                  <div className="absolute left-full top-0 ml-3 z-50 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none flex items-center space-x-2">
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM SECTION: User Account Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-950/60 relative">
          
          {/* ==================================================== */}
          {/* USER ACCOUNT INFO CARD - DOWNSIDE (BOTTOM) OF SIDEBAR */}
          {/* ==================================================== */}
          <div className="relative">
            {/* Interactive Account Card Bar */}
            <button
              onClick={() => {
                setAccountMenuOpen(!accountMenuOpen);
              }}
              className={`w-full p-2.5 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/90 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                accountMenuOpen
                  ? 'border-amber-500/80 shadow-lg ring-1 ring-amber-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
              } ${isCollapsed ? 'justify-center p-2' : ''}`}
              title={t('account_info')}
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                {/* User Avatar with Live Online Status Ring */}
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shadow-md ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform ${
                    isAdmin ? 'bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>

                {!isCollapsed && (
                  <div className="text-left overflow-hidden">
                    <div className="flex items-center space-x-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {userName}
                      </p>
                      {isAdmin ? (
                        <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors pl-1">
                  {accountMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              )}
            </button>

            {/* EXPANDABLE INTERACTIVE ACCOUNT PROFILE POPOVER */}
            {accountMenuOpen && (
              <div className={`absolute bottom-full mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/50 rounded-2xl shadow-2xl p-4 z-50 space-y-3 ${
                isCollapsed ? 'left-full ml-2 w-64' : 'left-0 right-0'
              }`}>
                {/* Account Header Banner */}
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className={`w-11 h-11 rounded-2xl font-black text-lg flex items-center justify-center shadow-md ring-2 ring-amber-400/40 ${
                    isAdmin ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{userName}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                    <span className="inline-flex items-center space-x-1 mt-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('verified_account')}</span>
                    </span>
                  </div>
                </div>

                {/* Account Quick Details List */}
                <div className="space-y-2 text-[11px] text-slate-300 font-medium">
                  <div className="flex items-center justify-between p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      {isAdmin ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Shield className="w-3.5 h-3.5 text-amber-400" />}
                      <span>Role</span>
                    </span>
                    <span className="font-bold text-amber-400">{isAdmin ? t('sys_admin') : t('plant_supervisor')}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Session Status</span>
                    </span>
                    <span className="font-bold text-emerald-400">{t('active_operator_session')}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>User ID</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-300">{currentUser?.uid ? `${currentUser.uid.slice(0, 8)}...` : 'DEMO-USER'}</span>
                  </div>
                </div>

                {/* Action Buttons inside Account Popover */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-extrabold text-red-300 hover:text-white bg-red-950/80 hover:bg-red-900 border border-red-500/40 transition-colors cursor-pointer shadow-md"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>{t('sign_out')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};
