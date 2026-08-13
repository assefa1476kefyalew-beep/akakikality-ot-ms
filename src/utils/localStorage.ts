import { Employee, AttendanceRecord, OvertimeRequest, OvertimeRatePolicy } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_REQUESTS, INITIAL_POLICY } from '../data/mockData';

const KEYS = {
  EMPLOYEES: 'akaki_kality_employees_v1',
  ATTENDANCE: 'akaki_kality_attendance_v1',
  REQUESTS: 'akaki_kality_requests_v1',
  POLICY: 'akaki_kality_policy_v1',
};

export const loadEmployees = (): Employee[] => {
  try {
    const data = localStorage.getItem(KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
  } catch (err) {
    console.error('Failed loading employees', err);
    return INITIAL_EMPLOYEES;
  }
};

export const saveEmployees = (employees: Employee[]): void => {
  try {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (err) {
    console.error('Failed saving employees', err);
  }
};

export const loadAttendance = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
  } catch (err) {
    console.error('Failed loading attendance', err);
    return INITIAL_ATTENDANCE;
  }
};

export const saveAttendance = (records: AttendanceRecord[]): void => {
  try {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (err) {
    console.error('Failed saving attendance', err);
  }
};

export const loadRequests = (): OvertimeRequest[] => {
  try {
    const data = localStorage.getItem(KEYS.REQUESTS);
    return data ? JSON.parse(data) : INITIAL_REQUESTS;
  } catch (err) {
    console.error('Failed loading requests', err);
    return INITIAL_REQUESTS;
  }
};

export const saveRequests = (requests: OvertimeRequest[]): void => {
  try {
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed saving requests', err);
  }
};

export const loadPolicy = (): OvertimeRatePolicy => {
  try {
    const data = localStorage.getItem(KEYS.POLICY);
    return data ? JSON.parse(data) : INITIAL_POLICY;
  } catch (err) {
    console.error('Failed loading policy', err);
    return INITIAL_POLICY;
  }
};

export const savePolicy = (policy: OvertimeRatePolicy): void => {
  try {
    localStorage.setItem(KEYS.POLICY, JSON.stringify(policy));
  } catch (err) {
    console.error('Failed saving policy', err);
  }
};

export const resetToDefaultData = (): void => {
  localStorage.removeItem(KEYS.EMPLOYEES);
  localStorage.removeItem(KEYS.ATTENDANCE);
  localStorage.removeItem(KEYS.REQUESTS);
  localStorage.removeItem(KEYS.POLICY);
};
