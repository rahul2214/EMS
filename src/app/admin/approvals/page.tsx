'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { useChronos } from '../../../context/ChronosContext';

export default function AdminApprovals() {
  const {
    employees,
    timesheets,
    formatDateDisplay,
    handleProcessApproval
  } = useChronos();

  const formatTimePeriod = (start: string, end: string) => {
    const formatSingle = (timeStr: string) => {
      if (!timeStr) return '';
      if (timeStr.includes('T')) {
        const d = new Date(timeStr);
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      }
      // legacy HH:MM
      const parts = timeStr.split(':');
      if (parts.length < 2) return timeStr;
      let hours = parseInt(parts[0]);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    };
    return `${formatSingle(start)} - ${formatSingle(end)}`;
  };

  const adminPendingList = timesheets
    .filter(t => t.status === 'pending')
    .sort((a, b) => a.date.localeCompare(b.date));

  const adminHistoryList = timesheets
    .filter(t => t.status !== 'pending')
    .sort((a, b) => (b.processed_date || '').localeCompare(a.processed_date || ''))
    .slice(0, 6);

  return (
    <div className="content-view active-view">
      <div className="approvals-layout">
        {/* Pending Approvals Card */}
        <div className="approvals-card glassmorphism">
          <div className="card-header">
            <h3>Pending Approvals Queue</h3>
            <p>Review timesheets logged by team members</p>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Time Period</th>
                  <th>Total Hours</th>
                  <th>Task Details</th>
                  <th className="actions-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {adminPendingList.map(t => {
                  const emp = employees.find(e => e.id === t.employee_id) || {
                    name: 'Unknown User'
                  };
                  return (
                    <tr key={t.id}>
                      <td>
                        <strong>{emp.name}</strong>
                      </td>
                      <td>{formatDateDisplay(t.date)}</td>
                      <td>{t.project}</td>
                      <td>
                        {formatTimePeriod(t.start_time, t.end_time)}
                      </td>
                      <td>
                        <strong className="text-indigo">{t.hours.toFixed(1)} hrs</strong>
                      </td>
                      <td>
                        <span className="text-muted" title={t.description}>
                          {t.description.length > 50
                            ? t.description.substring(0, 47) + '...'
                            : t.description}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button
                            onClick={() => handleProcessApproval(t.id, 'approved')}
                            className="action-btn approve"
                            title="Approve"
                          >
                            <Check style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            onClick={() => handleProcessApproval(t.id, 'rejected')}
                            className="action-btn reject"
                            title="Reject"
                          >
                            <X style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {adminPendingList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-muted" style={{ textAlign: 'center' }}>
                      No timesheets awaiting review.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decided Approvals History Card */}
        <div className="approvals-card glassmorphism mt-6">
          <div className="card-header">
            <h3>Decided Approvals History</h3>
            <p>Historical log of approved or rejected timesheets</p>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Hours</th>
                  <th>Processed Date</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {adminHistoryList.map(t => {
                  const emp = employees.find(e => e.id === t.employee_id) || {
                    name: 'Unknown User'
                  };
                  return (
                    <tr key={t.id}>
                      <td>{emp.name}</td>
                      <td>{formatDateDisplay(t.date)}</td>
                      <td>{t.project}</td>
                      <td>{t.hours.toFixed(1)} hrs</td>
                      <td>{formatDateDisplay(t.processed_date || '')}</td>
                      <td>
                        <span className={`badge badge-${t.status}`}>{t.status}</span>
                      </td>
                    </tr>
                  );
                })}
                {adminHistoryList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-muted" style={{ textAlign: 'center' }}>
                      No historical decisions found.
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
