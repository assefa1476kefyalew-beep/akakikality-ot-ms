import React, { useState } from 'react';
import { OvertimeRatePolicy } from '../types';
import { Settings, Shield, Clock, AlertTriangle, Save, RotateCcw, CheckCircle2, DollarSign } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PolicyConfigProps {
  policy: OvertimeRatePolicy;
  onSavePolicy: (policy: OvertimeRatePolicy) => void;
}

export const PolicyConfig: React.FC<PolicyConfigProps> = ({ policy, onSavePolicy }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<OvertimeRatePolicy>({ ...policy });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePolicy(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>{t('policy_header_badge')}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{t('policy_header_title')}</h2>
          <p className="text-slate-300 text-xs mt-1">
            {t('policy_header_subtitle')}
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-center space-x-3 text-emerald-900 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-bold">{t('policy_saved_success')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multiplier Tiers Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>{t('ot_multiplier_tiers')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('hourly_surcharges_desc')}</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Tier 1 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block">{t('daytime_ot_label')}</label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('rate_day_ot')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="3.0"
                  value={form.daytimeMultiplier}
                  onChange={(e) => setForm({ ...form, daytimeMultiplier: parseFloat(e.target.value) || 1.25 })}
                  className="w-20 px-2.5 py-1.5 font-bold text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">x</span>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block">{t('nighttime_ot_label')}</label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('rate_night_ot')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="3.0"
                  value={form.nighttimeMultiplier}
                  onChange={(e) => setForm({ ...form, nighttimeMultiplier: parseFloat(e.target.value) || 1.50 })}
                  className="w-20 px-2.5 py-1.5 font-bold text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-purple-200 dark:border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">x</span>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block">{t('rest_day_ot_label')}</label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('rate_weekend')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="4.0"
                  value={form.restDayMultiplier}
                  onChange={(e) => setForm({ ...form, restDayMultiplier: parseFloat(e.target.value) || 2.00 })}
                  className="w-20 px-2.5 py-1.5 font-bold text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-amber-200 dark:border-amber-800 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">x</span>
              </div>
            </div>

            {/* Tier 4 */}
            <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40 flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block">{t('holiday_ot_label')}</label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('rate_holiday')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="4.0"
                  value={form.publicHolidayMultiplier}
                  onChange={(e) => setForm({ ...form, publicHolidayMultiplier: parseFloat(e.target.value) || 2.50 })}
                  className="w-20 px-2.5 py-1.5 font-bold text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-red-200 dark:border-red-800 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Limits & Thresholds Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Company Overtime Limits & Breaks</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Workforce safety caps and automated deductions</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Default Maximum Monthly Overtime Cap (Hours)
                </label>
                <input
                  type="number"
                  value={form.maxMonthlyHoursPerWorker}
                  onChange={(e) => setForm({ ...form, maxMonthlyHoursPerWorker: parseInt(e.target.value) || 40 })}
                  className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Triggers compliance warnings when workers reach this threshold in a single month.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Auto-Deduct Break Time (Minutes)
                </label>
                <input
                  type="number"
                  value={form.autoDeductBreakMinutes}
                  onChange={(e) => setForm({ ...form, autoDeductBreakMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Automatically deducted for rest when overtime shifts exceed 4 consecutive hours.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Night Shift Start</label>
                  <input
                    type="time"
                    value={form.nightShiftStart}
                    onChange={(e) => setForm({ ...form, nightShiftStart: e.target.value })}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Night Shift End</label>
                  <input
                    type="time"
                    value={form.nightShiftEnd}
                    onChange={(e) => setForm({ ...form, nightShiftEnd: e.target.value })}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setForm({ ...policy })}
              className="px-4 py-2 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Policy Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
