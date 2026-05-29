'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '../lib/supabase';

// Type declarations matching schema
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  is_admin: boolean;
  created_at: string;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  date: string;
  project: string;
  start_time: string;
  end_time: string;
  hours: number;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  processed_date?: string | null;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ActivityRow {
  id: string;
  activityName: string;
  activityType: string;
  hours: string[];
  comment: string;
}

interface ChronosContextType {
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  timesheets: Timesheet[];
  setTimesheets: React.Dispatch<React.SetStateAction<Timesheet[]>>;
  employees: UserProfile[];
  setEmployees: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  clockState: any;
  setClockState: React.Dispatch<React.SetStateAction<any>>;
  allClockStates: Record<string, any>;
  setAllClockStates: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  
  // Auth states (only for login page inputs)
  authRole: 'employee' | 'admin';
  setAuthRole: React.Dispatch<React.SetStateAction<'employee' | 'admin'>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;

  // Timesheet Entry Form states
  tsWeek: string;
  setTsWeek: React.Dispatch<React.SetStateAction<string>>;
  tsMasterCode: string;
  setTsMasterCode: React.Dispatch<React.SetStateAction<string>>;
  tsManager: string;
  setTsManager: React.Dispatch<React.SetStateAction<string>>;
  tsRole: string;
  setTsRole: React.Dispatch<React.SetStateAction<string>>;
  tsStatus: string;
  activityRows: ActivityRow[];
  setActivityRows: React.Dispatch<React.SetStateAction<ActivityRow[]>>;
  PROJECT_DETAILS_MAP: Record<string, { description: string }>;

  // Employee Add Modal Inputs
  isAddModalOpen: boolean;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newEmpName: string;
  setNewEmpName: React.Dispatch<React.SetStateAction<string>>;
  newEmpEmail: string;
  setNewEmpEmail: React.Dispatch<React.SetStateAction<string>>;
  newEmpRole: string;
  setNewEmpRole: React.Dispatch<React.SetStateAction<string>>;
  newEmpDept: string;
  setNewEmpDept: React.Dispatch<React.SetStateAction<string>>;
  newEmpPassword: string;
  setNewEmpPassword: React.Dispatch<React.SetStateAction<string>>;
  newEmpConfirmPassword: string;
  setNewEmpConfirmPassword: React.Dispatch<React.SetStateAction<string>>;

  // Shared Helper states
  toasts: ToastMessage[];
  currentTime: string;
  currentDate: string;
  elapsedTime: string;

  // Actions
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshData: () => Promise<void>;
  getInitials: (nameStr: string) => string;
  formatDateDisplay: (dateStr: string) => string;
  getWeekDays: () => string[];
  handleClockToggle: (location?: string) => Promise<void>;
  addActivityRow: () => void;
  removeActivityRow: (rowId: string) => void;
  updateActivityRowField: (rowId: string, field: string, val: any) => void;
  handleLoadActivities: () => void;
  handleResetTimesheet: () => void;
  handleSaveTimesheetDraft: () => void;
  handleSubmitTimesheet: () => Promise<void>;
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleProcessApproval: (tsId: string, status: 'approved' | 'rejected') => Promise<void>;
  handleCreateEmployee: (e: React.FormEvent) => Promise<void>;
  handleDeleteEmployee: (empId: string) => Promise<void>;
}

const ChronosContext = createContext<ChronosContextType | undefined>(undefined);

