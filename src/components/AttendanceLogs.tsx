import React, { useState } from 'react';
import { AttendanceRecord, Employee, OvertimeType, Department } from '../types';
import { FileSpreadsheet, Search, Download, Printer, Plus, Trash2, Edit2, Filter, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AttendanceLogsProps {
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (recordId: string) => void;
  onOpenPayrollModal: () => void;
}

export const AttendanceLogs: React.FC<AttendanceLogsProps> = ({
  attendanceRecords,
  employees,
  onAddAttendance,
  onUpdateAttendance,
  onDeleteAttendance,
  onOpenPayrollModal,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Editing state
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Record State
  const [newEmpId, setNewEmpId] = useState(employees[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCheckIn, setNewCheckIn] = useState('06:00');
  const [newCheckOut, setNewCheckOut] = useState('17:30');
  const [newOTHours, setNewOTHours] = useState(3.5);
  const [newOTType, setNewOTType] = useState<OvertimeType>('Daytime Standard (1.25x)');
  const [newNotes, setNewNotes] = useState('Manual shift log entry by timekeeper.');

  // Filter records
  const filteredRecords = attendanceRecords.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.approvedBy && r.approvedBy.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = departmentFilter === 'All' || r.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesStart = !startDate || r.date >= startDate;
    const matchesEnd = !endDate || r.date <= endDate;

    return matchesSearch && matchesDept && matchesStatus && matchesStart && matchesEnd;
  });

  // Export CSV Helper
  const exportToCSV = () => {
    const headers = ['ID', 'Employee Name', 'Badge Number', 'Department', 'Date', 'Check In', 'Check Out', 'Shift', 'Regular Hours', 'Overtime Hours', 'OT Rate Multiplier', 'OT Pay ETB', 'Status', 'Supervisor Notes'];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.employeeName}"`,
      r.badgeNumber,
      `"${r.department}"`,
      r.date,
      r.checkInTime,
      r.checkOutTime || 'Active',
      `"${r.shiftType}"`,
      r.regularHours,
      r.overtimeHours,
      r.overtimeMultiplier,
      r.overtimePayETB,
      r.status,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Akaki_Kality_Overtime_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit New Record
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newEmpId);
    if (!emp) return;

    let multiplier = 1.25;
    if (newOTType.includes('1.50')) multiplier = 1.50;
    else if (newOTType.includes('2.00')) multiplier = 2.00;
    else if (newOTType.includes('2.50')) multiplier = 2.50;

    const otPay = parseFloat((newOTHours * emp.hourlyRateETB * multiplier).toFixed(2));

    const record: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-6)}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      badgeNumber: emp.badgeNumber,
      department: emp.department,
      date: newDate,
      checkInTime: newCheckIn,
      checkOutTime: newCheckOut,
      shiftType: emp.shift,
      regularHours: 8,
      overtimeHours: newOTHours,
      overtimeType: newOTType,
      overtimeMultiplier: multiplier,
      overtimePayETB: otPay,
      status: 'Completed',
      notes: newNotes,
      approvedBy: 'Timekeeper Entry',
    };

    onAddAttendance(record);
    setIsNewModalOpen(false);
  };

  // Submit Edit Record
  const handleEditSave = () => {
    if (!editingRecord) return;
    const emp = employees.find((e) => e.id === editingRecord.employeeId);
    if (!emp) return;

    const otPay = parseFloat((editingRecord.overtimeHours * emp.hourlyRateETB * editingRecord.overtimeMultiplier).toFixed(2));
    onUpdateAttendance({ ...editingRecord, overtimePayETB: otPay });
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('att_header_title')}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{t('nav_attendance')}</h2>
          <p className="text-slate-300 text-xs mt-1">
            {t('att_header_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-700 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{t('export_csv')}</span>
          </button>

          <button
            onClick={onOpenPayrollModal}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-lg cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print')}</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_manual_log')}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">{t('filter_by_dept')}</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="All">{t('all_departments')}</option>
              <option value="Steel Fabrication & Metal">Steel Fabrication & Metal</option>
              <option value="Textile & Garments">Textile & Garments</option>
              <option value="Electrical & Mechanical">Electrical & Mechanical</option>
              <option value="Quality Assurance & Metallurgy">Quality Assurance & Metallurgy</option>
              <option value="Logistics & Heavy Fleet">Logistics & Heavy Fleet</option>
              <option value="HR & Plant Administration">HR & Plant Administration</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">{t('filter_by_status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="All">{t('all_statuses')}</option>
              <option value="Overtime Active">{t('status_active_ot')}</option>
              <option value="Completed">{t('status_completed')}</option>
              <option value="Present">{t('active_now')}</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">{t('start_date')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">{t('end_date')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Master Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">{t('col_employee')} & {t('col_badge_id')}</th>
                <th className="py-3.5 px-4">{t('col_department')} & {t('shift')}</th>
                <th className="py-3.5 px-4">{t('col_date')}</th>
                <th className="py-3.5 px-4">{t('col_time_in_out')}</th>
                <th className="py-3.5 px-4">{t('col_ot_hours')}</th>
                <th className="py-3.5 px-4">{t('rate_tier')}</th>
                <th className="py-3.5 px-4">{t('col_est_pay')}</th>
                <th className="py-3.5 px-4">{t('col_status')}</th>
                <th className="py-3.5 px-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{r.employeeName}</p>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {r.badgeNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">{r.department}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.shiftType}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{r.date}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {r.checkInTime} -{' '}
                      {r.checkOutTime || <span className="text-amber-600 dark:text-amber-400 font-bold animate-pulse">Active</span>}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 dark:text-white text-sm">{r.overtimeHours} hrs</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {r.overtimeMultiplier.toFixed(2)}x
                      </span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{r.overtimeType}</p>
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                      {r.overtimePayETB.toFixed(2)} ETB
                    </td>
                    <td className="py-3 px-4">
                      {r.status === 'Overtime Active' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Active OT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setEditingRecord(r)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit Log Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete attendance entry for ${r.employeeName}?`)) {
                              onDeleteAttendance(r.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No attendance logs matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manual Record Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Add Manual Attendance Log</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee</label>
                <select
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.badgeNumber}) — {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">OT Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newOTHours}
                    onChange={(e) => setNewOTHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clock In</label>
                  <input
                    type="time"
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clock Out</label>
                  <input
                    type="time"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Overtime Multiplier Tier</label>
                <select
                  value={newOTType}
                  onChange={(e) => setNewOTType(e.target.value as OvertimeType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Daytime Standard (1.25x)">Daytime Standard (1.25x)</option>
                  <option value="Night Shift (1.50x)">Night Shift (1.50x)</option>
                  <option value="Rest Day / Sunday (2.00x)">Rest Day / Sunday (2.00x)</option>
                  <option value="Public Holiday (2.50x)">Public Holiday (2.50x)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-600 shadow cursor-pointer"
                >
                  Save Log Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Log Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 border-b pb-2">Edit Attendance Record: {editingRecord.employeeName}</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Overtime Hours</label>
              <input
                type="number"
                step="0.5"
                value={editingRecord.overtimeHours}
                onChange={(e) => setEditingRecord({ ...editingRecord, overtimeHours: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clock-In Time</label>
              <input
                type="time"
                value={editingRecord.checkInTime}
                onChange={(e) => setEditingRecord({ ...editingRecord, checkInTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clock-Out Time</label>
              <input
                type="time"
                value={editingRecord.checkOutTime || ''}
                onChange={(e) => setEditingRecord({ ...editingRecord, checkOutTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-1.5 font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-600 cursor-pointer"
              >
                Update Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
