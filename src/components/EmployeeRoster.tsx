import React, { useState } from 'react';
import { Employee, Department, AttendanceRecord } from '../types';
import { Users, Search, Plus, AlertTriangle, Phone, Briefcase, DollarSign, Edit3, Trash2, ShieldCheck, UserCheck, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface EmployeeRosterProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

export const EmployeeRoster: React.FC<EmployeeRosterProps> = ({
  employees,
  attendanceRecords,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // New Employee Form State
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState(`AKC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [department, setDepartment] = useState<Department>('Steel Fabrication & Metal');
  const [jobTitle, setJobTitle] = useState('Machine Operator');
  const [hourlyRateETB, setHourlyRateETB] = useState<number>(140);
  const [phone, setPhone] = useState('+251 91 ');
  const [shift, setShift] = useState<any>('Morning (06:00 - 14:00)');
  const [monthlyLimit, setMonthlyLimit] = useState<number>(40);

  // Filtered employees
  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    const newEmp: Employee = {
      id: `EMP-${Date.now().toString().slice(-4)}`,
      badgeNumber,
      fullName,
      department,
      jobTitle,
      hourlyRateETB,
      shift,
      phone,
      status: 'Active',
      monthlyOvertimeLimitHours: monthlyLimit,
      currentMonthOTHours: 0,
    };

    onAddEmployee(newEmp);
    setIsAddModalOpen(false);
    setFullName('');
  };

  const handleEditSave = () => {
    if (!editingEmp) return;
    onUpdateEmployee(editingEmp);
    setEditingEmp(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>{t('roster_header_badge')}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{t('roster_header_title')}</h2>
          <p className="text-slate-300 text-xs mt-1">
            {t('roster_header_subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('register_staff')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500"
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

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const isOverCap = emp.currentMonthOTHours >= emp.monthlyOvertimeLimitHours;
          const isNearCap = emp.currentMonthOTHours >= emp.monthlyOvertimeLimitHours * 0.8;
          
          // Total ETB earned from attendance records
          const totalOTPay = attendanceRecords
            .filter((a) => a.employeeId === emp.id)
            .reduce((acc, curr) => acc + (curr.overtimePayETB || 0), 0);

          return (
            <div
              key={emp.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-all flex flex-col justify-between ${
                isOverCap 
                  ? 'border-red-300 dark:border-red-800 ring-1 ring-red-200 dark:ring-red-900 bg-red-50/10 dark:bg-red-950/20' 
                  : 'border-slate-200/80 dark:border-slate-800 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-slate-950 text-amber-400 font-bold text-sm flex items-center justify-center shadow">
                      {emp.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {emp.badgeNumber}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{emp.fullName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{emp.jobTitle}</p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/60">
                    {emp.hourlyRateETB} ETB/h
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-[11px] font-semibold">Department:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{emp.department}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-[11px] font-semibold">Shift:</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{emp.shift}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-[11px] font-semibold">Total OT Pay Earned:</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">{totalOTPay.toFixed(2)} ETB</span>
                  </div>
                </div>

                {/* Overtime Cap Progress Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Monthly Overtime Cap</span>
                    <span
                      className={`font-extrabold ${
                        isOverCap ? 'text-red-600 dark:text-red-400' : isNearCap ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {emp.currentMonthOTHours} / {emp.monthlyOvertimeLimitHours} hrs
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverCap ? 'bg-red-500' : isNearCap ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (emp.currentMonthOTHours / emp.monthlyOvertimeLimitHours) * 100)}%`,
                      }}
                    />
                  </div>

                  {isOverCap && (
                    <div className="mt-2 text-[10px] font-bold text-red-600 bg-red-50 p-1.5 rounded flex items-center space-x-1 border border-red-100">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span>Monthly limit exceeded! Rest required.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{emp.phone}</span>
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingEmp(emp)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Edit Worker Info"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete employee ${emp.fullName} from directory?`)) {
                        onDeleteEmployee(emp.id);
                      }
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Delete Worker"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Register Akaki Kality Employee</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Number</label>
                  <input
                    type="text"
                    required
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Steel Fabrication & Metal">Steel Fabrication & Metal</option>
                    <option value="Textile & Garments">Textile & Garments</option>
                    <option value="Electrical & Mechanical">Electrical & Mechanical</option>
                    <option value="Quality Assurance & Metallurgy">Quality Assurance & Metallurgy</option>
                    <option value="Logistics & Heavy Fleet">Logistics & Heavy Fleet</option>
                    <option value="HR & Plant Administration">HR & Plant Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Rate (ETB/hour)</label>
                  <input
                    type="number"
                    required
                    value={hourlyRateETB}
                    onChange={(e) => setHourlyRateETB(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Overtime Cap (hrs)</label>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(parseInt(e.target.value) || 40)}
                    className="w-full px-3 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Assignment</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Morning (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                  <option value="Afternoon (14:00 - 22:00)">Afternoon Shift (14:00 - 22:00)</option>
                  <option value="Night (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                  <option value="Special / Weekend">Special / Weekend</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-600 cursor-pointer shadow"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 border-b pb-2">Edit Worker: {editingEmp.fullName}</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Base Hourly Rate (ETB)</label>
              <input
                type="number"
                value={editingEmp.hourlyRateETB}
                onChange={(e) => setEditingEmp({ ...editingEmp, hourlyRateETB: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Overtime Cap (Hours)</label>
              <input
                type="number"
                value={editingEmp.monthlyOvertimeLimitHours}
                onChange={(e) => setEditingEmp({ ...editingEmp, monthlyOvertimeLimitHours: parseInt(e.target.value) || 40 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={editingEmp.phone}
                onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingEmp(null)}
                className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-1.5 font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-600 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