export function ChronosProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Root states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [clockState, setClockState] = useState<any>(null);
  const [allClockStates, setAllClockStates] = useState<Record<string, any>>({});

  // Auth Inputs
  const [authRole, setAuthRole] = useState<'employee' | 'admin'>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Timesheet Redesign States
  const getMondayOfCurrentWeek = () => {
    const current = new Date();
    const day = current.getDay();
    const distance = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + distance);
    return monday.toISOString().split('T')[0];
  };

  const [tsWeek, setTsWeek] = useState(getMondayOfCurrentWeek());
  const [tsMasterCode, setTsMasterCode] = useState('');
  const [tsManager, setTsManager] = useState('');
  const [tsRole, setTsRole] = useState('');
  const tsStatus = 'Due for submission';

  const [activityRows, setActivityRows] = useState<ActivityRow[]>([
    { id: 'row-1', activityName: 'Tech Enablement', activityType: 'Tech Enablement', hours: ['', '', '', '', '', '', ''], comment: '' }
  ]);

  const PROJECT_DETAILS_MAP: Record<string, { description: string }> = {
    'ABM006': { description: 'Opcenter MES Solution' },
    'DEV001': { description: 'Veltria Platform Core Development' },
    'MKT003': { description: 'Growth Campaign & SEO Audit' },
    'SYS004': { description: 'Cloud Maintenance & SSL Renewals' }
  };

  // Employee Add Modal Inputs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [newEmpConfirmPassword, setNewEmpConfirmPassword] = useState('');

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ticking Headers Clock
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Live Timer for Clock widget
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const clockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger Toast helper
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Synchronize Data
  const refreshData = async () => {
    if (!currentUser) return;
    try {
      if (currentUser.is_admin) {
        const allTs = await db.getTimesheets();
        const allEmp = await db.getEmployees();
        setTimesheets(allTs);
        setEmployees(allEmp);

        if (typeof window !== 'undefined') {
          const states = JSON.parse(localStorage.getItem('ems_mock_clock_states') || '{}');
          setAllClockStates(states);
        }
      } else {
        const userTs = await db.getTimesheets(currentUser.id);
        const stateObj = await db.getClockState(currentUser.id);
        setTimesheets(userTs);
        setClockState(stateObj);
      }
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Helper actions
  const getInitials = (nameStr: string) => {
    if (!nameStr) return '??';
    const parts = nameStr.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getWeekDays = () => {
    const current = new Date();
    const day = current.getDay();
    const distance = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + distance);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      const yyyy = next.getFullYear();
      const mm = String(next.getMonth() + 1).padStart(2, '0');
      const dd = String(next.getDate()).padStart(2, '0');
      week.push(`${yyyy}-${mm}-${dd}`);
    }
    return week;
  };

  // Clock Widget synchronizer & ticker
  const syncClockWidget = async () => {
    if (!currentUser) return;
    const stateObj = await db.getClockState(currentUser.id);
    setClockState(stateObj);

    if (stateObj && stateObj.is_clocked_in) {
      startLiveClockTimer(stateObj.start_time);
    } else {
      stopLiveClockTimer();
    }
  };

  const startLiveClockTimer = (startTimeIso: string) => {
    if (clockTimerRef.current) clearInterval(clockTimerRef.current);
    const startTimeMs = new Date(startTimeIso).getTime();
    
    const update = () => {
      const diffMs = Date.now() - startTimeMs;
      const totalSecs = Math.floor(diffMs / 1000);
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      setElapsedTime(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    update();
    clockTimerRef.current = setInterval(update, 1000);
  };

  const stopLiveClockTimer = () => {
    if (clockTimerRef.current) {
      clearInterval(clockTimerRef.current);
      clockTimerRef.current = null;
    }
    setElapsedTime('00:00:00');
  };

  // Synchronous effects
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    }, 1000);

    const loadSession = async () => {
      try {
        const user = await db.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          // Auto route to page
          if (pathname === '/') {
            router.replace(user.is_admin ? '/admin/dashboard' : '/employee/dashboard');
          }
        } else {
          // Redirect to login if on protected page
          if (pathname.startsWith('/employee') || pathname.startsWith('/admin')) {
            router.replace('/');
          }
        }
      } catch (err) {
        console.error("Session load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();

    return () => {
      clearInterval(clockInterval);
      stopLiveClockTimer();
    };
  }, []);

  // Fetch data on session status
  useEffect(() => {
    if (!currentUser) return;
    refreshData();
  }, [currentUser, pathname]);

  // Clock widget sync
  useEffect(() => {
    if (!currentUser || currentUser.is_admin) return;
    syncClockWidget();
    return () => stopLiveClockTimer();
  }, [currentUser, clockState?.is_clocked_in]);

  // Load draft sheet
  useEffect(() => {
    if (!currentUser || !pathname.includes('/employee/timesheets')) return;
    const saved = localStorage.getItem(`ems_draft_${currentUser.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tsWeek) setTsWeek(parsed.tsWeek);
        if (parsed.tsMasterCode) setTsMasterCode(parsed.tsMasterCode);
        if (parsed.tsManager) setTsManager(parsed.tsManager);
        if (parsed.tsRole) setTsRole(parsed.tsRole);
        if (parsed.activityRows) setActivityRows(parsed.activityRows);
        triggerToast("Loaded saved timesheet draft", "info");
      } catch (e) {
        console.error("Draft load error:", e);
      }
    }
  }, [pathname, currentUser]);

  // Action methods
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast("Please fill all authentication inputs", "error");
      return;
    }

    try {
      const profile = await db.signIn(email, password);
      setCurrentUser(profile);
      triggerToast(`Welcome back, ${profile.name}`, "success");
      
      // Clean forms
      setEmail('');
      setPassword('');

      // Redirect
      router.push(profile.is_admin ? '/admin/dashboard' : '/employee/dashboard');
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleSignOut = async () => {
    await db.signOut();
    setCurrentUser(null);
    stopLiveClockTimer();
    triggerToast("Logged out successfully", "info");
    router.replace('/');
  };

  const handleClockToggle = async (location?: string) => {
    if (!currentUser) return;
    const isClocked = clockState && clockState.is_clocked_in;

    try {
      if (!isClocked) {
        const nowStr = new Date().toISOString();
        await db.setClockState(currentUser.id, true, nowStr, location || "Bangalore Metro Building");
        await syncClockWidget();
        triggerToast("Duty clock-in logged. Timer active.", "success");
      } else {
        const startMs = new Date(clockState.start_time).getTime();
        const durationHours = Math.min(24, Number(((Date.now() - startMs) / 3600000).toFixed(2)));

        if (durationHours < 0.01) {
          triggerToast("Shift canceled. Session logged was too short (< 30s).", "info");
          await db.setClockState(currentUser.id, false, null, "Bangalore Metro Building");
          await syncClockWidget();
          return;
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        const newTs = {
          employee_id: currentUser.id,
          date: dateStr,
          project: clockState.project || "Bangalore Metro Building",
          start_time: new Date(clockState.start_time).toISOString(),
          end_time: now.toISOString(),
          hours: durationHours,
          description: "Shift logged via Live Clock Tracker widget.",
          status: "approved" as const,
          processed_date: dateStr
        };

        await db.createTimesheet(newTs);
        await db.setClockState(currentUser.id, false, null, "Bangalore Metro Building");
        
        await syncClockWidget();
        await refreshData();
        triggerToast(`Clocked out. Logged ${durationHours} hours.`, "success");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const getWeekDatesList = (startMondayStr: string) => {
    if (!startMondayStr) return [];
    const [year, month, day] = startMondayStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(date);
      next.setDate(date.getDate() + i);
      const yyyy = next.getFullYear();
      const mm = String(next.getMonth() + 1).padStart(2, '0');
      const dd = String(next.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return dates;
  };

  const addActivityRow = () => {
    const newId = `row-${Date.now()}`;
    setActivityRows(prev => [...prev, {
      id: newId,
      activityName: 'Tech Enablement',
      activityType: 'Tech Enablement',
      hours: ['', '', '', '', '', '', ''],
      comment: ''
    }]);
  };

  const removeActivityRow = (rowId: string) => {
    setActivityRows(prev => prev.filter(r => r.id !== rowId));
  };

  const updateActivityRowField = (rowId: string, field: string, val: any) => {
    setActivityRows(prev => prev.map(r => {
      if (r.id === rowId) {
        if (field === 'hours') {
          return { ...r, hours: val };
        } else if (field === 'activityName') {
          return { ...r, activityName: val, activityType: val };
        } else if (field === 'comment') {
          return { ...r, comment: val };
        }
      }
      return r;
    }));
  };

  const handleLoadActivities = () => {
    setActivityRows([
      { id: `row-load-1`, activityName: 'Feature Development', activityType: 'Feature Development', hours: ['8', '8', '8', '8', '8', '', ''], comment: 'Sprint tasks development' }
    ]);
    triggerToast("Loaded baseline activity draft", "success");
  };

  const handleResetTimesheet = () => {
    setTsMasterCode('');
    setTsManager('');
    setTsRole('');
    setActivityRows([
      { id: 'row-1', activityName: 'Tech Enablement', activityType: 'Tech Enablement', hours: ['', '', '', '', '', '', ''], comment: '' }
    ]);
    triggerToast("Timesheet form reset", "info");
  };

  const handleSaveTimesheetDraft = () => {
    if (typeof window !== 'undefined' && currentUser) {
      const draft = {
        tsWeek, tsMasterCode, tsManager, tsRole, activityRows
      };
      localStorage.setItem(`ems_draft_${currentUser.id}`, JSON.stringify(draft));
      triggerToast("Timesheet draft saved locally", "success");
    }
  };

  const handleSubmitTimesheet = async () => {
    if (!currentUser) return;
    if (!tsMasterCode || !tsManager || !tsRole) {
      triggerToast("Please fill all required fields (Project Code, Manager, Role)", "error");
      return;
    }

    let totalLogged = 0;
    activityRows.forEach(row => {
      row.hours.forEach(h => {
        if (h && !isNaN(Number(h))) {
          totalLogged += Number(h);
        }
      });
    });

    if (totalLogged === 0) {
      triggerToast("Please log at least one hour before submitting", "error");
      return;
    }

    // Validate daily totals and individual cells
    const dailyTotals = [0, 0, 0, 0, 0, 0, 0];
    for (const row of activityRows) {
      for (let i = 0; i < 7; i++) {
        const hrVal = row.hours[i];
        if (hrVal && !isNaN(Number(hrVal))) {
          const hrs = Number(hrVal);
          if (hrs > 24) {
            triggerToast("Logged activity time for any single day cannot exceed 24 hours", "error");
            return;
          }
          if (hrs < 0) {
            triggerToast("Logged hours cannot be negative", "error");
            return;
          }
          dailyTotals[i] += hrs;
        }
      }
    }

    for (let i = 0; i < 7; i++) {
      if (dailyTotals[i] > 24) {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        triggerToast(`Total logged hours on ${days[i]} cannot exceed 24 hours`, "error");
        return;
      }
    }

    try {
      const dates = getWeekDatesList(tsWeek);
      
      for (const row of activityRows) {
        for (let i = 0; i < 7; i++) {
          const hrVal = row.hours[i];
          if (hrVal && !isNaN(Number(hrVal)) && Number(hrVal) > 0) {
            const hrs = Number(hrVal);
            const startH = 9;
            const endH = startH + hrs;
            const startTimeStr = `09:00`;
            const endTimeStr = `${String(Math.floor(endH)).padStart(2, '0')}:${String(Math.round((endH % 1) * 60)).padStart(2, '0')}`;
            
            await db.createTimesheet({
              employee_id: currentUser.id,
              date: dates[i],
              project: `${tsMasterCode} - ${row.activityName}`,
              start_time: startTimeStr,
              end_time: endTimeStr,
              hours: hrs,
              description: row.comment || `Logged via weekly weekly submission sheet (Role: ${tsRole}, Manager: ${tsManager})`,
              status: 'pending'
            });
          }
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem(`ems_draft_${currentUser.id}`);
      }
      triggerToast("Timesheet submitted successfully!", "success");
      handleResetTimesheet();
      await refreshData();
      router.push('/employee/dashboard');
    } catch (e: any) {
      triggerToast(e.message, "error");
    }
  };

  const handleProcessApproval = async (tsId: string, status: 'approved' | 'rejected') => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await db.updateTimesheetStatus(tsId, status, todayStr);
      triggerToast(`Timesheet successfully ${status}`, status === 'approved' ? 'success' : 'error');
      refreshData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpRole || !newEmpDept || !newEmpPassword || !newEmpConfirmPassword) {
      triggerToast("Please complete all employee fields", "error");
      return;
    }

    if (newEmpPassword !== newEmpConfirmPassword) {
      triggerToast("Passwords do not match", "error");
      return;
    }

    try {
      await db.createEmployee({
        name: newEmpName,
        email: newEmpEmail.toLowerCase(),
        role: newEmpRole,
        department: newEmpDept,
        password: newEmpPassword
      });
      triggerToast(`Employee account created for ${newEmpName}`, 'success');
      
      setNewEmpName('');
      setNewEmpEmail('');
      setNewEmpRole('');
      setNewEmpDept('');
      setNewEmpPassword('');
      setNewEmpConfirmPassword('');
      setIsAddModalOpen(false);
      refreshData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleDeleteEmployee = async (empId: string) => {
    if (confirm("Are you sure you want to delete this employee? This will permanently wipe their history logs.")) {
      try {
        await db.deleteEmployee(empId);
        triggerToast("Employee account deactivated successfully", "success");
        refreshData();
      } catch (err: any) {
        triggerToast(err.message, 'error');
      }
    }
  };

  return (
    <ChronosContext.Provider value={{
      currentUser, setCurrentUser,
      loading, setLoading,
      sidebarOpen, setSidebarOpen,
      timesheets, setTimesheets,
      employees, setEmployees,
      clockState, setClockState,
      allClockStates, setAllClockStates,
      
      authRole, setAuthRole,
      email, setEmail,
      password, setPassword,
      showPassword, setShowPassword,

      tsWeek, setTsWeek,
      tsMasterCode, setTsMasterCode,
      tsManager, setTsManager,
      tsRole, setTsRole,
      tsStatus,
      activityRows, setActivityRows,
      PROJECT_DETAILS_MAP,

      isAddModalOpen, setIsAddModalOpen,
      newEmpName, setNewEmpName,
      newEmpEmail, setNewEmpEmail,
      newEmpRole, setNewEmpRole,
      newEmpDept, setNewEmpDept,
      newEmpPassword, setNewEmpPassword,
      newEmpConfirmPassword, setNewEmpConfirmPassword,

      toasts,
      currentTime,
      currentDate,
      elapsedTime,

      triggerToast,
      refreshData,
      getInitials,
      formatDateDisplay,
      getWeekDays,
      handleClockToggle,
      addActivityRow,
      removeActivityRow,
      updateActivityRowField,
      handleLoadActivities,
      handleResetTimesheet,
      handleSaveTimesheetDraft,
      handleSubmitTimesheet,
      handleSignIn,
      handleSignOut,
      handleProcessApproval,
      handleCreateEmployee,
      handleDeleteEmployee
    }}>
      {children}
    </ChronosContext.Provider>
  );
}

export function useChronos() {
  const context = useContext(ChronosContext);
  if (context === undefined) {
    throw new Error('useChronos must be used within a ChronosProvider');
  }
  return context;
}
