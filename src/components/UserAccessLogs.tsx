import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Clock,
  Search,
  Filter,
  Download,
  Trash2,
  PlusCircle,
  Eye,
  LogOut,
  Crown,
  Monitor,
  Globe,
  Activity,
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Smartphone
} from 'lucide-react';
import { UserAccessLog } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface UserAccessLogsProps {
  logs: UserAccessLog[];
  onAddLog: (newLog: Omit<UserAccessLog, 'id'>) => void;
  onClearLogs: () => void;
  onTerminateSession: (logId: string) => void;
}

export const UserAccessLogs: React.FC<UserAccessLogsProps> = ({
  logs,
  onAddLog,
  onClearLogs,
  onTerminateSession,
}) => {
  const { t } = useLanguage();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<UserAccessLog | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Form for simulating a new access log
  const [simForm, setSimForm] = useState({
    email: 'operator.test@akakimesob.com',
    fullName: 'Tesfaye Alemu',
    role: 'Plant Operations Supervisor' as UserAccessLog['role'],
    loginMethod: 'Email & Password' as UserAccessLog['loginMethod'],
    category: 'Clocking Action' as UserAccessLog['category'],
    actionTitle: 'Clocked IN Worker AKC-1002',
    actionDetails: 'Scanned worker badge at Plant Gate Terminal 1',
    ipAddress: '197.156.121.112',
    location: 'Akaki Kality Industrial Zone, Addis Ababa',
    badgeNumber: 'AKC-SUP-202',
  });

  // Calculate Metrics
  const totalLogins = logs.length;
  const activeSessions = logs.filter((l) => l.status === 'Active Session').length;
  const uniqueUsers = new Set(logs.map((l) => l.email)).size;
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayLogins = logs.filter((l) => l.accessTime.startsWith(todayDateStr)).length;

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actionTitle && log.actionTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.actionDetails && log.actionDetails.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.targetElement && log.targetElement.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.badgeNumber && log.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'ADMIN' && log.role.includes('Admin')) ||
      (roleFilter === 'SUPERVISOR' && log.role.includes('Supervisor')) ||
      (roleFilter === 'HR' && log.role.includes('HR')) ||
      (roleFilter === 'OPERATOR' && log.role.includes('Operator'));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && log.status === 'Active Session') ||
      (statusFilter === 'LOGGED_IN' && log.status === 'Logged In') ||
      (statusFilter === 'LOGGED_OUT' && log.status === 'Logged Out') ||
      (statusFilter === 'ACTIVITY' && log.status === 'Activity Executed');

    const matchesCategory =
      categoryFilter === 'ALL' || log.category === categoryFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesCategory;
  });

  // Export logs to CSV
  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Full Name',
      'Email',
      'Badge Number',
      'Role',
      'Category',
      'Action Title',
      'Action Details',
      'Target Element',
      'Access Time (EAT)',
      'Method/Provider',
      'IP Address',
      'Location',
      'Status',
      'User Agent',
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.fullName}"`,
      l.email,
      l.badgeNumber || 'N/A',
      `"${l.role}"`,
      `"${l.category || 'Authentication'}"`,
      `"${l.actionTitle || 'User Access Event'}"`,
      `"${(l.actionDetails || '').replace(/"/g, '""')}"`,
      `"${(l.targetElement || '').replace(/"/g, '""')}"`,
      `"${l.displayTime}"`,
      l.loginMethod,
      l.ipAddress,
      `"${l.location}"`,
      l.status,
      `"${l.userAgent.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Akaki_Kality_Portal_Activity_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const displayTimeStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' • ' + now.toLocaleTimeString('en-US', {
      timeZone: 'Africa/Addis_Ababa',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' EAT';

    onAddLog({
      email: simForm.email,
      fullName: simForm.fullName,
      role: simForm.role,
      accessTime: now.toISOString(),
      displayTime: displayTimeStr,
      loginMethod: simForm.loginMethod,
      ipAddress: simForm.ipAddress,
      location: simForm.location,
      userAgent: window.navigator.userAgent || 'Mozilla/5.0 (Client Terminal)',
      status: 'Activity Executed',
      badgeNumber: simForm.badgeNumber,
      category: simForm.category,
      actionTitle: simForm.actionTitle,
      actionDetails: simForm.actionDetails,
      targetElement: 'Simulated Manual Event',
    });

    setIsSimulateModalOpen(false);
  };


  const getDeviceIcon = (ua: string) => {
    if (ua.toLowerCase().includes('android') || ua.toLowerCase().includes('iphone')) {
      return <Smartphone className="w-3.5 h-3.5 text-purple-500" />;
    }
    return <Laptop className="w-3.5 h-3.5 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800">
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t('access_logs_badge')}</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Real-Time Audit Sync Active</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
            {t('access_logs_title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {t('access_logs_subtitle')}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('simulate_login')}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{t('export_logs')}</span>
          </button>

          <button
            onClick={onClearLogs}
            className="px-3 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-red-200 dark:border-red-900/50 transition-all cursor-pointer"
            title={t('clear_logs')}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>{t('clear_logs')}</span>
          </button>
        </div>
      </div>

      {/* KPI Audit Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800/80">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('kpi_total_logins')}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalLogins}</h3>
            <span className="text-[10px] text-slate-400">Authenticated Access Events</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800/80 relative">
            <Activity className="w-6 h-6 animate-pulse" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('kpi_active_sessions')}
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeSessions}</h3>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-bold">Live Portal Operators</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800/80">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('kpi_unique_users')}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{uniqueUsers}</h3>
            <span className="text-[10px] text-slate-400">Distinct Email Accounts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 rounded-xl border border-purple-200 dark:border-purple-800/80">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('kpi_today_logins')}
            </p>
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{todayLogins}</h3>
            <span className="text-[10px] text-slate-400">Logged Since 00:00 EAT</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, action title, details, IP, target..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role and Category Filters */}
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Activity Categories</option>
              <option value="Authentication">Authentication</option>
              <option value="Navigation">Navigation</option>
              <option value="Clocking Action">Clocking Action</option>
              <option value="Overtime Approval">Overtime Approval</option>
              <option value="Policy Update">Policy Update</option>
              <option value="System & Export">System & Export</option>
              <option value="User Interaction">User Interaction</option>
            </select>

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  roleFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  roleFilter === 'ADMIN'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setRoleFilter('SUPERVISOR')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  roleFilter === 'SUPERVISOR'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Supervisor
              </button>
              <button
                onClick={() => setRoleFilter('HR')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  roleFilter === 'HR'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                HR
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Session</option>
              <option value="ACTIVITY">Activity Executed</option>
              <option value="LOGGED_IN">Logged In</option>
              <option value="LOGGED_OUT">Logged Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Access Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">{t('col_user_email')}</th>
                <th className="py-3.5 px-4">Category & Role</th>
                <th className="py-3.5 px-4">User Activity / Click Event</th>
                <th className="py-3.5 px-4">{t('col_access_time')}</th>
                <th className="py-3.5 px-4">{t('col_ip_location')}</th>
                <th className="py-3.5 px-4">{t('col_session_status')}</th>
                <th className="py-3.5 px-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Shield className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-bold">No portal activity logs matched your filter query</p>
                    <span className="text-[11px]">Try searching for other actions or clear active filters.</span>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isAdminRole = log.role.includes('Admin');
                  const isActive = log.status === 'Active Session';
                  const cat = log.category || 'Authentication';

                  const getCatBadgeClass = (c: string) => {
                    switch (c) {
                      case 'Authentication': return 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800';
                      case 'Navigation': return 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800';
                      case 'Clocking Action': return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
                      case 'Overtime Approval': return 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800';
                      case 'Policy Update': return 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800';
                      case 'System & Export': return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
                      default: return 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
                    }
                  };

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* User & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs ${
                              isAdminRole
                                ? 'bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-400 text-slate-950 ring-2 ring-amber-400/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {log.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-black text-slate-900 dark:text-white">
                                {log.fullName}
                              </span>
                              {isAdminRole && (
                                <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" title="Admin User" />
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                              {log.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Role */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border shadow-2xs ${getCatBadgeClass(cat)}`}>
                            {cat}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                            {log.role}
                          </span>
                        </div>
                      </td>

                      {/* Activity & Target Element */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {log.actionTitle || 'User Action Executed'}
                          </p>
                          {log.actionDetails && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={log.actionDetails}>
                              {log.actionDetails}
                            </p>
                          )}
                          {log.targetElement && (
                            <span className="inline-block font-mono text-[10px] text-amber-700 dark:text-amber-400/90 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200/50 dark:border-amber-900/50 truncate max-w-[220px]">
                              {log.targetElement}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Access Time (EAT) */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span>{log.displayTime}</span>
                        </div>
                      </td>

                      {/* IP & Location */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-200 block">
                            {log.ipAddress}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[130px]">{log.location}</span>
                          </span>
                        </div>
                      </td>

                      {/* Session Status */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full font-black text-[10px] uppercase shadow-xs">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>{t('status_active_ot')}</span>
                          </span>
                        ) : log.status === 'Activity Executed' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 rounded-full font-extrabold text-[10px]">
                            <Activity className="w-3 h-3 text-cyan-500" />
                            <span>Action Logged</span>
                          </span>
                        ) : log.status === 'Logged In' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                            <span>Logged In</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-[10px]">
                            <span>Logged Out</span>
                          </span>
                        )}
                      </td>


                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/80 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                            title={t('view_details')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isActive && (
                            <button
                              onClick={() => onTerminateSession(log.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer border border-red-200 dark:border-red-900/50"
                              title={t('terminate_session')}
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl p-6 max-w-lg w-full text-slate-900 dark:text-white shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight">
                  Access Payload Metadata
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Event ID: <span className="font-mono">{selectedLog.id}</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-1.5 border border-slate-800 shadow-inner">
              <p><span className="text-slate-500">"event_id"</span>: <span className="text-amber-300">"{selectedLog.id}"</span>,</p>
              <p><span className="text-slate-500">"user"</span>: <span className="text-amber-300">"{selectedLog.fullName}"</span>,</p>
              <p><span className="text-slate-500">"email"</span>: <span className="text-amber-300">"{selectedLog.email}"</span>,</p>
              <p><span className="text-slate-500">"category"</span>: <span className="text-amber-300">"{selectedLog.category || 'Authentication'}"</span>,</p>
              <p><span className="text-slate-500">"action_title"</span>: <span className="text-amber-300">"{selectedLog.actionTitle || 'User Login'}"</span>,</p>
              <p><span className="text-slate-500">"action_details"</span>: <span className="text-amber-300">"{selectedLog.actionDetails || 'N/A'}"</span>,</p>
              <p><span className="text-slate-500">"target_element"</span>: <span className="text-amber-300">"{selectedLog.targetElement || 'N/A'}"</span>,</p>
              <p><span className="text-slate-500">"badge"</span>: <span className="text-amber-300">"{selectedLog.badgeNumber || 'N/A'}"</span>,</p>
              <p><span className="text-slate-500">"role"</span>: <span className="text-amber-300">"{selectedLog.role}"</span>,</p>
              <p><span className="text-slate-500">"access_time"</span>: <span className="text-amber-300">"{selectedLog.accessTime}"</span>,</p>
              <p><span className="text-slate-500">"display_eat"</span>: <span className="text-amber-300">"{selectedLog.displayTime}"</span>,</p>
              <p><span className="text-slate-500">"ip_address"</span>: <span className="text-amber-300">"{selectedLog.ipAddress}"</span>,</p>
              <p><span className="text-slate-500">"location"</span>: <span className="text-amber-300">"{selectedLog.location}"</span>,</p>
              <p><span className="text-slate-500">"status"</span>: <span className="text-amber-300">"{selectedLog.status}"</span>,</p>
              <p><span className="text-slate-500">"user_agent"</span>: <span className="text-amber-300">"{selectedLog.userAgent}"</span></p>
            </div>


            <div className="flex items-center justify-end space-x-3 pt-2">
              {selectedLog.status === 'Active Session' && (
                <button
                  onClick={() => {
                    onTerminateSession(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Terminate Active Session
                </button>
              )}
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Payload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Access Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl p-6 max-w-lg w-full text-slate-900 dark:text-white shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsSimulateModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight">
                  Simulate User Portal Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manually record a test user login event to verify access tracking
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  User Full Name
                </label>
                <input
                  type="text"
                  required
                  value={simForm.fullName}
                  onChange={(e) => setSimForm({ ...simForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={simForm.email}
                    onChange={(e) => setSimForm({ ...simForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    value={simForm.badgeNumber}
                    onChange={(e) => setSimForm({ ...simForm, badgeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role & Privilege
                  </label>
                  <select
                    value={simForm.role}
                    onChange={(e) => setSimForm({ ...simForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Plant Operations Supervisor">Plant Operations Supervisor</option>
                    <option value="System Administrator (Admin)">System Administrator (Admin)</option>
                    <option value="HR & Timekeeping Manager">HR & Timekeeping Manager</option>
                    <option value="Shift Operator">Shift Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Login Method
                  </label>
                  <select
                    value={simForm.loginMethod}
                    onChange={(e) => setSimForm({ ...simForm, loginMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Email & Password">Email & Password</option>
                    <option value="Firebase Auth">Firebase Auth</option>
                    <option value="Quick Portal Access">Quick Portal Access</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={simForm.ipAddress}
                    onChange={(e) => setSimForm({ ...simForm, ipAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={simForm.location}
                    onChange={(e) => setSimForm({ ...simForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Record Access Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
