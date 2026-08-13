/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Crown, X, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import {
  Employee,
  AttendanceRecord,
  OvertimeRequest,
  OvertimeRatePolicy,
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
    setDarkMode((prev) => !prev);
  };

  // Core Application Data State
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(loadAttendance);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(loadRequests);
  const [policy, setPolicyState] = useState<OvertimeRatePolicy>(loadPolicy);

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

  // Handler: Add Attendance
  const handleAddAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev]);
  };

  // Handler: Update Attendance
  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
  };

  // Handler: Delete Attendance
  const handleDeleteAttendance = (recordId: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  // Handler: Add Overtime Request
  const handleAddRequest = (req: OvertimeRequest) => {
    setOvertimeRequests((prev) => [req, ...prev]);
  };

  // Handler: Update Overtime Request
  const handleUpdateRequest = (req: OvertimeRequest) => {
    setOvertimeRequests((prev) => prev.map((r) => (r.id === req.id ? req : r)));
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
  };

  // Handler: Add Employee
  const handleAddEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
  };

  // Handler: Update Employee
  const handleUpdateEmployee = (employee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? employee : e)));
  };

  // Handler: Delete Employee
  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
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
  };

  // Handler: Reset to default demo data
  const handleResetData = () => {
    resetToDefaultData();
    setEmployees(loadEmployees());
    setAttendanceRecords(loadAttendance());
    setOvertimeRequests(loadRequests());
    setPolicyState(loadPolicy());
  };

  const pendingRequestsCount = overtimeRequests.filter((r) => r.status === 'Pending').length;
  const exceededLimitCount = employees.filter((e) => e.currentMonthOTHours >= e.monthlyOvertimeLimitHours).length;

  const handleLogout = async () => {
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
        setActiveTab={setActiveTab}
        pendingRequestsCount={pendingRequestsCount}
        exceededLimitCount={exceededLimitCount}
        onResetData={handleResetData}
        onQuickClockIn={() => setActiveTab('clocking')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar with Night Mode, Language & Admin User Controls on Top Right */}
        <TopHeader
          darkMode={darkMode}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          setActiveTab={setActiveTab}
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
                  onClick={() => setActiveTab('requests')}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  {t('admin_quick_pending')} ({pendingRequestsCount})
                </button>
                <button
                  onClick={() => setActiveTab('roster')}
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
            setActiveTab={setActiveTab}
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
