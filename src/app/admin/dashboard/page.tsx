'use client';

import React from 'react';
import { Users, Clock, CheckSquare } from 'lucide-react';
import { useChronos } from '../../../context/ChronosContext';

export default function AdminDashboard() {
  const {
    employees,
    timesheets,
    allClockStates,
    getInitials,
    currentTime // used to trigger real-time ticks for the active duty durations
  } = useChronos();

  const adminClockedInCount = Object.values(allClockStates).filter((s: any) => s.is_clocked_in).length;
  const adminPendingList = timesheets.filter(t => t.status === 'pending');
  const approvedHrs = timesheets.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.hours, 0);

  return (
    <div className="content-view active-view">
      <div className="stats-grid">
        <div className="stat-card glassmorphism hover-tilt">
          <div className="stat-icon-wrapper color-indigo">
            <Users />
          </div>
          <div className="stat-info">
            <h3>Staff Directory</h3>
            <p className="stat-value">{employees.length}</p>
            <span className="stat-subtext text-muted">
              {adminClockedInCount} clocked in now
            </span>
          </div>
        </div>

        <div className="stat-card glassmorphism hover-tilt">
          <div className="stat-icon-wrapper color-emerald">
            <Clock />
          </div>
          <div className="stat-info">
            <h3>Hours Logged</h3>
            <p className="stat-value">{approvedHrs.toFixed(1)} hrs</p>
            <span className="stat-subtext text-success">Approved shifts total</span>
          </div>
        </div>

        <div className="stat-card glassmorphism hover-tilt">
          <div className="stat-icon-wrapper color-amber">
            <CheckSquare />
          </div>
          <div className="stat-info">
            <h3>Pending Actions</h3>
            <p className="stat-value">{adminPendingList.length}</p>
            <span className="stat-subtext text-warning">Timesheets awaiting approval</span>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-col glassmorphism full-width">
          <div className="widget-header flex-row flex-between">
            <div>
              <h3>Real-Time Employee Shift Tracker</h3>
              <p className="section-subtitle">Live statuses of currently clocked-in team members</p>
            </div>
            <span className="pulse-indicator-live">
              <span className="live-dot pulse" /> Live System Feed
            </span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Session Start</th>
                  <th>Duration Today</th>
                  <th>Role / Department</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const stateObj = allClockStates[emp.id];
                  const active = stateObj && stateObj.is_clocked_in;
                  let startStr = '--:--';
                  let diffStr = '--';

                  if (active) {
                    const startLocal = new Date(stateObj.start_time);
                    startStr = startLocal.toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });
                    const diffHrs = ((Date.now() - startLocal.getTime()) / 3600000).toFixed(2);
                    diffStr = `${diffHrs} hrs`;
                  }

                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="employee-info-cell">
                          <div className="directory-avatar">
                            {getInitials(emp.name)}
                          </div>
                          <div>
                            <h5>{emp.name}</h5>
                            <span className="text-muted">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-status ${active ? 'status-active' : 'status-offline'}`}>
                          {active ? 'Active Duty' : 'Offline'}
                        </span>
                      </td>
                      <td>{startStr}</td>
                      <td>
                        <strong>{diffStr}</strong>
                      </td>
                      <td>
                        {emp.role} <span className="text-muted">({emp.department})</span>
                      </td>
                    </tr>
                  );
                })}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-muted" style={{ textAlign: 'center' }}>
                      No employees registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
