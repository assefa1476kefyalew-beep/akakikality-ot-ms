import React from 'react';
import { Employee, AttendanceRecord, OvertimeRequest, UserAccessLog } from '../types';
import { Clock, Users, ShieldAlert, DollarSign, Calendar, TrendingUp, AlertOctagon, CheckCircle2, ArrowUpRight, Award, Building2, Shield, Eye, ShieldCheck, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../lib/firebase';

interface DashboardProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  overtimeRequests: OvertimeRequest[];
  accessLogs?: UserAccessLog[];
  setActiveTab: (tab: string) => void;
  onOpenPayrollModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  employees,
  attendanceRecords,
  overtimeRequests,
  accessLogs = [],
  setActiveTab,
  onOpenPayrollModal,
}) => {
  const { t } = useLanguage();

  const currentUser = auth.currentUser;
  const userEmailLower = currentUser?.email?.toLowerCase() || '';
  const isSystemAdmin =
    currentUser?.uid === '9Cjupb7U1mMU8104mBDLqUugMar1' ||
    userEmailLower.includes('admin') ||
    userEmailLower.includes('assefa');

  // Metrics Calculations
  const activeCheckIns = attendanceRecords.filter((r) => r.status === 'Present' || r.status === 'Overtime Active');
  const activeOvertimeCount = attendanceRecords.filter((r) => r.status === 'Overtime Active').length;
  
  const totalOTHoursThisMonth = attendanceRecords.reduce((acc, r) => acc + (r.overtimeHours || 0), 0);
  const totalOTPayETB = attendanceRecords.reduce((acc, r) => acc + (r.overtimePayETB || 0), 0);
  
  const pendingRequests = overtimeRequests.filter((r) => r.status === 'Pending');
  const exceededWorkers = employees.filter((e) => e.currentMonthOTHours >= e.monthlyOvertimeLimitHours);

  // Recharts Data Aggregation
  // 1. OT Hours by Department
  const deptMap: Record<string, number> = {};
  attendanceRecords.forEach((r) => {
    deptMap[r.department] = (deptMap[r.department] || 0) + (r.overtimeHours || 0);
  });
  const departmentChartData = Object.keys(deptMap).map((dept) => ({
    department: dept.replace('&', 'and').split(' ')[0], // short label
    fullDepartment: dept,
    hours: parseFloat(deptMap[dept].toFixed(1)),
  }));

  // 2. OT Hours by Multiplier Type
  const typeMap: Record<string, number> = {
    'Daytime (1.25x)': 0,
    'Night (1.50x)': 0,
    'Rest Day (2.00x)': 0,
    'Holiday (2.50x)': 0,
  };
  attendanceRecords.forEach((r) => {
    if (r.overtimeType.includes('1.25')) typeMap['Daytime (1.25x)'] += r.overtimeHours;
    else if (r.overtimeType.includes('1.50')) typeMap['Night (1.50x)'] += r.overtimeHours;
    else if (r.overtimeType.includes('2.00')) typeMap['Rest Day (2.00x)'] += r.overtimeHours;
    else if (r.overtimeType.includes('2.50')) typeMap['Holiday (2.50x)'] += r.overtimeHours;
  });

  const pieChartData = [
    { name: 'Daytime (1.25x)', value: parseFloat(typeMap['Daytime (1.25x)'].toFixed(1)), color: '#3b82f6' },
    { name: 'Night (1.50x)', value: parseFloat(typeMap['Night (1.50x)'].toFixed(1)), color: '#8b5cf6' },
    { name: 'Rest Day (2.00x)', value: parseFloat(typeMap['Rest Day (2.00x)'].toFixed(1)), color: '#f59e0b' },
    { name: 'Holiday (2.50x)', value: parseFloat(typeMap['Holiday (2.50x)'].toFixed(1)), color: '#ef4444' },
  ].filter(d => d.value > 0);

  // 3. Daily OT Trend Data
  const dailyMap: Record<string, number> = {};
  attendanceRecords.forEach((r) => {
    dailyMap[r.date] = (dailyMap[r.date] || 0) + (r.overtimeHours || 0);
  });
  const sortedDates = Object.keys(dailyMap).sort();
  const trendChartData = sortedDates.map((date) => ({
    date: date.slice(5), // MM-DD
    hours: parseFloat(dailyMap[date].toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/80 rounded-2xl p-6 text-white shadow-xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{t('dash_subcity_plant')}</span>
          </div>
          <h2 className="text-2xl font-black text-white">{t('dash_monitor_title')}</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl">
            {t('dash_monitor_desc')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenPayrollModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition-all transform active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>{t('dash_gen_ot_slip')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('kpi_active_clock_ins')}</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{activeCheckIns.length}</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                {activeOvertimeCount} {t('in_overtime')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t('total_employees')}: {employees.length}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800/50">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('kpi_monthly_ot_hours')}</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalOTHoursThisMonth.toFixed(1)} hrs</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t('logged_across_shifts')}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('kpi_ot_cost_estimate')}</p>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {totalOTPayETB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ETB</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t('ethiopian_birr_accrued')}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('kpi_pending_ot_requests')}</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-amber-500">{pendingRequests.length}</span>
              {exceededWorkers.length > 0 && (
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-800/50">
                  {exceededWorkers.length} {t('over_limit')}
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold flex items-center space-x-0.5 mt-1 cursor-pointer"
            >
              <span>{t('review_requests')}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-800/50">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Compliance Warning Bar if workers exceeded limit */}
      {exceededWorkers.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                Overtime Limit Warning ({exceededWorkers.length} Worker{exceededWorkers.length > 1 ? 's' : ''})
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                The following employee(s) reached or exceeded the 40-hour monthly overtime cap under Akaki Kality company policy:{' '}
                <span className="font-bold">{exceededWorkers.map(w => `${w.fullName} (${w.currentMonthOTHours} hrs)`).join(', ')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('roster')}
            className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            Manage Roster Caps
          </button>
        </div>
      )}

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: OT Hours by Department */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overtime Distribution by Department</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cumulative hours across plant production units</p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
              Hours (hrs)
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-800">
                          <p className="font-bold">{data.fullDepartment}</p>
                          <p className="text-amber-400 font-semibold">{data.hours} Overtime Hours</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: OT Multiplier Pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">OT Category Multipliers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ethiopian labour law rate tiers</p>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [`${val} hrs`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', borderColor: '#334155' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {pieChartData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto">{item.value}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily OT Trend Area Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Plant Overtime Trend</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total overtime hours logged per day</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Shift Tracking</span>
          </span>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="otColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', borderColor: '#334155' }}
                formatter={(val: number) => [`${val} hrs`, 'Overtime Hours']}
              />
              <Area type="monotone" dataKey="hours" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#otColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Attendance & Active Overtime Table Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Plant Attendance & Active Overtime Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live clock-in statuses and completed overtime shifts</p>
          </div>
          <button
            onClick={() => setActiveTab('attendance')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-amber-200/60 dark:border-amber-800/50"
          >
            View Master Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Employee</th>
                <th className="pb-3 px-3">Badge ID</th>
                <th className="pb-3 px-3">Department</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Clock In - Out</th>
                <th className="pb-3 px-3">OT Hours</th>
                <th className="pb-3 px-3">Rate Multiplier</th>
                <th className="pb-3 px-3">OT Pay (ETB)</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
              {attendanceRecords.slice(0, 5).map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{record.employeeName}</td>
                  <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{record.badgeNumber}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{record.department}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{record.date}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {record.checkInTime} - {record.checkOutTime || <span className="text-amber-500 font-bold animate-pulse">Active Now</span>}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{record.overtimeHours} hrs</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      {record.overtimeMultiplier.toFixed(2)}x
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {record.overtimePayETB.toFixed(2)} ETB
                  </td>
                  <td className="py-3 px-3">
                    {record.status === 'Overtime Active' ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>Active OT</span>
                      </span>
                    ) : record.status === 'Completed' ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {record.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Portal Login & Access Audit Feed (Admin Only) */}
      {isSystemAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Portal Login & Access History</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time audit log of every admin, supervisor, and operator accessing the portal</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('access_logs')}
              className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-amber-200/60 dark:border-amber-800/50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Security Audit ({accessLogs.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accessLogs.slice(0, 3).map((log) => {
              const isActive = log.status === 'Active Session';
              const isAdmin = log.role.includes('Admin');

              return (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between space-x-3 transition-all hover:border-amber-400/50"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {log.fullName}
                      </span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[9px] font-black rounded uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {log.email}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{log.displayTime.split('•')[1]?.trim() || log.displayTime}</span>
                      <span>•</span>
                      <span className="truncate max-w-[100px]">{log.ipAddress}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right space-y-1">
                    {isActive ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-black text-[9px] uppercase rounded-full border border-emerald-300 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Active Now</span>
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[9px] rounded-full">
                        {log.status}
                      </span>
                    )}
                    <span className="block text-[9px] text-slate-400 font-medium">
                      {log.loginMethod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

