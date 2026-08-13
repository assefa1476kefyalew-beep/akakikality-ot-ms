import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'am' | 'om';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const languageNames: Record<Language, { name: string; flag: string; label: string }> = {
  en: { name: 'English', flag: '🇬🇧', label: 'English' },
  am: { name: 'አማርኛ', flag: '🇪🇹', label: 'Amharic (አማርኛ)' },
  om: { name: 'Afaan Oromoo', flag: '🇪🇹', label: 'Oromiffa (Afaan Oromoo)' },
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General & Brand
    app_title: 'AKAKKI KALITY',
    app_subtitle: 'MESOB CENTER',
    app_tagline: 'Overtime Attendance & Shift Operations Control System',
    app_brand_interactive: 'Akaki Kality Overtime Attendance System',
    app_ethiopia: 'Ethiopia',
    ethiopia_location: 'Addis Ababa, Ethiopia',
    ethiopian_labour_law: 'FDRE Labour Proclamation No. 1156/2019 Compliant',
    management_portal: 'Management Portal',

    // Admin Welcome & Interactive System Modal
    admin_welcome_title: 'Welcome, System Administrator!',
    admin_welcome_subtitle: 'System Administrator access granted to Akaki Kality Operations Portal. Full operational control & policy management features are enabled.',
    admin_quick_pending: 'Review Pending OT',
    admin_quick_roster: 'View Staff Roster',
    admin_quick_policy: 'Rate Policies',
    dismiss_notice: 'Dismiss',
    system_info_title: 'Akaki Kality Overtime & Attendance System Info',
    system_status_operational: '100% Operational',
    system_location_val: 'Akaki Kality Sub-City Industrial Zone, Addis Ababa',
    system_compliance_val: 'Ethiopian Labour Proclamation No. 1156/2019 Compliant',
    system_active_lines: 'Active Production Lines: 6 Active Plant Units',
    
    // Sidebar Navigation
    nav_dashboard: 'Plant Dashboard',
    nav_clocking: 'Badge Terminal',
    nav_requests: 'OT Approvals',
    nav_attendance: 'Master Logs',
    nav_roster: 'Employee Roster',
    nav_scheduler: 'Shift Roster',
    nav_policy: 'Rate Policies',

    // Sidebar Actions
    badge_clock_terminal: 'Badge Clock Terminal',
    clock_terminal: 'Clock Terminal',
    day_mode: 'Day Mode',
    night_mode: 'Night Mode',
    light_theme: 'Light',
    dark_theme: 'Dark',
    reset_demo: 'Reset Demo Data',
    sign_out: 'Sign Out',
    select_language: 'Language',
    account_info: 'Account Info',
    account_profile: 'Operator Profile',
    verified_account: 'Verified Account',
    filter_navigation: 'Search navigation...',
    live_plant_clock: 'Plant Time (EAT)',
    active_operator_session: 'Active Operator Session',
    plant_supervisor: 'Plant Operations Supervisor',
    sys_admin: 'System Administrator (Admin)',
    admin_badge: 'Admin Access',
    admin_role: 'Plant Operations Admin',
    
    // Auth Page
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    sign_in_title: 'Sign In to Access Dashboard',
    sign_up_title: 'Sign Up for System Access',
    sign_in_subtitle: 'Enter registered email & password',
    sign_up_subtitle: 'Create credentials to access OT management',
    full_name: 'Full Name',
    email_address: 'Email Address',
    password: 'Password',
    sign_in_button: 'Sign In to Portal',
    sign_up_button: 'Create Account & Verify',
    resend_verification: 'Resend Verification Email',
    email_verification_required: 'Email Verification Required',
    verification_sent_to: 'We have sent you a verification email to',
    please_verify: 'Please verify it and log in.',
    auth_footer: 'AKAKKI KALITY MESOB CENTER • Labour Proclamation Compliant System',
    
    // Dashboard
    dash_subcity_plant: 'Akaki Kality Sub-City Industrial Plant',
    dash_monitor_title: 'Overtime & Shift Operations Monitor',
    dash_monitor_desc: 'Real-time control station for shift clocking, Ethiopian labour law overtime multipliers (1.25x - 2.50x), supervisor authorization queues, and company payroll metrics.',
    dash_gen_ot_slip: 'Generate OT Summary Slip',
    kpi_active_clock_ins: 'Active Shift Clock-Ins',
    kpi_monthly_ot_hours: 'Monthly OT Hours',
    kpi_ot_cost_estimate: 'OT Cost Estimate',
    kpi_pending_ot_requests: 'Pending OT Requests',
    in_overtime: 'in Overtime',
    total_employees: 'Total Employees',
    logged_across_shifts: 'Logged across plant shifts',
    ethiopian_birr_accrued: 'Ethiopian Birr accrued',
    over_limit: 'Over Limit',
    review_requests: 'Review Requests',
    ot_distribution_by_dept: 'Overtime Distribution by Department',
    cumulative_hours: 'Cumulative hours across plant production units',
    ot_category_multipliers: 'OT Category Multipliers',
    labour_law_rate_tiers: 'Ethiopian labour law rate tiers',
    daily_ot_trend: 'Daily Plant Overtime Trend',
    total_ot_hours_per_day: 'Total overtime hours logged per day',
    recent_attendance_log: 'Recent Plant Attendance & Active Overtime Log',
    live_clock_in_statuses: 'Live clock-in statuses and completed overtime shifts',
    view_master_log: 'View Master Log',
    
    // Table Headers
    col_employee: 'Employee',
    col_badge_id: 'Badge ID',
    col_department: 'Department',
    col_date: 'Date',
    col_time_in_out: 'Time (In - Out)',
    col_ot_hours: 'OT Hours',
    col_rate_mult: 'Rate Mult',
    col_est_pay: 'Est Pay (ETB)',
    col_status: 'Status',
    
    // Status Badges
    status_active_ot: 'Active OT',
    status_completed: 'Completed',
    status_pending: 'Pending',
    status_approved: 'Approved',
    status_rejected: 'Rejected',

    // Clocking Terminal Component
    clock_in: 'Clock In',
    clock_out: 'Clock Out',
    badge_number_placeholder: 'Enter Badge Number (e.g., AKM-101)',
    scan_or_type_badge: 'Scan or type employee badge ID',
    select_employee: 'Select Employee',
    enter_badge_id: 'Enter Badge ID',
    active_now: 'Active Now',

    // Roster & Requests
    add_new_employee: 'Add New Employee',
    request_overtime: 'Request Overtime',
    export_payroll: 'Export Payroll (CSV/Excel)',
    shift_schedule: 'Shift Schedule',
    policy_settings: 'Overtime Policy Settings',
    
    // Multipliers
    rate_day_ot: 'Day Overtime (6am-10pm)',
    rate_night_ot: 'Night Overtime (10pm-6am)',
    rate_weekend: 'Weekly Rest Day',
    rate_holiday: 'Public Holiday',

    // Common UI & Actions
    search_placeholder: 'Search name, badge ID, or details...',
    all_departments: 'All Departments',
    all_statuses: 'All Statuses',
    filter_by_dept: 'Filter Department',
    filter_by_status: 'Filter Status',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    close: 'Close',
    print: 'Print Document / Save PDF',
    export_csv: 'Export CSV',
    notes: 'Notes / Justification',
    supervisor: 'Supervisor',
    manager: 'Manager',
    date: 'Date',
    shift: 'Shift',

    // Attendance Logs Component
    att_header_title: 'Master Plant Attendance & Overtime Log',
    att_header_subtitle: 'Official shift attendance records, clock-in time logs, overtime rate tiers, and supervisor approvals.',
    add_manual_log: 'Add Manual Log',
    start_date: 'Start Date',
    end_date: 'End Date',
    regular_hours: 'Regular Hours',
    rate_tier: 'Rate Tier',
    add_record_modal_title: 'Add Manual Shift & Overtime Record',
    edit_record_modal_title: 'Edit Attendance Record',

    // Employee Roster Component
    roster_header_title: 'Employee Roster & Monthly Overtime Caps',
    roster_header_subtitle: 'Manage worker base rates in ETB, shift department assignments, and 40-hour monthly overtime compliance caps.',
    roster_header_badge: 'Plant Workforce Directory',
    register_staff: 'Register New Staff',
    base_hourly_rate: 'Hourly Base Rate (ETB)',
    monthly_ot_cap: 'Monthly Overtime Cap',
    current_month_ot: 'Current Month OT',
    phone_number: 'Phone Number',
    job_title: 'Job Title',
    shift_assignment: 'Shift Assignment',

    // Overtime Requests Component
    ot_requests_title: 'Pre-Authorized Overtime Requests',
    ot_requests_subtitle: 'Supervisor pre-authorization portal to approve or decline plant overtime hours before shift execution.',
    ot_requests_badge: 'Supervisor Overtime Approvals',
    submit_new_request: 'Submit New OT Request',
    batch_approve_pending: 'Batch Approve Pending',
    estimated_hours: 'Estimated Hours',
    scheduled_date: 'Scheduled Date',
    reason_category: 'Reason Category',
    justification: 'Justification',
    approve_request: 'Approve',
    reject_request: 'Reject',
    rejection_modal_title: 'Decline Overtime Request',
    rejection_reason_label: 'Reason for Rejection',

    // Policy Config Component
    policy_header_title: 'Overtime Multipliers & Company Policy Configuration',
    policy_header_subtitle: 'Configure overtime rate multipliers, maximum monthly hour caps, and night shift operational parameters.',
    policy_header_badge: 'Ethiopian Labour Law Compliance Setup',
    policy_saved_success: 'Policy Settings Saved Successfully! All future overtime pay calculations will reflect these multipliers.',
    ot_multiplier_tiers: 'Overtime Multiplier Tiers',
    hourly_surcharges_desc: 'Hourly base rate surcharges applied during overtime',
    daytime_ot_label: 'Daytime Standard OT (06:00 - 22:00)',
    nighttime_ot_label: 'Night Shift OT (22:00 - 06:00)',
    rest_day_ot_label: 'Rest Day / Sunday OT',
    holiday_ot_label: 'Public Holiday OT',
    max_monthly_ot_cap: 'Maximum Monthly Overtime Cap (Hours/Worker)',
    daily_ot_soft_cap: 'Daily Overtime Soft Limit (Hours/Shift)',
    save_policy_settings: 'Save Policy Settings',
    reset_to_defaults: 'Reset to Legal Defaults',

    // Shift Scheduler Component
    scheduler_header_title: 'Department Shift & Overtime Roster Matrix',
    scheduler_header_subtitle: 'Weekly plant shift schedules, night rotation coverage, and pre-scheduled weekend overtime allocations.',
    scheduler_header_badge: 'Weekly Plant Roster',
    active_operators: 'Active Operators',

    // Payroll Export Modal Component
    payroll_slip_title: 'Official Akaki Kality Overtime Payroll Slip',
    company_full_name: 'AKAKI KALITY INDUSTRIAL COMPANY',
    company_address: 'Akaki Kality Sub-City, Addis Ababa, Federal Democratic Republic of Ethiopia',
    monthly_ot_summary: 'MONTHLY OVERTIME SUMMARY',
    total_workers_logged: 'Total Workers Logged',
    total_ot_pay: 'Total OT Pay (ETB)',
    dept_breakdown: 'Department Overtime Payroll Breakdown',

    // Clocking Terminal Extra Labels
    badge_scan_title: 'Plant Clock-In & Overtime Terminal',
    clock_in_success: 'Clocked In Successfully',
    clock_out_success: 'Clocked Out Successfully',
    select_active_employee: 'Select Employee from Active List',
    manual_badge_entry: 'Manual Badge ID Entry',
    confirm_clock_in: 'Confirm Clock-In',
    confirm_clock_out: 'Confirm Clock-Out',
    active_shift_duration: 'Active Shift Duration',
  },
  am: {
    // General & Brand
    app_title: 'አቃቂ ቃሊቲ',
    app_subtitle: 'መሶብ ማዕከል',
    app_tagline: 'የትርፍ ሰዓት አቴንዳንስ እና የሺፍት ኦፕሬሽን መቆጣጠሪያ ስርዓት',
    app_brand_interactive: 'የአቃቂ ቃሊቲ ትርፍ ሰዓት አቴንዳንስ ስርዓት',
    app_ethiopia: 'ኢትዮጵያ',
    ethiopia_location: 'አዲስ አበባ፣ ኢትዮጵያ',
    ethiopian_labour_law: 'በኢፌዴሪ የአዋጅ ቁጥር 1156/2011 መሠረት የተዘጋጀ',
    management_portal: 'የአመራር ፖርታል',

    // Admin Welcome & Interactive System Modal
    admin_welcome_title: 'እንኳን ደህና መጡ፣ ዋና አስተዳዳሪ!',
    admin_welcome_subtitle: 'ወደ አቃቂ ቃሊቲ ስራዎች ፖርታል በዋና አስተዳዳሪነት ገብተዋል። ሙሉ የቁጥጥር እና የፖሊሲ ማስተካከያ መብቶች ተሰጥተውዎታል።',
    admin_quick_pending: 'የሚጠበቁ ጥያቄዎችን መርምር',
    admin_quick_roster: 'የሰራተኞችን ዝርዝር ተመልከት',
    admin_quick_policy: 'የክፍያ ፖሊሲዎች',
    dismiss_notice: 'ዘጋው',
    system_info_title: 'የአቃቂ ቃሊቲ ትርፍ ሰዓት እና አቴንዳንስ ስርዓት መረጃ',
    system_status_operational: '100% በስራ ላይ',
    system_location_val: 'አቃቂ ቃሊቲ ክፍለ ከተማ የኢንዱስትሪ ዞን፣ አዲስ አበባ',
    system_compliance_val: 'በኢፌዴሪ የሰራተኞች አዋጅ ቁጥር 1156/2011 መሠረት የተቃኘ',
    system_active_lines: 'በስራ ላይ ያሉ የማምረቻ ክፍሎች፡ 6 የፋብሪካ ክፍሎች',
    
    // Sidebar Navigation
    nav_dashboard: 'የፕላንት ዳሽቦርድ',
    nav_clocking: 'የባጅ ተርሚናል',
    nav_requests: 'የትርፍ ሰዓት ፈቃድ',
    nav_attendance: 'ዋና መዝገብ',
    nav_roster: 'የሰራተኞች ዝርዝር',
    nav_scheduler: 'የሺፍት መርሃግብር',
    nav_policy: 'የክፍያ ፖሊሲ',

    // Sidebar Actions
    badge_clock_terminal: 'የባጅ ሰዓት መመዝገቢያ',
    clock_terminal: 'ሰዓት መመዝገቢያ',
    day_mode: 'የቀን ሁነታ',
    night_mode: 'የማታ ሁነታ',
    light_theme: 'ብርሃን',
    dark_theme: 'ጨለማ',
    reset_demo: 'የሙከራ መረጃ አድስ',
    sign_out: 'ውጣ (Sign Out)',
    select_language: 'ቋንቋ (Language)',
    account_info: 'የመለያ መረጃ',
    account_profile: 'የተቆጣጣሪ ፕሮፋይል',
    verified_account: 'የተረጋገጠ መለያ',
    filter_navigation: 'ሜኑ ፈልግ...',
    live_plant_clock: 'የፋብሪካው ሰዓት',
    active_operator_session: 'ስራ ላይ ያለ መለያ',
    plant_supervisor: 'የፋብሪካ ስራ ተቆጣጣሪ',
    sys_admin: 'ዋና አስተዳዳሪ (Admin)',
    admin_badge: 'የአስተዳዳሪ መብት',
    admin_role: 'የፋብሪካ ስራዎች አስተዳዳሪ',
    
    // Auth Page
    sign_in: 'ግencoded / ግባ',
    sign_up: 'ተመዝገብ',
    sign_in_title: 'ወደ ዳሽቦርድ ለመግባት ይግቡ',
    sign_up_title: 'ለስርዓቱ መዳረሻ ይመዝገቡ',
    sign_in_subtitle: 'የተመዘገበ ኢሜይል እና የይለፍ ቃል ያስገቡ',
    sign_up_subtitle: 'የትርፍ ሰዓት አስተዳደርን ለመጠቀም መለያ ይፍጠሩ',
    full_name: 'ሙሉ ስም',
    email_address: 'ኢሜይል አድራሻ',
    password: 'የይለፍ ቃል',
    sign_in_button: 'ወደ ፖርታል ግባ',
    sign_up_button: 'መለያ ፍጠር እና አረጋግጥ',
    resend_verification: 'የማረጋገጫ ኢሜይል ደግመህ ላክ',
    email_verification_required: 'የኢሜይል ማረጋገጫ ያስፈልጋል',
    verification_sent_to: 'የማረጋገጫ ኢሜይል ወደዚህ ተላክቷል፡',
    please_verify: 'እባክዎን ኢሜይልዎን አረጋግጠው ይግቡ።',
    auth_footer: 'አቃቂ ቃሊቲ መሶብ ማዕከል • በኢትዮጵያ የሰራተኞች አዋጅ መሠረት የተዘጋጀ',
    
    // Dashboard
    dash_subcity_plant: 'አቃቂ ቃሊቲ ክፍለ ከተማ የኢንዱስትሪ ፋብሪካ',
    dash_monitor_title: 'የትርፍ ሰዓት እና የሺፍት ስራዎች ተቆጣጣሪ',
    dash_monitor_desc: 'የሺፍት መመዝገቢያ፣ በኢትዮጵያ የሰራተኞች አዋጅ መሠረት የተዘጋጁ የትርፍ ሰዓት ክፍያ ብዜቶች (1.25x - 2.50x)፣ የተቆጣጣሪዎች ማጽደቂያ እና የደመወዝ መረጃዎች በቀጥታ የሚቆጣጠሩበት ማዕከል፤',
    dash_gen_ot_slip: 'የትርፍ ሰዓት ደመወዝ ወረቀት አውጣ',
    kpi_active_clock_ins: 'በስራ ላይ ያሉ ሰራተኞች',
    kpi_monthly_ot_hours: 'የወሩ የትርፍ ሰዓት (ሰዓት)',
    kpi_ot_cost_estimate: 'የትርፍ ሰዓት ክፍያ ግምት',
    kpi_pending_ot_requests: 'የሚጠበቁ ጥያቄዎች',
    in_overtime: 'በትርፍ ሰዓት ላይ',
    total_employees: 'ጠቅላላ ሰራተኞች',
    logged_across_shifts: 'በፋብሪካው ሺፍቶች የተመዘገበ',
    ethiopian_birr_accrued: 'የተሰበሰበ የኢትዮጵያ ብር',
    over_limit: 'ከወሰን በላይ',
    review_requests: 'ጥያቄዎችን መርምር',
    ot_distribution_by_dept: 'የትርፍ ሰዓት ክፍፍል በክፍል',
    cumulative_hours: 'በፋብሪካ ክፍሎች የተመዘገበ ድምር ሰዓት',
    ot_category_multipliers: 'የትርፍ ሰዓት ብዜት ምድቦች',
    labour_law_rate_tiers: 'የኢትዮጵያ የሰራተኛ ህግ ክፍያ ተመኖች',
    daily_ot_trend: 'የዕለታዊ ትርፍ ሰዓት እንቅስቃሴ',
    total_ot_hours_per_day: 'በቀን የተመዘገበ ጠቅላላ የትርፍ ሰዓት',
    recent_attendance_log: 'የቅርብ ጊዜ አቴንዳንስ እና ትርፍ ሰዓት መዝገብ',
    live_clock_in_statuses: 'የቀጥታ መግቢያ እና የተጠናቀቁ የትርፍ ሰዓት ስራዎች',
    view_master_log: 'ሙሉ መዝገብ ተመልከት',
    
    // Table Headers
    col_employee: 'ሰራተኛ',
    col_badge_id: 'የባጅ ቁጥር',
    col_department: 'የስራ ክፍል',
    col_date: 'ቀን',
    col_time_in_out: 'ሰዓት (መግቢያ - መውጫ)',
    col_ot_hours: 'የትርፍ ሰዓት',
    col_rate_mult: 'የክፍያ ብዜት',
    col_est_pay: 'ክፍያ (ብር)',
    col_status: 'ሁኔታ',

    // Status Badges
    status_active_ot: 'በትርፍ ሰዓት ላይ',
    status_completed: 'ተጠናቋል',
    status_pending: 'በመጠበቅ ላይ',
    status_approved: 'ፅድቋል',
    status_rejected: 'ተ ውድቋል',

    // Clocking Terminal Component
    clock_in: 'ግባ (Clock In)',
    clock_out: 'ውጣ (Clock Out)',
    badge_number_placeholder: 'የባጅ ቁጥር ያስገቡ (ምሳሌ፡ AKM-101)',
    scan_or_type_badge: 'የሰራተኛ ባጅ ቁጥር ያንብቡ ወይም ይፃፉ',
    select_employee: 'ሰራተኛ ይምረጡ',
    enter_badge_id: 'የባጅ ቁጥር ያስገቡ',
    active_now: 'አሁን በስራ ላይ',

    // Roster & Requests
    add_new_employee: 'አዲስ ሰራተኛ መዝግብ',
    request_overtime: 'ትርፍ ሰዓት ጠይቅ',
    export_payroll: 'የደመወዝ መረጃ አውርድ (CSV/Excel)',
    shift_schedule: 'የሺፍት ፕሮግራም',
    policy_settings: 'የትርፍ ሰዓት ህግ መቼቶች',

    // Multipliers
    rate_day_ot: 'የቀን ትርፍ ሰዓት (12፡00 - 4፡00)',
    rate_night_ot: 'የሌሊት ትርፍ ሰዓት (4፡00 - 12፡00)',
    rate_weekend: 'የሳምንት ዕረፍት ቀን',
    rate_holiday: 'የህዝብ በዓል ቀን',

    // Common UI & Actions
    search_placeholder: 'በስም፣ በባጅ ቁጥር ወይም በዝርዝር ፈልግ...',
    all_departments: 'ሁሉም ክፍሎች',
    all_statuses: 'ሁሉም ሁኔታዎች',
    filter_by_dept: 'በክፍል ለይ',
    filter_by_status: 'በሁኔታ ለይ',
    actions: 'እርምጃዎች',
    edit: 'አስተካክል',
    delete: 'ሰርዝ',
    cancel: 'ሰርዝ (Cancel)',
    save: 'ስራውን አስቀምጥ',
    confirm: 'አረጋግጥ',
    close: 'ዝጋ',
    print: 'ሰነድ አትም / PDF አስቀምጥ',
    export_csv: 'በ CSV አውርድ',
    notes: 'ማስታወሻ / ምክንያት',
    supervisor: 'ተቆጣጣሪ',
    manager: 'ስራ አስኪያጅ',
    date: 'ቀን',
    shift: 'ሺፍት',

    // Attendance Logs Component
    att_header_title: 'የፋብሪካው ዋና የአቴንዳንስ እና ትርፍ ሰዓት መዝገብ',
    att_header_subtitle: 'የሺፍት መግቢያ እና መውጫ መዝገቦች፣ የትርፍ ሰዓት ተመኖች እና የተቆጣጣሪ ማረጋገጫዎች።',
    add_manual_log: 'በእጅ መዝግብ',
    start_date: 'የመጀመሪያ ቀን',
    end_date: 'የመጨረሻ ቀን',
    regular_hours: 'መደበኛ ሰዓታት',
    rate_tier: 'የክፍያ ደረጃ',
    add_record_modal_title: 'አዲስ የሺፍት እና ትርፍ ሰዓት መዝገብ አስገባ',
    edit_record_modal_title: 'የአቴንዳንስ መዝገብ አስተካክል',

    // Employee Roster Component
    roster_header_title: 'የሰራተኞች ዝርዝር እና የወርሃዊ ትርፍ ሰዓት ወሰን',
    roster_header_subtitle: 'የሰራተኞችን የመነሻ ክፍያ በብር፣ የስራ ክፍል እና የ 40 ሰዓት ወርሃዊ ትርፍ ሰዓት ወሰን ያስተዳድሩ።',
    roster_header_badge: 'የፋብሪካው ሰራተኞች ማውጫ',
    register_staff: 'አዲስ ሰራተኛ መዝግብ',
    base_hourly_rate: 'የሰዓት ክፍያ (ብር)',
    monthly_ot_cap: 'ወርሃዊ የትርፍ ሰዓት ወሰን',
    current_month_ot: 'የዚህ ወር ትርፍ ሰዓት',
    phone_number: 'ስልክ ቁጥር',
    job_title: 'የስራ መደብ',
    shift_assignment: 'የሺፍት ምደባ',

    // Overtime Requests Component
    ot_requests_title: 'ቅድመ-የጸደቁ የትርፍ ሰዓት ጥያቄዎች',
    ot_requests_subtitle: 'የትርፍ ሰዓት ስራ ከመከናወኑ በፊት በተቆጣጣሪዎች የሚቀርቡ እና የሚጸድቁ ጥያቄዎች።',
    ot_requests_badge: 'የትርፍ ሰዓት ማጽደቂያ',
    submit_new_request: 'አዲስ የትርፍ ሰዓት ጥያቄ አስገባ',
    batch_approve_pending: 'ሁሉንም የሚጠበቁ አጽድቅ',
    estimated_hours: 'የሚገመተው ሰዓት',
    scheduled_date: 'የታቀደበት ቀን',
    reason_category: 'የምክንያት ምድብ',
    justification: 'ዝርዝር ምክንያት',
    approve_request: 'አጽድቅ',
    reject_request: 'ውድቅ አድርግ',
    rejection_modal_title: 'የትርፍ ሰዓት ጥያቄ ውድቅ ማድረጊያ',
    rejection_reason_label: 'የውድቅ የተደረገበት ምክንያት',

    // Policy Config Component
    policy_header_title: 'የትርፍ ሰዓት ብዜት እና የኩባንያው ፖሊሲ መቼቶች',
    policy_header_subtitle: 'የትርፍ ሰዓት ክፍያ ብዜቶችን፣ የወርሃዊ ሰዓታት ወሰንን እና የሌሊት ሺፍት መለኪያዎችን ያስተካክሉ።',
    policy_header_badge: 'የኢትዮጵያ ሰራተኛ ህግ ተገዢነት',
    policy_saved_success: 'የፖሊሲ መቼቶች በተካካ ሁኔታ ተቀምጠዋል! ወደፊት የሚሰሉ የትርፍ ሰዓት ክፍያዎች በነዚህ ብዜቶች ይሰላሉ።',
    ot_multiplier_tiers: 'የትርፍ ሰዓት ክፍያ ብዜት ደረጃዎች',
    hourly_surcharges_desc: 'በትርፍ ሰዓት ላይ የሚታሰቡ ተጨማሪ የክፍያ ብዜቶች',
    daytime_ot_label: 'መደበኛ የቀን ትርፍ ሰዓት (12፡00 - 4፡00)',
    nighttime_ot_label: 'የሌሊት ሺፍት ትርፍ ሰዓት (4፡00 - 12፡00)',
    rest_day_ot_label: 'የዕረፍት ቀን / የእሁድ ትርፍ ሰዓት',
    holiday_ot_label: 'የህዝብ በዓል ቀን ትርፍ ሰዓት',
    max_monthly_ot_cap: 'ከፍተኛው የወርሃዊ ትርፍ ሰዓት ወሰን (ሰዓት/ሰራተኛ)',
    daily_ot_soft_cap: 'የቀን ትርፍ ሰዓት ከፍተኛ ወሰን (ሰዓት/ሺፍት)',
    save_policy_settings: 'መቼቶችን አስቀምጥ',
    reset_to_defaults: 'ወደ ህጋዊ መነሻ አድስ',

    // Shift Scheduler Component
    scheduler_header_title: 'የክፍሎች ሺፍት እና ትርፍ ሰዓት መርሃግብር',
    scheduler_header_subtitle: 'የሳምንታዊ የሺፍት መርሃግብር፣ የሌሊት ሺፍት እና የታቀዱ የሳምንት መጨረሻ ትርፍ ሰዓታት።',
    scheduler_header_badge: 'የሳምንቱ የፋብሪካ መርሃግብር',
    active_operators: 'በስራ ላይ ያሉ ሰራተኞች',

    // Payroll Export Modal Component
    payroll_slip_title: 'ይፋዊ የአቃቂ ቃሊቲ ትርፍ ሰዓት ደመወዝ ወረቀት',
    company_full_name: 'አቃቂ ቃሊቲ ኢንዱስትሪያል ኩባንያ',
    company_address: 'አቃቂ ቃሊቲ ክፍለ ከተማ፣ አዲስ አበባ፣ የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ',
    monthly_ot_summary: 'የወርሃዊ ትርፍ ሰዓት ማጠቃለያ',
    total_workers_logged: 'የተመዘገቡ ሰራተኞች',
    total_ot_pay: 'ጠቅላላ የትርፍ ሰዓት ክፍያ (ብር)',
    dept_breakdown: 'የትርፍ ሰዓት ደመወዝ ክፍፍል በስራ ክፍል',

    // Clocking Terminal Extra Labels
    badge_scan_title: 'የፋብሪካው መግቢያ እና ትርፍ ሰዓት መመዝገቢያ',
    clock_in_success: 'በተካካ ሁኔታ ገብተዋል',
    clock_out_success: 'በተካካ ሁኔታ ወጥተዋል',
    select_active_employee: 'ከሰራተኞች ዝርዝር ይምረጡ',
    manual_badge_entry: 'የባጅ ቁጥር በእጅ ያስገቡ',
    confirm_clock_in: 'መግቢያን አረጋግጥ',
    confirm_clock_out: 'መውጫን አረጋግጥ',
    active_shift_duration: 'በስራ ላይ የቆዩበት ሰዓት',
  },
  om: {
    // General & Brand
    app_title: "AQAAQII QAALLITTII",
    app_subtitle: "WIIRTAA MESOB",
    app_tagline: "Sirna To'annoo Sa'aatii Hojii Dabalataa fi Dabaree Hojjettootaa",
    app_brand_interactive: "Sirna Sa'aatii Hojii Dabalataa Aqaaqii Qaallittii",
    app_ethiopia: "Itoophiyaa",
    ethiopia_location: "Finfinnee, Itoophiyaa",
    ethiopian_labour_law: "Akeeka Labsii Hojjetaa Naannoo No. 1156/2019",
    management_portal: "Poortaal Bulchiinsaa",

    // Admin Welcome & Interactive System Modal
    admin_welcome_title: "Baga Nagaan Dhuftan, Bulchaa Ol'aanaa!",
    admin_welcome_subtitle: "Eeyyamni Bulchaa Ol'aanaa sirna Aqaaqii Qaallittiif kennameera. Mirgootni to'annoo fi seera haaraa hojiirra ooluun eegalaman.",
    admin_quick_pending: "Gaaffiiyyii Eegalan Sakatta'i",
    admin_quick_roster: "Tarree Hojjettootaa Ilaali",
    admin_quick_policy: "Istaandardii Kaffaltii",
    dismiss_notice: "Cufi",
    system_info_title: "Odeeffannoo Sirna Aqaaqii Qaallittii",
    system_status_operational: "100% Hojii Diraa",
    system_location_val: "Industrii Kaffaltii Aqaaqii Qaallittii, Finfinnee",
    system_compliance_val: "Labsii Hojjetaa Naannoo No. 1156/2019 Waliin Kan Deemu",
    system_active_lines: "Kutaa Oomishaa Hojjataa Jiran: 6",

    // Sidebar Navigation
    nav_dashboard: "Dyaasboordii Faabrikaa",
    nav_clocking: "Tarminaala Baajjii",
    nav_requests: "Eeyyama Hojii Dabalataa",
    nav_attendance: "Galmee Guddaa",
    nav_roster: "Tarree Hojjettootaa",
    nav_scheduler: "Sagantaa Dabaree",
    nav_policy: "Istaandardii Kaffaltii",

    // Sidebar Actions
    badge_clock_terminal: "Galmee Sa'aatii Baajjii",
    clock_terminal: "Tarminaala Sa'aatii",
    day_mode: "Haala Guyyaa",
    night_mode: "Haala Halkan",
    light_theme: "Ifaa",
    dark_theme: "Dukkana",
    reset_demo: "Odeeffannoo Yaalii Haaramsi",
    sign_out: "Ba'i (Sign Out)",
    select_language: "Afaan (Language)",
    account_info: "Odeeffannoo Akkaawuntii",
    account_profile: "Puraofaayilii Hojjetaa",
    verified_account: "Akkaawuntii Mirkanaa'e",
    filter_navigation: "Barbaadi...",
    live_plant_clock: "Sa'aatii Faabrikaa",
    active_operator_session: "Barsiisa Hojii",
    plant_supervisor: "To'ataa Faabrikaa",
    sys_admin: "Bulchaa Ol'aanaa (Admin)",
    admin_badge: "Mirga Bulchaa",
    admin_role: "Bulchaa Hojii Faabrikaa",

    // Auth Page
    sign_in: "Seeni (Sign In)",
    sign_up: "Galmaa'i (Sign Up)",
    sign_in_title: "Dyaasboordii Seenuuf Galmaa'i",
    sign_up_title: "Sirna Seenuuf Akkaawuntii Uumi",
    sign_up_subtitle: "Hojii Dabalataa Bulchuuf Akkaawuntii Uumi",
    sign_in_subtitle: "Imeelii fi Jecha Darbiikessaa Seensiisi",
    full_name: "Maqaa Guutuu",
    email_address: "Teessoo Imeelii",
    password: "Jecha Darbiikessaa",
    sign_in_button: "Gara Poortaalitti Seeni",
    sign_up_button: "Akkaawuntii Uumi fi Mirkaneessi",
    resend_verification: "Imeelii Mirkaneessaa Irra Deebii Ergi",
    email_verification_required: "Mirkaneessa Imeelii Barbaachisa",
    verification_sent_to: "Imeeliin mirkaneessaa gara teessoo kanatti ergameera:",
    please_verify: "Moo'achuu keessan mirkaneessitanii seenaa.",
    auth_footer: "WIIRTAA MESOB AQAAQII QAALLITTII • Akka Seera Hojjetaatti Kan Qophaa'e",

    // Dashboard
    dash_subcity_plant: "Industrii Faabrikaa Aqaaqii Qaallittii",
    dash_monitor_title: "To'ataa Sa'aatii Dabalataa fi Dabaree Hojii",
    dash_monitor_desc: "Wiirtuu galmee sa'aatii, dachaa kaffaltii seera hojjetaa Itoophiyaa (1.25x - 2.50x), sirna eeyyama to'atotaa fi galmee mindaa qoratu.",
    dash_gen_ot_slip: "Ragaa Kaffaltii Dabalataa Baasi",
    kpi_active_clock_ins: "Hojjettoota Hojii Irra Jiran",
    kpi_monthly_ot_hours: "Sa'aatii Dabalataa Ji'aa",
    kpi_ot_cost_estimate: "Tilmaama Kaffaltii Dabalataa",
    kpi_pending_ot_requests: "Gaaffiiwwan Eeggannoo Irra Jiran",
    in_overtime: "Hojii Dabalataa Irra",
    total_employees: "Ida'ama Hojjettootaa",
    logged_across_shifts: "Dabaree faabrikaa irratti kan galmeeffame",
    ethiopian_birr_accrued: "Birrii Itoophiyaa Kuufame",
    over_limit: "Daangaa Oli",
    review_requests: "Gaaffiiwwan Gamaggami",
    ot_distribution_by_dept: "Qoodinsa Hojii Dabalataa Kutaan",
    cumulative_hours: "Ida'ama sa'aatii kutaa faabrikaa",
    ot_category_multipliers: "Gulantaa Dachaa Kaffaltii",
    labour_law_rate_tiers: "Sadarkaa kaffaltii seera hojjetaa Itoophiyaa",
    daily_ot_trend: "Sosso'insa Hojii Dabalataa Guyyaa",
    total_ot_hours_per_day: "Ida'ama sa'aatii dabalataa guyyaatti galmeeffame",
    recent_attendance_log: "Galmee Hirmaannaa fi Hojii Dabalataa Dhiyoo",
    live_clock_in_statuses: "Haala seensaa ifaa fi hojii dabalataa xumurame",
    view_master_log: "Galmee Guutuu Ilaali",

    // Table Headers
    col_employee: "Hojjetaa",
    col_badge_id: "Lakk. Baajjii",
    col_department: "Kutaa Hojii",
    col_date: "Guyyaa",
    col_time_in_out: "Sa'aatii (Seensa - Ba'insa)",
    col_ot_hours: "Sa'aatii Dabalataa",
    col_rate_mult: "Dachaa Kaffaltii",
    col_est_pay: "Kaffaltii Tilmaamaa (ETB)",
    col_status: "Haala",

    // Status Badges
    status_active_ot: "Hojii Dabalataa Irra",
    status_completed: "Xumurameera",
    status_pending: "Eeggannoo Irra",
    status_approved: "Mirkanaa'eera",
    status_rejected: "Kuffifameera",

    // Clocking Terminal Component
    clock_in: "Seeni (Clock In)",
    clock_out: "Ba'i (Clock Out)",
    badge_number_placeholder: "Lakk. Baajjii Seensiisi (fakkeenya: AKM-101)",
    scan_or_type_badge: "Lakk. baajjii hojjetaa dubbisi ykn barreessi",
    select_employee: "Hojjetaa Filadhu",
    enter_badge_id: "Lakk. Baajjii Seensiisi",
    active_now: "Amma Hojii Irra",

    // Roster & Requests
    add_new_employee: "Hojjetaa Haaraa Galmeessi",
    request_overtime: "Hojii Dabalataa Gaafadhu",
    export_payroll: "Odeeffannoo Mindaa Buusi (CSV/Excel)",
    shift_schedule: "Sagantaa Dabaree",
    policy_settings: "Qajeelfama Hojii Dabalataa",

    // Multipliers
    rate_day_ot: "Hojii Dabalataa Guyyaa (12:00-4:00)",
    rate_night_ot: "Hojii Dabalataa Halkan (4:00-12:00)",
    rate_weekend: "Guyyaa Boqonnaa Torbee",
    rate_holiday: "Guyyaa Ayyaana Ummataa",

    // Common UI & Actions
    search_placeholder: "Maqaan, baajjiidhaan ykn bal'inaan barbaadi...",
    all_departments: "Kutaalee Hundumaa",
    all_statuses: "Haalota Hundumaa",
    filter_by_dept: "Kutaan Barbaadi",
    filter_by_status: "Haalaan Barbaadi",
    actions: "Tarkaanfiiwwan",
    edit: "Gulaali",
    delete: "Haqi",
    cancel: "Dhiisi",
    save: "Olkaa'i",
    confirm: "Mirkaneessi",
    close: "Cufi",
    print: "Waraqaa Maxxansi / PDF Olkaa'i",
    export_csv: "CSV n Buusi",
    notes: "Yaadannoo / Sababa",
    supervisor: "To'ataa",
    manager: "Menejera",
    date: "Guyyaa",
    shift: "Dabaree",

    // Attendance Logs Component
    att_header_title: "Galmee Guddaa Hirmaannaa fi Hojii Dabalataa",
    att_header_subtitle: "Galmee seensa fi ba'insa dabaree, dachaa kaffaltii sa'aatii dabalataa fi mirkaneessa to'attootaa.",
    add_manual_log: "Harkaani Galmeessi",
    start_date: "Guyyaa Jalqabaa",
    end_date: "Guyyaa Dhumaa",
    regular_hours: "Sa'aatii Madaallii",
    rate_tier: "Sadarkaa Kaffaltii",
    add_record_modal_title: "Galmee Dabaree fi Hojii Dabalataa Harkaani Galmeessi",
    edit_record_modal_title: "Galmee Hirmaannaa Gulaali",

    // Employee Roster Component
    roster_header_title: "Tarree Hojjettootaa fi Daangaa Hojii Dabalataa Ji'aa",
    roster_header_subtitle: "Kaffaltii kutaalee, ramaddii dabaree fi daangaa hojii dabalataa sa'aatii 40 ji'aa bulchi.",
    roster_header_badge: "Kutaalee Hojjettoota Faabrikaa",
    register_staff: "Hojjetaa Haaraa Galmeessi",
    base_hourly_rate: "Kaffaltii Sa'aatii (ETB)",
    monthly_ot_cap: "Daangaa Hojii Dabalataa Ji'aa",
    current_month_ot: "Hojii Dabalataa Ji'a Kanaa",
    phone_number: "Lakk. Bilbilaa",
    job_title: "Gitahojii",
    shift_assignment: "Ramaddii Dabaree",

    // Overtime Requests Component
    ot_requests_title: "Gaaffiiwwan Hojii Dabalataa Dursee Mirkanaa'an",
    ot_requests_subtitle: "Dabaree hojiitiin dura gaaffiiwwan hojii dabalataa to'attootaan dhiyaatanii fi mirkanaa'an.",
    ot_requests_badge: "Mirkaneessa Hojii Dabalataa",
    submit_new_request: "Gaaffii Hojii Dabalataa Haaraa Dhiyeessi",
    batch_approve_pending: "Hundumaa Eeggannoo Irra Jiran Mirkaneessi",
    estimated_hours: "Sa'aatii Tilmaamame",
    scheduled_date: "Guyyaa Sagantaame",
    reason_category: "Gosa Sababaa",
    justification: "Sababa Bal'inaa",
    approve_request: "Mirkaneessi",
    reject_request: "Kuffisi",
    rejection_modal_title: "Gaaffii Hojii Dabalataa Kuffisuu",
    rejection_reason_label: "Sababa Kuffifameef",

    // Policy Config Component
    policy_header_title: 'Dachaa Hojii Dabalataa fi Qajeelfama Dhaabbataa',
    policy_header_subtitle: "Dachaa kaffaltii hojii dabalataa, daangaa sa'aatii ji'aa fi daangaa halkan qindeessi.",
    policy_header_badge: "Mirkaneessa Seera Hojjetaa Itoophiyaa",
    policy_saved_success: "Qajeelfamni Milkaa'inaan Olka'ameera! Kaffaltiin hojii dabalataa fuulduraa kanaani madaalama.",
    ot_multiplier_tiers: "Gulantaa Dachaa Kaffaltii Hojii Dabalataa",
    hourly_surcharges_desc: "Kaffaltii dabalataa sa'aatii hojii dabalataa irratti dabalamu",
    daytime_ot_label: "Hojii Dabalataa Guyyaa Standard (06:00 - 22:00)",
    nighttime_ot_label: "Hojii Dabalataa Halkan (22:00 - 06:00)",
    rest_day_ot_label: "Hojii Dabalataa Guyyaa Boqonnaa / Dilbata",
    holiday_ot_label: "Hojii Dabalataa Guyyaa Ayyaanaa",
    max_monthly_ot_cap: "Daangaa Ol-aanaa Hojii Dabalataa Ji'aa (Sa'aatii/Hojjetaa)",
    daily_ot_soft_cap: "Daangaa Guyyaa Hojii Dabalataa (Sa'aatii/Dabaree)",
    save_policy_settings: "Qajeelfama Olkaa'i",
    reset_to_defaults: "Gara Seera Jalqabaatti Deebisi",

    // Shift Scheduler Component
    scheduler_header_title: "Sagantaa Dabaree Kutaalee fi Hojii Dabalataa",
    scheduler_header_subtitle: "Sagantaa dabaree torbee, dabaree halkan fi hojii dabalataa dhuma torbee.",
    scheduler_header_badge: "Sagantaa Faabrikaa Torbee",
    active_operators: "Hojjettoota Hojii Irra Jiran",

    // Payroll Export Modal Component
    payroll_slip_title: "Waraqaa Mindaa Hojii Dabalataa Akaki Kality Official",
    company_full_name: "DHAABBATA INDAUSTRII AKAKI KALITY",
    company_address: "Kutaa Magaalaa Akaki Kality, Finfinnee, Jamhooriyaa Dimokrataawaa Federaalawaa Itoophiyaa",
    monthly_ot_summary: "GUDUNFAA HOJII DABALATAA JI'AA",
    total_workers_logged: "Ida'ama Hojjettoota Galmeeffaman",
    total_ot_pay: "Ida'ama Kaffaltii Hojii Dabalataa (ETB)",
    dept_breakdown: "Qoodinsa Kaffaltii Hojii Dabalataa Kutaaleen",

    // Clocking Terminal Extra Labels
    badge_scan_title: "Tarminaala Galmee Sa'aatii fi Hojii Dabalataa Faabrikaa",
    clock_in_success: "Milkaa'inaan Seentaniittu",
    clock_out_success: "Milkaa'inaan Baataniittu",
    select_active_employee: "Hojjetaa Tarree Irraa Filadhu",
    manual_badge_entry: "Lakk. Baajjii Harkaani Seensiisi",
    confirm_clock_in: "Seensa Mirkaneessi",
    confirm_clock_out: "Ba'insa Mirkaneessi",
    active_shift_duration: "Turtii Sa'aatii Hojii Irraa",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && (saved === 'en' || saved === 'am' || saved === 'om')) {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations['en'][key]) {
      return translations['en'][key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
