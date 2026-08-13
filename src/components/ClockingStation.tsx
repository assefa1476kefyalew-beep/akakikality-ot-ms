import React, { useState } from 'react';
import { Employee, AttendanceRecord, OvertimeType, OvertimeRatePolicy } from '../types';
import { Clock, QrCode, Search, CheckCircle, UserCheck, AlertTriangle, ShieldCheck, DollarSign, LogOut, LogIn, Sparkles, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ClockingStationProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  policy: OvertimeRatePolicy;
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onUpdateEmployeeOTHours: (employeeId: string, addedHours: number) => void;
}

export const ClockingStation: React.FC<ClockingStationProps> = ({
  employees,
  attendanceRecords,
  policy,
  onAddAttendance,
  onUpdateAttendance,
  onUpdateEmployeeOTHours,
}) => {
  const { t } = useLanguage();
  const [searchBadge, setSearchBadge] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
  
  // Form State
  const [shiftType, setShiftType] = useState<any>('Morning (06:00 - 14:00)');
  const [overtimeType, setOvertimeType] = useState<OvertimeType>('Daytime Standard (1.25x)');
  const [clockInTime, setClockInTime] = useState<string>(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  const [clockOutTime, setClockOutTime] = useState<string>(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  const [manualHours, setManualHours] = useState<number>(3.0);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [supervisorName, setSupervisorName] = useState<string>('Eng. Solomon Worku');
  const [notes, setNotes] = useState<string>('Approved overtime shift for plant production targets.');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered employees for quick search
  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchBadge.toLowerCase()) ||
      e.badgeNumber.toLowerCase().includes(searchBadge.toLowerCase()) ||
      e.department.toLowerCase().includes(searchBadge.toLowerCase())
  );

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Active check-in session for selected employee if currently clocked in
  const activeRecord = attendanceRecords.find(
    (r) => r.employeeId === selectedEmployeeId && (r.status === 'Present' || r.status === 'Overtime Active')
  );

  // Multiplier Helper
  const getMultiplier = (type: OvertimeType): number => {
    if (type.includes('1.25')) return policy.daytimeMultiplier;
    if (type.includes('1.50')) return policy.nighttimeMultiplier;
    if (type.includes('2.00')) return policy.restDayMultiplier;
    if (type.includes('2.50')) return policy.publicHolidayMultiplier;
    return policy.daytimeMultiplier;
  };

  // Calculate estimated OT ETB payout
  const currentMultiplier = getMultiplier(overtimeType);
  const estimatedPayETB = selectedEmployee
    ? parseFloat((manualHours * selectedEmployee.hourlyRateETB * currentMultiplier).toFixed(2))
    : 0;

  // Handle Clock-In / Start OT
  const handleStartShift = (isOvertime: boolean) => {
    if (!selectedEmployee) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-6)}`,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.fullName,
      badgeNumber: selectedEmployee.badgeNumber,
      department: selectedEmployee.department,
      date: todayStr,
      checkInTime: clockInTime,
      checkOutTime: null,
      shiftType: shiftType,
      regularHours: isOvertime ? 0 : 8,
      overtimeHours: isOvertime ? manualHours : 0,
      overtimeType: overtimeType,
      overtimeMultiplier: currentMultiplier,
      overtimePayETB: isOvertime ? estimatedPayETB : 0,
      status: isOvertime ? 'Overtime Active' : 'Present',
      notes: notes,
      approvedBy: supervisorName,
    };

    onAddAttendance(newRecord);
    setSuccessMessage(
      `Clock-In Recorded! ${selectedEmployee.fullName} (${selectedEmployee.badgeNumber}) started ${
        isOvertime ? 'Overtime Shift' : 'Regular Shift'
      } at ${clockInTime}.`
    );
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Handle Clock-Out
  const handleClockOut = () => {
    if (!activeRecord || !selectedEmployee) return;

    // Calculate hours if clock out time provided
    let otHours = activeRecord.overtimeHours || manualHours;
    let otPay = activeRecord.overtimePayETB || (otHours * selectedEmployee.hourlyRateETB * activeRecord.overtimeMultiplier);

    const updatedRecord: AttendanceRecord = {
      ...activeRecord,
      checkOutTime: clockOutTime,
      overtimeHours: otHours,
      overtimePayETB: parseFloat(otPay.toFixed(2)),
      status: 'Completed',
    };

    onUpdateAttendance(updatedRecord);
    if (otHours > 0) {
      onUpdateEmployeeOTHours(selectedEmployee.id, otHours);
    }

    setSuccessMessage(
      `Clock-Out Recorded! ${selectedEmployee.fullName} completed shift at ${clockOutTime}. Total OT: ${otHours} hrs (${otPay.toFixed(
        2
      )} ETB).`
    );
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <QrCode className="w-4 h-4" />
            <span>Badge Scanner & Overtime Terminal</span>
          </div>
          <h2 className="text-xl font-bold text-white">Plant Worker Clock-In Station</h2>
          <p className="text-slate-300 text-xs mt-1">
            Search or scan Akaki Kality employee badge IDs to clock in, log overtime hours, or record supervisor approvals.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700 text-xs font-mono">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          <span>System Time: {new Date().toLocaleTimeString('en-US', { hour12: true })}</span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-center space-x-3 text-emerald-900 shadow-md">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-bold">{successMessage}</p>
        </div>
      )}

      {/* Terminal Main Layout */}
      {/* Terminal Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Worker Selector Directory */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Employee Badge</h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {employees.length} Staff
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchBadge}
              onChange={(e) => setSearchBadge(e.target.value)}
              placeholder="Search name, badge ID (e.g. AKC-1001)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
            />
          </div>

          {/* Employee List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto pr-1">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === selectedEmployeeId;
              const hasActiveSession = attendanceRecords.some(
                (r) => r.employeeId === emp.id && (r.status === 'Present' || r.status === 'Overtime Active')
              );
              const isOverCap = emp.currentMonthOTHours >= emp.monthlyOvertimeLimitHours;

              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {emp.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{emp.fullName}</p>
                        {hasActiveSession && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Active On Shift" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{emp.badgeNumber} • {emp.department}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{emp.hourlyRateETB} ETB/hr</p>
                    <p
                      className={`text-[10px] font-bold ${
                        isOverCap ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {emp.currentMonthOTHours}/{emp.monthlyOvertimeLimitHours}h OT
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Clocking Action Control Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-6">
          {selectedEmployee ? (
            <>
              {/* Selected Employee ID Card */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-5 rounded-2xl text-white shadow-lg border border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-md">
                      {selectedEmployee.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        {selectedEmployee.badgeNumber}
                      </span>
                      <h3 className="text-lg font-black text-white mt-0.5">{selectedEmployee.fullName}</h3>
                      <p className="text-xs text-slate-300 font-medium">{selectedEmployee.jobTitle}</p>
                      <p className="text-xs text-amber-400 font-semibold">{selectedEmployee.department}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Base Hourly Pay</span>
                    <span className="text-2xl font-black text-emerald-400">{selectedEmployee.hourlyRateETB.toFixed(2)}</span>
                    <span className="text-xs font-bold text-slate-300 ml-1">ETB</span>
                  </div>
                </div>

                {/* Overtime Cap Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-700/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Monthly Overtime Cap Progress</span>
                    <span
                      className={`font-bold ${
                        selectedEmployee.currentMonthOTHours >= selectedEmployee.monthlyOvertimeLimitHours
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {selectedEmployee.currentMonthOTHours} / {selectedEmployee.monthlyOvertimeLimitHours} Hours
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedEmployee.currentMonthOTHours >= selectedEmployee.monthlyOvertimeLimitHours
                          ? 'bg-red-500'
                          : selectedEmployee.currentMonthOTHours > selectedEmployee.monthlyOvertimeLimitHours * 0.8
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (selectedEmployee.currentMonthOTHours / selectedEmployee.monthlyOvertimeLimitHours) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Session Status if clocked in */}
              {activeRecord ? (
                <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                      <h4 className="text-sm font-bold uppercase tracking-wider">Active Shift Session In Progress</h4>
                    </div>
                    <p className="text-xs text-amber-800 mt-1">
                      Clocked in at <span className="font-bold font-mono">{activeRecord.checkInTime}</span> ({activeRecord.shiftType}).
                      Overtime rate: <span className="font-bold">{activeRecord.overtimeType}</span>.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={clockOutTime}
                      onChange={(e) => setClockOutTime(e.target.value)}
                      className="px-2 py-1 text-xs font-mono bg-white border border-amber-300 rounded-lg"
                    />
                    <button
                      onClick={handleClockOut}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Clock-Out Worker</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* New Clock-In Options Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Clock-In / Start Overtime Session</span>
                    </h4>
                    <label className="flex items-center space-x-2 text-xs text-slate-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isManualOverride}
                        onChange={(e) => setIsManualOverride(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Manual Overtime Entry</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Shift Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Shift Schedule</label>
                      <select
                        value={shiftType}
                        onChange={(e) => setShiftType(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Morning (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                        <option value="Afternoon (14:00 - 22:00)">Afternoon Shift (14:00 - 22:00)</option>
                        <option value="Night (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                        <option value="Special / Weekend">Special / Weekend Shift</option>
                      </select>
                    </div>

                    {/* Overtime Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Overtime Multiplier Tier</label>
                      <select
                        value={overtimeType}
                        onChange={(e) => setOvertimeType(e.target.value as OvertimeType)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                      >
                        <option value="Daytime Standard (1.25x)">Daytime Standard (1.25x - Workdays 6am-10pm)</option>
                        <option value="Night Shift (1.50x)">Night Shift (1.50x - Workdays 10pm-6am)</option>
                        <option value="Rest Day / Sunday (2.00x)">Rest Day / Sunday (2.00x Double Rate)</option>
                        <option value="Public Holiday (2.50x)">Public Holiday (2.50x Ethiopian Holiday Rate)</option>
                      </select>
                    </div>

                    {/* Clock-In Time */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Clock-In Time</label>
                      <input
                        type="time"
                        value={clockInTime}
                        onChange={(e) => setClockInTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Overtime Hours */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Overtime Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="12"
                        value={manualHours}
                        onChange={(e) => setManualHours(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Supervisor Approval */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Authorizing Supervisor</label>
                      <input
                        type="text"
                        value={supervisorName}
                        onChange={(e) => setSupervisorName(e.target.value)}
                        placeholder="Supervisor Name..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Calculated Pay Preview Box */}
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Estimated OT Pay</span>
                        <span className="text-xs text-emerald-700">
                          {manualHours} hrs × {currentMultiplier}x rate
                        </span>
                      </div>
                      <span className="text-base font-black text-emerald-800">{estimatedPayETB.toFixed(2)} ETB</span>
                    </div>
                  </div>

                  {/* Notes / Reason */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Work Description / Justification</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Urgently finishing structural steel beam batch..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => handleStartShift(false)}
                      className="w-full sm:w-1/2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Clock-In Regular Shift</span>
                    </button>

                    <button
                      onClick={() => handleStartShift(true)}
                      className="w-full sm:w-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-all transform active:scale-95 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-slate-950" />
                      <span>Start Overtime Shift ({estimatedPayETB.toFixed(0)} ETB)</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <QrCode className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold">No Employee Selected</p>
              <p className="text-xs">Select an employee from the left panel to record attendance or clock overtime.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
