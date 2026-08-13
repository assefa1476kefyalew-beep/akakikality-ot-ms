/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Crown, X, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import {
  Employee,
  AttendanceRecord,
  OvertimeRequest,
  OvertimeRatePolicy,
  UserAccessLog,
  ActivityCategory,
} from './types';

import {
  loadEmployees,
  saveEmployees,
  loadAttendance,
  saveAttendance,
  loadRequests,
  saveRequests,
  loadPolicy,
  savePolicy,
  loadAccessLogs,
  saveAccessLogs,
  resetToDefaultData,
} from './utils/localStorage';

import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { Dashboard } from './components/Dashboard';
import { ClockingStation } from './components/ClockingStation';
import { OvertimeRequests } from './components/OvertimeRequests';
import { AttendanceLogs } from './components/AttendanceLogs';
import { EmployeeRoster } from './components/EmployeeRoster';
import { ShiftScheduler } from './components/ShiftScheduler';
import { PolicyConfig } from './components/PolicyConfig';
import { UserAccessLogs } from './components/UserAccessLogs';
import { PayrollExportModal } from './components/PayrollExportModal';


export default function App() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAdminWelcome, setShowAdminWelcome] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState<boolean>(false);

  // Theme Mode State (Day vs Night)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleToggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    logActivity(
      'User Interaction',
      `Toggled Theme to ${nextMode ? 'Dark Mode' : 'Light Mode'}`,
      `User changed portal appearance theme setting`,
      'TopHeader [Theme Toggle]'
    );
  };


  // Core Application Data State
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(loadAttendance);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(loadRequests);
  const [policy, setPolicyState] = useState<OvertimeRatePolicy>(loadPolicy);
  const [userAccessLogs, setUserAccessLogs] = useState<UserAccessLog[]>(loadAccessLogs);

  // Sync to LocalStorage on state changes
  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    saveAttendance(attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    saveRequests(overtimeRequests);
  }, [overtimeRequests]);

  useEffect(() => {
    savePolicy(policy);
  }, [policy]);

  useEffect(() => {
    saveAccessLogs(userAccessLogs);
  }, [userAccessLogs]);

  // Centralized Activity & User Action Logger
  const logActivity = (
    category: ActivityCategory,
    actionTitle: string,
    actionDetails?: string,
    targetElement?: string
  ) => {
    const userEmail = currentUser?.email || 'portal.user@akakimesob.com';
    const isAdmin =
      currentUser?.uid === '9Cjupb7U1mMU8104mBDLqUugMar1' ||
      userEmail.toLowerCase().includes('admin') ||
      userEmail.toLowerCase().includes('assefa');

    // DO NOT record activity if the user is a System Administrator
    if (isAdmin) return;

    const now = new Date();
    const displayTimeStr =
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' • ' +
      now.toLocaleTimeString('en-US', {
        timeZone: 'Africa/Addis_Ababa',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }) +
      ' EAT';

    const newLog: UserAccessLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: userEmail,
      fullName: currentUser?.displayName || 'Plant Operations User',
      role: 'Plant Operations Supervisor',
      accessTime: now.toISOString(),
      displayTime: displayTimeStr,
      loginMethod: 'UI Action Listener',
      ipAddress: '197.156.121.84',
      location: 'Addis Ababa, Ethiopia',
      userAgent: window.navigator.userAgent || 'Mozilla/5.0 (Client Terminal)',
      status: 'Activity Executed',
      badgeNumber: 'AKC-SUP-101',
      category,
      actionTitle,
      actionDetails,
      targetElement,
    };

    setUserAccessLogs((prev) => [newLog, ...prev]);
  };

  // Record Session Access Log when user authenticates
  useEffect(() => {
    if (currentUser && currentUser.email) {
      const userEmail = currentUser.email;
      const isAdmin =
        currentUser.uid === '9Cjupb7U1mMU8104mBDLqUugMar1' ||
        userEmail.toLowerCase().includes('admin') ||
        userEmail.toLowerCase().includes('assefa');

      // DO NOT record session log if the user is a System Administrator
      if (isAdmin) return;

      setUserAccessLogs((prev) => {
        // Check if user already has an active session
        const existingActive = prev.find((l) => l.email === userEmail && l.status === 'Active Session');
        if (existingActive) return prev; // Already logged as active

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

        const newLog: UserAccessLog = {
          id: `LOG-${Date.now()}`,
          email: userEmail,
          fullName: currentUser.displayName || 'Plant Operations User',
          role: 'Plant Operations Supervisor',
          accessTime: now.toISOString(),
          displayTime: displayTimeStr,
          loginMethod: 'Firebase Auth',
          ipAddress: '197.156.121.84',
          location: 'Addis Ababa, Ethiopia',
          userAgent: window.navigator.userAgent || 'Mozilla/5.0 (Client Terminal)',
          status: 'Active Session',
          badgeNumber: 'AKC-SUP-101',
          category: 'Authentication',
          actionTitle: 'Signed In & Active Session Started',
          actionDetails: 'Authenticated via Firebase Auth service',
          targetElement: 'AuthPage / Firebase Token Client',
        };

        return [newLog, ...prev];
      });
    }
  }, [currentUser]);

  // Global Mouse Click Listener to Capture ANY User Click on the Portal
  useEffect(() => {
    let lastClickTimestamp = 0;

    const handleGlobalClick = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastClickTimestamp < 350) return; // Debounce double clicks

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, select, textarea, [role="button"], [data-action], .cursor-pointer'
      ) as HTMLElement | null;

      if (interactive) {
        lastClickTimestamp = now;
        const tagName = interactive.tagName.toLowerCase();
        let label =
          interactive.getAttribute('aria-label') ||
          interactive.getAttribute('title') ||
          interactive.getAttribute('placeholder') ||
          interactive.innerText ||
          interactive.id ||
          tagName;

        label = label.trim().replace(/\s+/g, ' ');
        if (label.length > 50) label = label.slice(0, 47) + '...';

        // Ignore pure container wrappers with no meaningful text
        if (!label || label === 'div' || label === 'svg' || label === 'span') return;

        const targetDesc = `<${tagName}> "${label}"`;

        logActivity(
          'User Interaction',
          `Clicked Portal Element "${label}"`,
          `User interacted with UI element (${tagName}) on active portal view`,
          targetDesc
        );
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [currentUser]);

  // Tab Switcher with Audit Logging
  const currentEmailLower = currentUser?.email?.toLowerCase() || '';
  const isSystemAdmin =
    currentUser?.uid === '9Cjupb7U1mMU8104mBDLqUugMar1' ||
    currentEmailLower.includes('admin') ||
    currentEmailLower.includes('assefa');

  const handleSelectTab = (tab: string) => {
    if (tab === 'access_logs' && !isSystemAdmin) {
      return;
    }
    setActiveTab(tab);
    const tabNames: Record<string, string> = {
      dashboard: 'Plant Dashboard Overview',
      clocking: 'Live Attendance Clocking Station',
      requests: 'Overtime Approvals & Requests',
      attendance: 'Attendance Logs & Registers',
      roster: 'Employee Shift Roster',
      scheduler: 'Weekly Shift Scheduler',
      policy: 'Overtime Policy Configuration',
      access_logs: 'Portal Access & Activity Audit',
    };
    logActivity(
      'Navigation',
      `Switched Tab to "${tabNames[tab] || tab}"`,
      `User navigated to screen section '${tab}'`,
      `Sidebar / Nav Item [${tab}]`
    );
  };

  // Handler: Access Log Management
  const handleAddAccessLog = (newLog: Omit<UserAccessLog, 'id'>) => {
    const logObj: UserAccessLog = {
      ...newLog,
      id: `LOG-${Date.now()}`,
    };
    setUserAccessLogs((prev) => [logObj, ...prev]);
  };

  const handleClearAccessLogs = () => {
    setUserAccessLogs([]);
    logActivity('System & Export', 'Cleared Portal Access & Activity Logs', 'Administrator cleared active log list', 'UserAccessLogs [Clear Logs]');
  };

  const handleTerminateSession = (logId: string) => {
    setUserAccessLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: 'Logged Out' } : l))
    );
    logActivity('Authentication', `Terminated Active Session ${logId}`, 'Administrator forced session logoff', 'UserAccessLogs [Terminate Session]');
  };

  // Handler: Add Attendance
  const handleAddAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev]);
    logActivity(
      'Clocking Action',
      `Clocked ${record.status} for ${record.employeeName}`,
      `Badge: ${record.badgeNumber}, Dept: ${record.department}, Check-In: ${record.checkInTime}`,
      `ClockingStation [Confirm Clock In]`
    );
  };

  // Handler: Update Attendance
  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
    logActivity(
      'Clocking Action',
      `Updated Shift Check-Out for ${record.employeeName}`,
      `Badge: ${record.badgeNumber}, Check-Out: ${record.checkOutTime || 'Active'}, OT Hours: ${record.overtimeHours}`,
      `ClockingStation [Clock Out]`
    );
  };

  // Handler: Delete Attendance
  const handleDeleteAttendance = (recordId: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== recordId));
    logActivity(
      'Clocking Action',
      `Deleted Attendance Record ${recordId}`,
      'Removed shift log from attendance register',
      'AttendanceLogs [Delete Entry]'
    );
  };

  // Handler: Add Overtime Request
  const handleAddRequest = (req: OvertimeRequest) => {
    setOvertimeRequests((prev) => [req, ...prev]);
    logActivity(
      'Overtime Approval',
      `Submitted New Overtime Request for ${req.employeeName}`,
      `Hours: ${req.estimatedHours} hrs (${req.overtimeType}), Reason: ${req.reasonCategory}`,
      `OvertimeRequests [Submit Form]`
    );
  };

  // Handler: Update Overtime Request
  const handleUpdateRequest = (req: OvertimeRequest) => {
    setOvertimeRequests((prev) => prev.map((r) => (r.id === req.id ? req : r)));
    logActivity(
      'Overtime Approval',
      `${req.status === 'Approved' ? 'Approved' : req.status === 'Rejected' ? 'Rejected' : 'Updated'} Overtime Request ${req.id}`,
      `Worker: ${req.employeeName} (${req.badgeNumber}), Status: ${req.status}, Approver: ${req.approvedByManager || 'Manager'}`,
      `OvertimeRequests [${req.status} Action]`
    );
  };

  // Handler: Batch Approve All Pending Requests
  const handleBatchApprove = () => {
    setOvertimeRequests((prev) =>
      prev.map((r) =>
        r.status === 'Pending'
          ? {
              ...r,
              status: 'Approved',
              approvedByManager: 'Plant Mgr. Firew (Batch Sign-off)',
              approvalDate: new Date().toISOString().split('T')[0],
              actualHoursWorked: r.estimatedHours,
            }
          : r
      )
    );
    logActivity(
      'Overtime Approval',
      'Batch Approved All Pending Overtime Requests',
      'Plant Manager batch signed-off all pending overtime items',
      'OvertimeRequests [Batch Approve All]'
    );
  };

  // Handler: Add Employee
  const handleAddEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
    logActivity('System & Export', `Added New Employee ${employee.fullName}`, `Badge: ${employee.badgeNumber}, Dept: ${employee.department}`, 'EmployeeRoster [Add Employee]');
  };

  // Handler: Update Employee
  const handleUpdateEmployee = (employee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? employee : e)));
    logActivity('System & Export', `Updated Employee Record ${employee.fullName}`, `Badge: ${employee.badgeNumber}, Rate: ${employee.hourlyRateETB} ETB/hr`, 'EmployeeRoster [Edit Employee]');
  };

  // Handler: Delete Employee
  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    logActivity('System & Export', `Removed Employee ${employeeId}`, 'Deleted employee profile from roster', 'EmployeeRoster [Delete]');
  };

  // Handler: Update Employee Overtime Accumulator
  const handleUpdateEmployeeOTHours = (employeeId: string, addedHours: number) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? { ...e, currentMonthOTHours: parseFloat((e.currentMonthOTHours + addedHours).toFixed(1)) }
          : e
      )
    );
  };


  // Handler: Save Policy Configuration
  const handleSavePolicy = (newPolicy: OvertimeRatePolicy) => {
    setPolicyState(newPolicy);
    logActivity(
      'Policy Update',
      'Updated Overtime Rate & Limit Policy',
      `Day: ${newPolicy.daytimeMultiplier}x, Night: ${newPolicy.nighttimeMultiplier}x, Rest Day: ${newPolicy.restDayMultiplier}x, Holiday: ${newPolicy.publicHolidayMultiplier}x, Limit: ${newPolicy.maxMonthlyHoursPerWorker} hrs`,
      'PolicyConfig [Save Settings]'
    );
  };

  // Handler: Reset to default demo data
  const handleResetData = () => {
    resetToDefaultData();
    setEmployees(loadEmployees());
    setAttendanceRecords(loadAttendance());
    setOvertimeRequests(loadRequests());
    setPolicyState(loadPolicy());
    logActivity('System & Export', 'Reset System Data to Default Demo State', 'Restored default dataset benchmarks', 'Sidebar [Reset Demo Data]');
  };

  const pendingRequestsCount = overtimeRequests.filter((r) => r.status === 'Pending').length;
  const exceededLimitCount = employees.filter((e) => e.currentMonthOTHours >= e.monthlyOvertimeLimitHours).length;

  const handleLogout = async () => {
    logActivity('Authentication', 'User Logged Out', 'User ended portal session', 'TopHeader [Logout]');
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error', err);
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 font-bold text-xs font-mono">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span>Authenticating AKAKKI KALITY MESOB CENTER...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onLoginSuccess={() => {}} />;
  }

  if (!currentUser.emailVerified) {
    return <AuthPage unverifiedEmail={currentUser.email || ''} onLoginSuccess={() => {}} />;
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col lg:flex-row transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950 ${
      darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Modern Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        pendingRequestsCount={pendingRequestsCount}
        exceededLimitCount={exceededLimitCount}
        onResetData={handleResetData}
        onQuickClockIn={() => handleSelectTab('clocking')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar with Night Mode, Language & Admin User Controls on Top Right */}
        <TopHeader
          darkMode={darkMode}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          setActiveTab={handleSelectTab}
        />

        {/* ADMIN WELCOME BANNER NOTICE */}
        {((currentUser?.uid === '9Cjupb7U1mMU8104mBDLqUugMar1') || currentUser?.email?.includes('admin')) && showAdminWelcome && (
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 px-4 sm:px-6 py-3 shadow-md border-b border-amber-600/40 relative animate-fadeIn">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-950 text-amber-400 rounded-xl shadow-md ring-2 ring-slate-950/20">
                  <Crown className="w-5 h-5 flex-shrink-0 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-950">
                      {t('admin_welcome_title')}
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-950 text-amber-400 text-[10px] font-extrabold rounded-md uppercase">
                      SYSTEM ADMIN ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-900 mt-0.5">
                    {t('admin_welcome_subtitle')}
                  </p>
                </div>
              </div>

              {/* Quick Action Shortcuts for Admin */}
              <div className="flex items-center space-x-2 pl-11 md:pl-0">
                <button
                  onClick={() => handleSelectTab('requests')}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  {t('admin_quick_pending')} ({pendingRequestsCount})
                </button>
                <button
                  onClick={() => handleSelectTab('roster')}
                  className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  {t('admin_quick_roster')}
                </button>
                <button
                  onClick={() => setShowAdminWelcome(false)}
                  className="p-1.5 text-slate-900 hover:text-slate-950 hover:bg-amber-400/80 rounded-xl transition-colors cursor-pointer"
                  title={t('dismiss_notice')}
                >
                  <X className="w-4 h-4 font-black" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            employees={employees}
            attendanceRecords={attendanceRecords}
            overtimeRequests={overtimeRequests}
            accessLogs={userAccessLogs}
            setActiveTab={handleSelectTab}
            onOpenPayrollModal={() => setIsPayrollModalOpen(true)}
          />
        )}


        {activeTab === 'clocking' && (
          <ClockingStation
            employees={employees}
            attendanceRecords={attendanceRecords}
            policy={policy}
            onAddAttendance={handleAddAttendance}
            onUpdateAttendance={handleUpdateAttendance}
            onUpdateEmployeeOTHours={handleUpdateEmployeeOTHours}
          />
        )}

        {activeTab === 'requests' && (
          <OvertimeRequests
            requests={overtimeRequests}
            employees={employees}
            onAddRequest={handleAddRequest}
            onUpdateRequest={handleUpdateRequest}
            onBatchApprove={handleBatchApprove}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceLogs
            attendanceRecords={attendanceRecords}
            employees={employees}
            onAddAttendance={handleAddAttendance}
            onUpdateAttendance={handleUpdateAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            onOpenPayrollModal={() => setIsPayrollModalOpen(true)}
          />
        )}

        {activeTab === 'roster' && (
          <EmployeeRoster
            employees={employees}
            attendanceRecords={attendanceRecords}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {activeTab === 'scheduler' && <ShiftScheduler employees={employees} />}

        {activeTab === 'policy' && (
          <PolicyConfig policy={policy} onSavePolicy={handleSavePolicy} />
        )}

        {activeTab === 'access_logs' && (
          isSystemAdmin ? (
            <UserAccessLogs
              logs={userAccessLogs}
              onAddLog={handleAddAccessLog}
              onClearLogs={handleClearAccessLogs}
              onTerminateSession={handleTerminateSession}
            />
          ) : (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Access Restricted</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Portal Access & Activity Audit logs are restricted to System Administrators only.
              </p>
              <button
                onClick={() => handleSelectTab('dashboard')}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )
        )}
      </main>

      {/* Printable Official Payroll Export Modal */}
      <PayrollExportModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        attendanceRecords={attendanceRecords}
        employees={employees}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 px-4 text-center text-xs border-t border-slate-800/80">
        <p>
          Akakki Kality Mesob Center • Overtime Attendance & Shift Operations Control System
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Compliant with Federal Democratic Republic of Ethiopia Labour Proclamation No. 1156/2019
        </p>
      </footer>
      </div>
    </div>
  );
}
