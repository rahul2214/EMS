'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Clock, X, LayoutDashboard, CheckSquare, Users, PieChart, LogOut, Menu, CalendarDays, Check, AlertTriangle, Info
} from 'lucide-react';
import { useChronos } from '../../context/ChronosContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    loading,
    sidebarOpen,
    setSidebarOpen,
    timesheets,
    toasts,
    allClockStates,
    getInitials,
    handleSignOut
  } = useChronos();

  const adminClockedInCount = Object.values(allClockStates || {}).filter((s: any) => s.is_clocked_in).length;

  React.useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.replace('/');
      } else if (!currentUser.is_admin) {
        router.replace('/employee/dashboard');
      }
    }
  }, [currentUser, loading, router]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setSidebarOpen(true);
    }
  }, [setSidebarOpen]);

  if (loading) {
    return (
      <div className="flex-center flex-col" style={{ minHeight: '100vh', gap: '16px' }}>
        <Clock className="logo-icon animate-spin text-indigo" style={{ width: '48px', height: '48px' }} />
        <h4 className="text-muted">Loading Administrator Console...</h4>
      </div>
    );
  }

  if (!currentUser || !currentUser.is_admin) {
    return null;
  }

  const getPageTitle = () => {
    if (pathname.includes('/admin/dashboard')) return 'Administrator Console';
    if (pathname.includes('/admin/approvals')) return 'Timesheet Approvals Queue';
    if (pathname.includes('/admin/employees')) return 'Staff Employee Directory';
    if (pathname.includes('/admin/analytics')) return 'Organizational Performance Reports';
    return 'Administrator Console';
  };

  const adminPendingList = timesheets.filter(t => t.status === 'pending');

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
            href="/admin/dashboard"
            className={`nav-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard /> <span>Overview</span>
          </Link>
          <Link
            href="/admin/approvals"
            className={`nav-item ${pathname === '/admin/approvals' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <CheckSquare /> <span>Approvals</span>
            {adminPendingList.length > 0 && (
              <span className="badge badge-pending">{adminPendingList.length}</span>
            )}
          </Link>
          <Link
            href="/admin/employees"
            className={`nav-item ${pathname === '/admin/employees' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users /> <span>Employees</span>
          </Link>
          <Link
            href="/admin/analytics"
            className={`nav-item ${pathname === '/admin/analytics' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <PieChart /> <span>Reports</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">{getInitials(currentUser.name)}</div>
          <div className="user-details">
            <h4>{currentUser.name}</h4>
            <span>Administrator</span>
          </div>
          <button id="logout-btn" onClick={handleSignOut} title="Sign Out">
            <LogOut style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className={`app-body ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="app-header">
          <div className="header-left">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle-btn"><Menu /></button>
            <h2 className="view-title">{getPageTitle()}</h2>
          </div>
          <div className="header-right">
            {adminClockedInCount > 0 ? (
              <div className="pulse-indicator-live">
                <span className="live-dot pulse" /> {adminClockedInCount} Checked In
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
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }} /> 0 Checked In
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
