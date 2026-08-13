import React, { useState } from 'react';
import { OvertimeRequest, Employee, OvertimeType, Department } from '../types';
import { ShieldCheck, Plus, Search, Filter, CheckCircle2, XCircle, Clock, AlertTriangle, Building2, FileText, CheckCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OvertimeRequestsProps {
  requests: OvertimeRequest[];
  employees: Employee[];
  onAddRequest: (req: OvertimeRequest) => void;
  onUpdateRequest: (req: OvertimeRequest) => void;
  onBatchApprove: () => void;
}

export const OvertimeRequests: React.FC<OvertimeRequestsProps> = ({
  requests,
  employees,
  onAddRequest,
  onUpdateRequest,
  onBatchApprove,
}) => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Request Form State
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState<number>(3.5);
  const [overtimeType, setOvertimeType] = useState<OvertimeType>('Daytime Standard (1.25x)');
  const [reasonCategory, setReasonCategory] = useState<any>('Production Quota Surplus');
  const [justification, setJustification] = useState<string>('');
  const [requestedBySupervisor, setRequestedBySupervisor] = useState<string>('Eng. Solomon Worku');

  // Rejection modal
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Monthly overtime limit exceeded under company policy.');

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || r.department === departmentFilter;
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.justification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDept && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  const handleSubmitNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const newReq: OvertimeRequest = {
      id: `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.fullName,
      badgeNumber: selectedEmployee.badgeNumber,
      department: selectedEmployee.department,
      requestDate: new Date().toISOString().split('T')[0],
      scheduledDate,
      estimatedHours,
      overtimeType,
      reasonCategory,
      justification: justification || `${reasonCategory} pre-authorized overtime shift.`,
      requestedBySupervisor,
      status: 'Pending',
    };

    onAddRequest(newReq);
    setIsModalOpen(false);
    setJustification('');
  };

  const handleApprove = (req: OvertimeRequest) => {
    const updated: OvertimeRequest = {
      ...req,
      status: 'Approved',
      approvedByManager: 'Plant Mgr. Firew (Operations)',
      approvalDate: new Date().toISOString().split('T')[0],
      actualHoursWorked: req.estimatedHours,
    };
    onUpdateRequest(updated);
  };

  const handleConfirmReject = () => {
    if (!rejectionModalId) return;
    const req = requests.find((r) => r.id === rejectionModalId);
    if (req) {
      const updated: OvertimeRequest = {
        ...req,
        status: 'Rejected',
        approvedByManager: 'HR Director Martha',
        rejectionReason: rejectionReason,
      };
      onUpdateRequest(updated);
    }
    setRejectionModalId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('ot_requests_badge')}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{t('ot_requests_title')}</h2>
          <p className="text-slate-300 text-xs mt-1">
            {t('ot_requests_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={onBatchApprove}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{t('batch_approve_pending')} ({pendingCount})</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('submit_new_request')}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status === 'All' ? t('all_statuses') : status === 'Pending' ? t('status_pending') : status === 'Approved' ? t('status_approved') : t('status_rejected')}
              {status === 'Pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Department Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
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
      </div>

      {/* Requests List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((req) => {
          const emp = employees.find((e) => e.id === req.employeeId);
          const isOverCap = emp ? emp.currentMonthOTHours >= emp.monthlyOvertimeLimitHours : false;

          return (
            <div
              key={req.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-all ${
                req.status === 'Pending'
                  ? 'border-amber-300 dark:border-amber-500/60 ring-1 ring-amber-200 dark:ring-amber-500/30'
                  : req.status === 'Approved'
                  ? 'border-emerald-200 dark:border-emerald-800/80'
                  : 'border-red-200 dark:border-red-900/80 bg-red-50/20 dark:bg-red-950/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {req.id}
                    </span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                      {req.department}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">{req.employeeName}</h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{req.badgeNumber}</p>
                </div>

                <div>
                  {req.status === 'Pending' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Manager Sign-off</span>
                    </span>
                  ) : req.status === 'Approved' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/80">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Justification details */}
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Reason Category:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{req.reasonCategory}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold text-slate-800">Scheduled Date:</span>
                  <span className="font-mono font-bold text-slate-900">{req.scheduledDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold text-slate-800">Estimated OT:</span>
                  <span className="font-bold text-amber-700">{req.estimatedHours} Hours ({req.overtimeType})</span>
                </div>
                <p className="text-slate-600 pt-1 border-t border-slate-200/80 italic">"{req.justification}"</p>
              </div>

              {/* Overtime Cap Alert if applicable */}
              {isOverCap && (
                <div className="mt-2 text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg flex items-center space-x-1 border border-red-100">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Worker has reached monthly {emp?.monthlyOvertimeLimitHours}h cap ({emp?.currentMonthOTHours} hrs logged).</span>
                </div>
              )}

              {/* Authorization Signature Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Supervisor: <strong className="text-slate-800">{req.requestedBySupervisor}</strong></span>
                
                {req.status === 'Approved' && (
                  <span className="text-emerald-700 font-semibold">Sign-off: {req.approvedByManager}</span>
                )}
                {req.status === 'Rejected' && (
                  <span className="text-red-600 font-semibold truncate max-w-[180px]">Note: {req.rejectionReason}</span>
                )}
              </div>

              {/* Action Buttons for Pending */}
              {req.status === 'Pending' && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center space-x-2">
                  <button
                    onClick={() => handleApprove(req)}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve OT</span>
                  </button>

                  <button
                    onClick={() => setRejectionModalId(req.id)}
                    className="w-1/2 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 border border-red-200 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>New Overtime Pre-Authorization Request</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.badgeNumber}) — {e.department} [{e.hourlyRateETB} ETB/h]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled OT Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Overtime Multiplier Tier</label>
                  <select
                    value={overtimeType}
                    onChange={(e) => setOvertimeType(e.target.value as OvertimeType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Daytime Standard (1.25x)">Daytime Standard (1.25x)</option>
                    <option value="Night Shift (1.50x)">Night Shift (1.50x)</option>
                    <option value="Rest Day / Sunday (2.00x)">Rest Day / Sunday (2.00x)</option>
                    <option value="Public Holiday (2.50x)">Public Holiday (2.50x)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason Category</label>
                  <select
                    value={reasonCategory}
                    onChange={(e) => setReasonCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Emergency Equipment Maintenance">Emergency Equipment Maintenance</option>
                    <option value="Production Quota Surplus">Production Quota Surplus</option>
                    <option value="Batch Export Order Deadline">Batch Export Order Deadline</option>
                    <option value="Inventory Stocktaking">Inventory Stocktaking</option>
                    <option value="Special Shift Replacement">Special Shift Replacement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supervisor Authorization Name</label>
                <input
                  type="text"
                  value={requestedBySupervisor}
                  onChange={(e) => setRequestedBySupervisor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Justification Notes</label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain production necessity, machine breakdown details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  Submit Pre-Authorization Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Provide Rejection Reason</h3>
            <p className="text-xs text-slate-600">Please record official reason for declining overtime authorization:</p>
            
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectionModalId(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
