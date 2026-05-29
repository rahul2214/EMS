'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Clock, X, LayoutDashboard, Calendar, BarChart3, User, LogOut, Menu, CalendarDays, Check, AlertTriangle, Info
} from 'lucide-react';
import { useChronos } from '../../context/ChronosContext';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    currentUser,
    loading,
    sidebarOpen,
    setSidebarOpen,
    toasts,
    clockState,
    getInitials,
    handleSignOut
  } = useChronos();

  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.replace('/');
      } else if (currentUser.is_admin) {
        router.replace('/admin/dashboard');
      }
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex-center flex-col" style={{ minHeight: '100vh', gap: '16px' }}>
        <Clock className="logo-icon animate-spin text-indigo" style={{ width: '48px', height: '48px' }} />
        <h4 className="text-muted">Loading Workspace Layout...</h4>
      </div>
    );
  }

  if (!currentUser || currentUser.is_admin) {
    return null;
  }

  const getPageTitle = () => {
    if (pathname.includes('/employee/dashboard')) return 'Dashboard Overview';
    if (pathname.includes('/employee/timesheets')) return 'Timesheet Log & Submissions';
    if (pathname.includes('/employee/analytics')) return 'Time Analytics';
    if (pathname.includes('/employee/profile')) return 'Employee Personal Profile';
    return 'Employee Portal';
  };

  return (
    <div id="app-container">
      {/* Toast Notifications */}
      <div id="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-icon">
              {t.type === 'success' && <Check style={{ width: '16px', height: '16px' }} />}
              {t.type === 'error' && <AlertTriangle style={{ width: '16px', height: '16px' }} />}
              {t.type === 'info' && <Info style={{ width: '16px', height: '16px' }} />}
            </div>
            <p>{t.message}</p>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-wrapper">
          
            <span className="logo-text">Veltria</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="mobile-only-btn"><X /></button>
        </div>

        <nav className="sidebar-nav">
          <Link
            href="/employee/dashboard"
            className={`nav-item ${pathname === '/employee/dashboard' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard /> <span>Dashboard</span>
          </Link>
          <Link
            href="/employee/timesheets"
            className={`nav-item ${pathname === '/employee/timesheets' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Calendar /> <span>Log Hours</span>
          </Link>
          <Link
            href="/employee/analytics"
            className={`nav-item ${pathname === '/employee/analytics' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart3 /> <span>Analytics</span>
          </Link>
          <Link
            href="/employee/profile"
            className={`nav-item ${pathname === '/employee/profile' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <User /> <span>Profile</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">{getInitials(currentUser.name)}</div>
          <div className="user-details">
            <h4>{currentUser.name}</h4>
            <span>{currentUser.role} | {currentUser.department}</span>
          </div>
          <button id="logout-btn" onClick={handleSignOut} title="Sign Out">
            <LogOut style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="app-body">
        <header className="app-header">
          <div className="header-left">
            <button onClick={() => setSidebarOpen(true)} className="mobile-only-btn"><Menu /></button>
            <h2 className="view-title">{getPageTitle()}</h2>
          </div>
          <div className="header-right">
            {clockState?.is_clocked_in ? (
              <div className="pulse-indicator-live">
                <span className="live-dot pulse" /> Checked In
              </div>
            ) : (
              <div className="pulse-indicator-offline" style={{
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(148, 163, 184, 0.1)',
                color: 'var(--text-muted)',
                padding: '6px 14px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '20px',
                fontWeight: 600
              }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }} /> Checked Out
              </div>
            )}
          </div>
        </header>

        <main className="view-content">
          {children}
        </main>
      </div>
    </div>
  );
}
