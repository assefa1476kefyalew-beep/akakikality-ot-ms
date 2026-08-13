import React, { useState } from 'react';
import { CalendarDays, Clock, Users, Shield, Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Employee, Department } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ShiftSchedulerProps {
  employees: Employee[];
}

export const ShiftScheduler: React.FC<ShiftSchedulerProps> = ({ employees }) => {
  const { t } = useLanguage();
  const [selectedWeek, setSelectedWeek] = useState('Aug 10 - Aug 16, 2026');

  const days = [
    { name: 'Monday', date: 'Aug 10' },
    { name: 'Tuesday', date: 'Aug 11' },
    { name: 'Wednesday', date: 'Aug 12' },
    { name: 'Thursday', date: 'Aug 13' },
    { name: 'Friday', date: 'Aug 14' },
    { name: 'Saturday', date: 'Aug 15' },
    { name: 'Sunday (Rest)', date: 'Aug 16' },
  ];

  const departments: Department[] = [
    'Steel Fabrication & Metal',
    'Textile & Garments',
    'Electrical & Mechanical',
    'Quality Assurance & Metallurgy',
    'Logistics & Heavy Fleet',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>{t('scheduler_header_badge')}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{t('scheduler_header_title')}</h2>
          <p className="text-slate-300 text-xs mt-1">
            {t('scheduler_header_subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-amber-400 font-mono">{selectedWeek}</span>
          <button className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 text-left w-56">{t('col_department')}</th>
              {days.map((d) => (
                <th key={d.name} className="py-3 px-2 text-center">
                  <span className="block text-slate-900 dark:text-white font-bold">{d.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{d.date}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {departments.map((dept) => {
              const deptWorkers = employees.filter((e) => e.department === dept);

              return (
                <tr key={dept} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-3 font-bold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                    <p className="text-xs">{dept}</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {deptWorkers.length} {t('active_operators')}
                    </span>
                  </td>

                  {days.map((day, idx) => {
                    const isSunday = day.name.includes('Sunday');
                    const isSaturday = day.name.includes('Saturday');
                    const hasOT = (idx + dept.length) % 2 === 0;

                    return (
                      <td key={day.name} className="py-3 px-2 text-center align-top border-r border-slate-100/80 dark:border-slate-800/80">
                        <div className="space-y-1.5">
                          {/* Shift Label */}
                          <div
                            className={`p-1.5 rounded-lg text-[10px] font-bold ${
                              isSunday
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                                : isSaturday
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                : 'bg-slate-900 dark:bg-slate-950 text-white border border-slate-800'
                            }`}
                          >
                            {isSunday ? t('rate_weekend') : idx % 2 === 0 ? 'Morning (06-14)' : 'Afternoon (14-22)'}
                          </div>

                          {/* Pre-Allocated Overtime Slot */}
                          {hasOT && (
                            <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 p-1.5 rounded-lg text-[10px] font-bold shadow-xs">
                              <span className="block text-amber-700 dark:text-amber-400">{t('in_overtime')}</span>
                              <span className="font-mono text-amber-900 dark:text-amber-200 text-[11px]">
                                {isSunday ? '+8 hrs (2.0x)' : '+3.5 hrs (1.25x)'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
