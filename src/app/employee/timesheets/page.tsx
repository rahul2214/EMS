'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Trash2, PlusCircle, Calendar, Briefcase, User, Info, CheckSquare, Save } from 'lucide-react';
import { useChronos } from '../../../context/ChronosContext';

export default function EmployeeTimesheets() {
  const router = useRouter();
  const {
    currentUser,
    tsWeek,
    setTsWeek,
    tsMasterCode,
    setTsMasterCode,
    tsManager,
    setTsManager,
    tsRole,
    setTsRole,
    tsStatus,
    activityRows,
    PROJECT_DETAILS_MAP,
    addActivityRow,
    removeActivityRow,
    updateActivityRowField,
    handleLoadActivities,
    handleResetTimesheet,
    handleSaveTimesheetDraft,
    handleSubmitTimesheet
  } = useChronos();

  if (!currentUser) return null;

  const ACTIVITY_OPTIONS = [
    'Tech Enablement',
    'Feature Development',
    'Documentation',
    'System Maintenance',
    'Client: Orion System',
    'Marketing Research'
  ];

  const MANAGER_OPTIONS = [
    'KOMAL PREET',
    'VARSHITHA',
    'SARAH CONNOR'
  ];

  const ROLE_OPTIONS = [
    'Software Engineer',
    'Mendix Developer',
    'Lead Designer',
    'Project Lead',
    'System Analyst'
  ];

  return (
    <div className="content-view active-view" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
    

        {/* 2. Top filters row (4 columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label><Calendar style={{ width: '14px', height: '14px' }} /> Week *</label>
            <input
              type="date"
              value={tsWeek}
              onChange={(e) => setTsWeek(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Briefcase style={{ width: '14px', height: '14px' }} /> Master Project Code *</label>
            <select
              value={tsMasterCode}
              onChange={(e) => setTsMasterCode(e.target.value)}
              disabled={!tsWeek}
              required
            >
              <option value="">Select Project Code</option>
              {Object.keys(PROJECT_DETAILS_MAP).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label><User style={{ width: '14px', height: '14px' }} /> Manager *</label>
            <select
              value={tsManager}
              onChange={(e) => setTsManager(e.target.value)}
              disabled={!tsWeek}
              required
            >
              <option value="">Select Manager</option>
              {MANAGER_OPTIONS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label><Info style={{ width: '14px', height: '14px' }} /> Status</label>
            <input
              type="text"
              value={tsStatus}
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              readOnly
            />
          </div>
        </div>

        {/* 3. Operations Row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '0 0 200px', marginBottom: 0 }}>
            <label><Briefcase style={{ width: '14px', height: '14px' }} /> Role *</label>
            <select
              value={tsRole}
              onChange={(e) => setTsRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              {ROLE_OPTIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', height: '46px' }}>
            <button onClick={handleLoadActivities} className="glow-button" style={{ padding: '0 24px', borderRadius: 'var(--radius-sm)' }}>
              LOAD
            </button>
            <button onClick={handleResetTimesheet} style={{ padding: '0 24px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              RESET
            </button>
          </div>
        </div>

        {/* 4. Reactive Project details panel */}
        {tsMasterCode && (
          <div className="glassmorphism" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Project Details</span>
                <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Master Project Code</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{tsMasterCode}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Description</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{PROJECT_DETAILS_MAP[tsMasterCode]?.description || 'Project Workspace'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Dynamic Activity Table */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Weekly Work Details</h4>
          <button onClick={addActivityRow} className="glow-button" style={{ background: 'var(--primary)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
            <PlusCircle style={{ width: '15px', height: '15px' }} /> Add Activity Row
          </button>
        </div>

        <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <table style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
                <th style={{ width: '220px' }}>Activity</th>
                <th style={{ width: '160px' }}>Activity Type</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Mon</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Tue</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Wed</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Thu</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Fri</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Sat</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Sun</th>
                <th>Work Comment</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row, idx) => (
                <tr key={row.id}>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => removeActivityRow(row.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </td>
                  <td>
                    <select
                      value={row.activityName}
                      onChange={(e) => updateActivityRowField(row.id, 'activityName', e.target.value)}
                      style={{ padding: '8px 10px' }}
                    >
                      {ACTIVITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.activityType}
                      style={{ padding: '8px 10px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      readOnly
                    />
                  </td>
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
                    <td key={dayIdx} style={{ padding: '8px 4px' }}>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={row.hours[dayIdx]}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newHrs = [...row.hours];
                          if (val !== '') {
                            const num = Number(val);
                            if (num > 24) {
                              newHrs[dayIdx] = '24';
                            } else if (num < 0) {
                              newHrs[dayIdx] = '0';
                            } else {
                              newHrs[dayIdx] = val;
                            }
                          } else {
                            newHrs[dayIdx] = '';
                          }
                          updateActivityRowField(row.id, 'hours', newHrs);
                        }}
                        style={{ padding: '8px 4px', textAlign: 'center' }}
                        placeholder="-"
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      type="text"
                      value={row.comment}
                      onChange={(e) => updateActivityRowField(row.id, 'comment', e.target.value)}
                      placeholder="Comment..."
                      style={{ padding: '8px 12px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <button
            onClick={handleSaveTimesheetDraft}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border-hover)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Save style={{ width: '16px', height: '16px' }} /> Save Draft
          </button>
          <button onClick={handleSubmitTimesheet} className="glow-button" style={{ padding: '0 24px', height: '46px', borderRadius: 'var(--radius-sm)' }}>
            <CheckSquare style={{ width: '16px', height: '16px' }} /> Submit Timesheet
          </button>
        </div>

      </div>
    </div>
  );
}
