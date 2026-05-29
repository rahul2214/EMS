'use client';

import React, { useState } from 'react';
import { useChronos } from '../../../context/ChronosContext';

export default function EmployeeDashboard() {
  const {
    currentUser,
    timesheets,
    clockState,
    elapsedTime,
    handleClockToggle
  } = useChronos();

  const [workLocation, setWorkLocation] = useState<'Office' | 'Remote'>('Office');

  if (!currentUser) return null;

  const empSheets = timesheets.filter(t => t.employee_id === currentUser.id);

  // Formats to DD-MMM-YYYY (e.g. 29-May-2026)
  const formatToCustomDate = (dateVal: string | Date) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };

  // Formats to DD-MMM-YYYY hh:mm AM/PM (e.g. 29-May-2026 11:45 AM)
  const formatToCustomDateTime = (dateVal: string | Date) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const datePart = `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const timePart = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    
    return `${datePart} ${timePart}`;
  };

  // Formats timesheet HH:MM start/end strings to DD-MMM-YYYY hh:mm AM/PM
  const formatCompletedDateTime = (dateStr: string, timeStr: string) => {
    if (!timeStr) return '';
    let d: Date;
    if (timeStr.includes('T') || timeStr.includes('-')) {
      d = new Date(timeStr);
    } else {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hoursStr, minutesStr] = timeStr.split(':').map(Number);
      d = new Date(year, month - 1, day, hoursStr, minutesStr);
    }
    
    if (isNaN(d.getTime())) return '';
    
    const dayFormatted = String(d.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const datePart = `${dayFormatted}-${months[d.getMonth()]}-${d.getFullYear()}`;
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timePart = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    
    return `${datePart} ${timePart}`;
  };

  const getLocalDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayStr = getLocalDateString();

  const todayCompletedShifts = empSheets.filter(t => t.date === todayStr);
  const sortedCompleted = [...todayCompletedShifts].sort((a, b) => b.start_time.localeCompare(a.start_time));

  const tableRows: Array<{
    is_active: boolean;
    location: string;
    date: string;
    checkIn: string;
    checkOut: string;
    hours: string;
    status: string;
  }> = [];

  // Synthesize active row if clocked in
  if (clockState && clockState.is_clocked_in) {
    tableRows.push({
      is_active: true,
      location: clockState.project || 'Office',
      date: formatToCustomDate(clockState.start_time),
      checkIn: formatToCustomDateTime(clockState.start_time),
      checkOut: '',
      hours: '',
      status: 'Not Checked Out'
    });
  }

  // Add completed shifts for today
  sortedCompleted.forEach(t => {
    tableRows.push({
      is_active: false,
      location: t.project || 'Office',
      date: formatToCustomDate(t.date),
      checkIn: formatCompletedDateTime(t.date, t.start_time),
      checkOut: formatCompletedDateTime(t.date, t.end_time),
      hours: `${t.hours.toFixed(1)} hrs`,
      status: 'Checked Out'
    });
  });

  return (
    <div className="content-view active-view" style={{ padding: '0px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>Attendance Overview</h2>
      
      <div className="attendance-card-row" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
        
        {/* Check-in Widget Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '260px',
          minHeight: '280px'
        }}>
          {/* Work Location Dropdown (when clocked out) */}
          {!clockState?.is_clocked_in ? (
            <div style={{ width: '100%', marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', textAlign: 'center' }}>
                Work Location
              </label>
              <select
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value as 'Office' | 'Remote')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(226, 232, 240, 1)',
                  background: '#f8fafc',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: 'none'
                }}
              >
                <option value="Office">Office</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          ) : (
            /* Digital Ticking Clock (when clocked in) */
            <div style={{ width: '100%', textAlign: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Working Session
              </span>
              <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                {elapsedTime}
              </span>
            </div>
          )}

          {/* Action Play/Stop Circle Button */}
          <button
            onClick={() => {
              if (clockState?.is_clocked_in) {
                handleClockToggle();
              } else {
                const mappedLoc = workLocation === 'Office' ? 'Office' : 'Remote';
                handleClockToggle(mappedLoc);
              }
            }}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: clockState?.is_clocked_in ? '#FF453A' : '#4cd137',
              boxShadow: clockState?.is_clocked_in 
                ? '0 6px 20px rgba(255, 69, 58, 0.3)' 
                : '0 6px 20px rgba(76, 209, 55, 0.3)',
              color: '#ffffff',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              marginBottom: '15px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {clockState?.is_clocked_in ? (
              <div style={{ width: '28px', height: '28px', backgroundColor: '#ffffff', borderRadius: '4px' }} />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '36px', height: '36px', marginLeft: '6px', color: '#ffffff' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Label below button */}
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: clockState?.is_clocked_in ? '8px' : '0' }}>
            {clockState?.is_clocked_in ? 'Check-out' : 'Check-in'}
          </span>

          {/* Clock In details (when clocked in) */}
          {clockState?.is_clocked_in && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span>📍 {clockState.project || 'Office'}</span>
              <span>🕒 Started: {new Date(clockState.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
        
      </div>

      {/* Today's Summary Table Section */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Today's Summary</h3>
        
        <div className="table-container" style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>SI No</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Work Location</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Check-In</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Check-Out</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Working Hours</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx === tableRows.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px' }}>{idx + 1}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px', fontWeight: 500 }}>{row.location}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>{row.date}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px' }}>{row.checkIn}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px' }}>{row.checkOut || '-'}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px', fontWeight: row.is_active ? 400 : 500 }}>{row.hours || '-'}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                    {row.is_active ? (
                      <span style={{ color: '#FF453A', fontWeight: 'bold' }}>{row.status}</span>
                    ) : (
                      <span className="badge badge-approved">{row.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dark)' }}>
                     No shifts recorded for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div style={{
            borderTop: '1px solid #e2e8f0',
            padding: '16px 20px',
            textAlign: 'right',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: '#f8fafc'
          }}>
            Total Rows: {tableRows.length}
          </div>
        </div>
      </div>

    </div>
  );
}
