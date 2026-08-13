/**
 * Types for Akaki Kality Company Overtime Attendance Management System
 */

export type Department = 
  | 'Steel Fabrication & Metal'
  | 'Textile & Garments'
  | 'Electrical & Mechanical'
  | 'Quality Assurance & Metallurgy'
  | 'Logistics & Heavy Fleet'
  | 'HR & Plant Administration';

export type ShiftType = 'Morning (06:00 - 14:00)' | 'Afternoon (14:00 - 22:00)' | 'Night (22:00 - 06:00)' | 'Special / Weekend';

export type OvertimeType = 'Daytime Standard (1.25x)' | 'Night Shift (1.50x)' | 'Rest Day / Sunday (2.00x)' | 'Public Holiday (2.50x)';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

export interface Employee {
  id: string;
  badgeNumber: string; // e.g., AKC-8042
  fullName: string;
  department: Department;
  jobTitle: string;
  hourlyRateETB: number; // Base rate in Ethiopian Birr
  shift: ShiftType;
  phone: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  monthlyOvertimeLimitHours: number; // e.g., 40 hrs limit per month
  currentMonthOTHours: number;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  badgeNumber: string;
  department: Department;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm
  checkOutTime: string | null; // HH:mm
  shiftType: ShiftType;
  regularHours: number;
  overtimeHours: number;
  overtimeType: OvertimeType;
  overtimeMultiplier: number; // e.g., 1.25, 1.5, 2.0, 2.5
  overtimePayETB: number;
  status: 'Present' | 'Late' | 'Overtime Active' | 'Completed' | 'Absent';
  notes?: string;
  approvedBy?: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  badgeNumber: string;
  department: Department;
  requestDate: string; // YYYY-MM-DD
  scheduledDate: string; // YYYY-MM-DD
  estimatedHours: number;
  overtimeType: OvertimeType;
  reasonCategory: 'Emergency Equipment Maintenance' | 'Production Quota Surplus' | 'Batch Export Order Deadline' | 'Inventory Stocktaking' | 'Special Shift Replacement';
  justification: string;
  requestedBySupervisor: string;
  status: RequestStatus;
  approvedByManager?: string;
  approvalDate?: string;
  rejectionReason?: string;
  actualHoursWorked?: number;
}

export interface OvertimeRatePolicy {
  daytimeMultiplier: number; // Standard 1.25
  nighttimeMultiplier: number; // Night 1.50
  restDayMultiplier: number; // Weekend 2.00
  publicHolidayMultiplier: number; // Holiday 2.50
  maxMonthlyHoursPerWorker: number; // 40 hrs default
  autoDeductBreakMinutes: number; // 30 mins after 4 hrs OT
  nightShiftStart: string; // "22:00"
  nightShiftEnd: string; // "06:00"
}

export interface DailySummary {
  date: string;
  totalPresent: number;
  totalOvertimeWorkers: number;
  totalOvertimeHours: number;
  totalOvertimePayETB: number;
}

export type ActivityCategory = 
  | 'Authentication' 
  | 'Navigation' 
  | 'Clocking Action' 
  | 'Overtime Approval' 
  | 'Policy Update' 
  | 'System & Export' 
  | 'User Interaction';

export interface UserAccessLog {
  id: string;
  email: string;
  fullName: string;
  role: 'System Administrator (Admin)' | 'Plant Operations Supervisor' | 'HR & Timekeeping Manager' | 'Shift Operator';
  accessTime: string; // ISO date-time
  displayTime: string; // Formatted EAT time
  loginMethod: 'Firebase Auth' | 'Email & Password' | 'Quick Portal Access' | 'Session Sync' | 'UI Action Listener';
  ipAddress: string;
  location: string;
  userAgent: string;
  status: 'Active Session' | 'Logged In' | 'Logged Out' | 'Activity Executed';
  badgeNumber?: string;
  category: ActivityCategory;
  actionTitle: string; // e.g., "Navigated to Overtime Requests", "Clicked Badge Clock-IN"
  actionDetails?: string; // e.g., "Target: Button [Export Payroll CSV]"
  targetElement?: string;
}


