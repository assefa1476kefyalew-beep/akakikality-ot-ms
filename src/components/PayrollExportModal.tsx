import React from 'react';
import { AttendanceRecord, Employee } from '../types';
import { Factory, Printer, X, Download, Award, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PayrollExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
}

export const PayrollExportModal: React.FC<PayrollExportModalProps> = ({
  isOpen,
  onClose,
  attendanceRecords,
  employees,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const totalOTHours = attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
  const totalOTPayETB = attendanceRecords.reduce((sum, r) => sum + (r.overtimePayETB || 0), 0);

  // Department Aggregations
  const deptSummary: Record<string, { hours: number; pay: number; workerCount: Set<string> }> = {};
  
  attendanceRecords.forEach((r) => {
    if (!deptSummary[r.department]) {
      deptSummary[r.department] = { hours: 0, pay: 0, workerCount: new Set() };
    }
    deptSummary[r.department].hours += r.overtimeHours || 0;
    deptSummary[r.department].pay += r.overtimePayETB || 0;
    deptSummary[r.department].workerCount.add(r.employeeId);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 shadow-2xl space-y-6 print:p-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="text-base font-black text-slate-900">{t('payroll_slip_title')}</h3>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Content */}
        <div className="space-y-6 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-900 text-amber-400 rounded-xl">
                <Factory className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">{t('company_full_name')}</h1>
                <p className="text-xs font-semibold text-slate-600">{t('company_address')}</p>
                <p className="text-[11px] font-mono text-slate-500">Document Ref: AKC-OT-PAYROLL-{new Date().toISOString().slice(0, 10)}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-200">
                {t('monthly_ot_summary')}
              </span>
              <p className="text-xs font-bold text-slate-700 mt-2">{t('date')}: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Top Key Figures */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">{t('kpi_monthly_ot_hours')}</span>
              <span className="text-2xl font-black text-slate-900">{totalOTHours.toFixed(1)} hrs</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">{t('total_workers_logged')}</span>
              <span className="text-2xl font-black text-slate-900">{Object.keys(deptSummary).reduce((acc, d) => acc + deptSummary[d].workerCount.size, 0)} {t('total_employees')}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">{t('total_ot_pay')}</span>
              <span className="text-2xl font-black text-emerald-700">{totalOTPayETB.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB</span>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. {t('dept_breakdown')}</h4>
            <table className="w-full text-left border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[11px]">
                  <th className="py-2 px-3 border border-slate-700">{t('col_department')}</th>
                  <th className="py-2 px-3 border border-slate-700">{t('total_employees')}</th>
                  <th className="py-2 px-3 border border-slate-700">{t('kpi_monthly_ot_hours')}</th>
                  <th className="py-2 px-3 border border-slate-700 text-right">{t('col_est_pay')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.keys(deptSummary).map((dept) => (
                  <tr key={dept}>
                    <td className="py-2 px-3 font-bold text-slate-800">{dept}</td>
                    <td className="py-2 px-3 font-semibold text-slate-600">{deptSummary[dept].workerCount.size} Workers</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{deptSummary[dept].hours.toFixed(1)} hrs</td>
                    <td className="py-2 px-3 font-black text-emerald-700 text-right">{deptSummary[dept].pay.toFixed(2)} ETB</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td className="py-2.5 px-3">GRAND TOTALS</td>
                  <td className="py-2.5 px-3">—</td>
                  <td className="py-2.5 px-3">{totalOTHours.toFixed(1)} hrs</td>
                  <td className="py-2.5 px-3 text-right text-emerald-800 text-sm">{totalOTPayETB.toFixed(2)} ETB</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Individual Shift Logs Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">2. Individual Shift Overtime Schedule</h4>
            <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-3">Employee Name</th>
                  <th className="py-2 px-3">Badge ID</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">OT Hours</th>
                  <th className="py-2 px-3">Rate</th>
                  <th className="py-2 px-3 text-right">Pay (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendanceRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="py-1.5 px-3 font-bold text-slate-900">{r.employeeName}</td>
                    <td className="py-1.5 px-3 font-mono text-slate-600">{r.badgeNumber}</td>
                    <td className="py-1.5 px-3 font-mono">{r.date}</td>
                    <td className="py-1.5 px-3 font-bold">{r.overtimeHours} hrs</td>
                    <td className="py-1.5 px-3">{r.overtimeMultiplier}x</td>
                    <td className="py-1.5 px-3 font-bold text-emerald-700 text-right">{r.overtimePayETB.toFixed(2)} ETB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Signature Blocks */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
            <div className="border-t-2 border-slate-900 pt-2 space-y-1">
              <p className="font-bold uppercase text-slate-900">Prepared By (Timekeeper)</p>
              <p className="text-[11px] text-slate-500">Yonas Kebede Fikru</p>
              <p className="text-[10px] text-slate-400 italic">Signature & Date</p>
            </div>

            <div className="border-t-2 border-slate-900 pt-2 space-y-1">
              <p className="font-bold uppercase text-slate-900">Verified By (HR Manager)</p>
              <p className="text-[11px] text-slate-500">Martha Tadesse</p>
              <p className="text-[10px] text-slate-400 italic">Signature & Date</p>
            </div>

            <div className="border-t-2 border-slate-900 pt-2 space-y-1">
              <p className="font-bold uppercase text-slate-900">Approved By (Plant General Manager)</p>
              <p className="text-[11px] text-slate-500">Eng. Firew Wolde</p>
              <p className="text-[10px] text-slate-400 italic">Signature & Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
