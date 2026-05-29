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

  // Date Filters
  const getFirstOfCurrentMonth = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}-01`;
  };

  const getLocalDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fromDate, setFromDate] = useState(getFirstOfCurrentMonth());
  const [toDate, setToDate] = useState(getLocalDateString());
  const [appliedFrom, setAppliedFrom] = useState(getFirstOfCurrentMonth());
  const [appliedTo, setAppliedTo] = useState(getLocalDateString());

  // Toolbar Filters
  const [showToolbarFilters, setShowToolbarFilters] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

  // Formats decimal hours into e.g. "7 hrs 34 mins"
  const formatWorkingHours = (hoursVal: number) => {
    if (!hoursVal || isNaN(hoursVal)) return '';
    const totalMinutes = Math.round(hoursVal * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0 && mins > 0) {
      return `${hrs} hrs ${mins} mins`;
    } else if (hrs > 0) {
      return `${hrs} hrs`;
    } else {
      return `${mins} mins`;
    }
  };

  // Clock State Date calculation
  const getClockStateDateString = () => {
    if (!clockState?.start_time) return '';
    const d = new Date(clockState.start_time);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const activeShiftDateStr = getClockStateDateString();

  // Filter Completed Shifts
  const filteredShifts = empSheets.filter(t => {
    return t.date >= appliedFrom && t.date <= appliedTo;
  });

  const tableRows: Array<{
    is_active: boolean;
    location: string;
    date: string;
    checkIn: string;
    checkOut: string;
    hours: string;
    status: string;
    rawDate: string;
  }> = [];

  // Synthesize active row if clocked in & falls within filtered range
  if (clockState && clockState.is_clocked_in) {
    if (activeShiftDateStr >= appliedFrom && activeShiftDateStr <= appliedTo) {
      tableRows.push({
        is_active: true,
        location: clockState.project || 'Bangalore Metro Building',
        date: formatToCustomDate(clockState.start_time),
        checkIn: formatToCustomDateTime(clockState.start_time),
        checkOut: '',
        hours: '',
        status: 'Not Checked Out',
        rawDate: activeShiftDateStr
      });
    }
  }

  // Add completed shifts
  filteredShifts.forEach(t => {
    tableRows.push({
      is_active: false,
      location: t.project || 'Bangalore Metro Building',
      date: formatToCustomDate(t.date),
      checkIn: formatCompletedDateTime(t.date, t.start_time),
      checkOut: formatCompletedDateTime(t.date, t.end_time),
      hours: formatWorkingHours(t.hours),
      status: 'Checked Out',
      rawDate: t.date
    });
  });

  // Sort rows descending
  tableRows.sort((a, b) => b.rawDate.localeCompare(a.rawDate));

  // Filter by toolbar selects
  const finalFilteredRows = tableRows.filter(row => {
    const matchesLocation = filterLocation === 'All' || row.location === filterLocation;
    const matchesStatus = filterStatus === 'All' || row.status === filterStatus;
    return matchesLocation && matchesStatus;
  });

  // Pagination bounds
  const totalPages = Math.ceil(finalFilteredRows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = finalFilteredRows.slice(startIndex, startIndex + rowsPerPage);

  const handleApplyFilter = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setFromDate(getFirstOfCurrentMonth());
    setToDate(getLocalDateString());
    setAppliedFrom(getFirstOfCurrentMonth());
    setAppliedTo(getLocalDateString());
    setFilterLocation('All');
    setFilterStatus('All');
    setCurrentPage(1);
  };

  return (
    <div className="content-view active-view" style={{ padding: '0px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>Attendance Overview</h2>
      
      <div className="attendance-card-row" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '40px' }}>
        
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
                <option value="Office">Bangalore Metro Building</option>
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
                const mappedLoc = workLocation === 'Office' ? 'Bangalore Metro Building' : 'Remote';
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
              <span>📍 {clockState.project || 'Bangalore Metro Building'}</span>
              <span>🕒 Started: {new Date(clockState.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
        
      </div>

      {/* Attendance Details Table Section */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>Attendance Details</h3>

        {/* Date Filter Panel */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center',
          background: '#ffffff',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
        }}>
          {/* From Date */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(226, 232, 240, 1)',
            borderRadius: '12px',
            padding: '10px 16px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            width: '200px'
          }}>
            <span style={{
              position: 'absolute',
              top: '-8px',
              left: '12px',
              background: '#ffffff',
              padding: '0 4px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>From Date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '14px',
                color: 'var(--text-main)',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            />
          </div>

          {/* To Date */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(226, 232, 240, 1)',
            borderRadius: '12px',
            padding: '10px 16px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            width: '200px'
          }}>
            <span style={{
              position: 'absolute',
              top: '-8px',
              left: '12px',
              background: '#ffffff',
              padding: '0 4px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>To Date</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '14px',
                color: 'var(--text-main)',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleApplyFilter}
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px var(--primary-glow)',
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Apply Filter
            </button>
            <button
              onClick={handleClearFilter}
              style={{
                background: '#f1f5f9',
                color: 'var(--text-main)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Toolbar & Grid Details */}
        <div className="table-container" style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden'
        }}>
          {/* DataGrid-like Toolbar */}
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            fontSize: '13px',
            color: 'var(--primary)',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <span>📊 Columns</span>
            </div>
            <div 
              onClick={() => setShowToolbarFilters(!showToolbarFilters)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                cursor: 'pointer',
                background: showToolbarFilters ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
            >
              <span>🔍 Filters</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <span>🎚️ Density</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <span>📤 Export</span>
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          {showToolbarFilters && (
            <div style={{
              display: 'flex',
              gap: '24px',
              padding: '16px 20px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Work Location Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Location Filter
                </span>
                <select
                  value={filterLocation}
                  onChange={(e) => {
                    setFilterLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    minWidth: '160px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Locations</option>
                  <option value="Bangalore Metro Building">Bangalore Metro Building</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Status Filter
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    minWidth: '160px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Not Checked Out">Not Checked Out</option>
                </select>
              </div>

              {/* Reset Filters button */}
              {(filterLocation !== 'All' || filterStatus !== 'All') && (
                <button
                  onClick={() => {
                    setFilterLocation('All');
                    setFilterStatus('All');
                    setCurrentPage(1);
                  }}
                  style={{
                    alignSelf: 'flex-end',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, width: '70px' }}>SI No</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Work Location</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>First Check-In Time</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Last Check-Out Time</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Working Hours</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, idx) => {
                const slNo = startIndex + idx + 1;
                return (
                  <tr key={idx} style={{ borderBottom: idx === paginatedRows.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px' }}>{slNo}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px', fontWeight: 500 }}>{row.location}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>{row.date}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px' }}>{row.checkIn}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px' }}>{row.checkOut || '-'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                      {row.is_active ? (
                        <span style={{ color: '#FF453A', fontWeight: 'bold' }}>{row.status}</span>
                      ) : (
                        <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{row.status}</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '14px', fontWeight: 500 }}>{row.hours || '-'}</td>
                  </tr>
                );
              })}
              
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dark)' }}>
                     No shifts recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '24px',
            borderTop: '1px solid #e2e8f0',
            padding: '16px 24px',
            fontSize: '14px',
            color: 'var(--text-muted)',
            background: '#ffffff',
            fontWeight: 500
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Rows per page:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>10</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </div>
            
            <span>
              {finalFilteredRows.length > 0 ? `${startIndex + 1}-${Math.min(startIndex + rowsPerPage, finalFilteredRows.length)} of ${finalFilteredRows.length}` : '0-0 of 0'}
            </span>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? 'var(--text-dark)' : 'var(--primary)',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ◀
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                  color: (currentPage === totalPages || totalPages === 0) ? 'var(--text-dark)' : 'var(--primary)',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
