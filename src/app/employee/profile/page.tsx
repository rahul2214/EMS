'use client';

import React from 'react';
import { Timer, ClipboardCheck } from 'lucide-react';
import { useChronos } from '../../../context/ChronosContext';

export default function EmployeeProfile() {
  const {
    currentUser,
    timesheets,
    getInitials,
    formatDateDisplay
  } = useChronos();

  if (!currentUser) return null;

  const empSheets = timesheets.filter(t => t.employee_id === currentUser.id);
  const approvedHrs = empSheets.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.hours, 0);

  return (
    <div
      className="content-view active-view"
      style={{
        maxWidth: '680px',
        margin: '0 auto'
      }}
    >
      <div
        className="glassmorphism"
        style={{
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '24px'
          }}
        >
          <div
            className="user-avatar"
            style={{
              width: '80px',
              height: '80px',
              fontSize: '32px'
            }}
          >
            {getInitials(currentUser.name)}
          </div>
          <div>
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)'
              }}
            >
              {currentUser.name}
            </h2>
            <p
              style={{
                color: 'var(--primary-light)',
                fontWeight: 500,
                fontSize: '15px'
              }}
            >
              {currentUser.role} • {currentUser.department}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}
        >
          <div className="form-group">
            <label
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Email Address
            </label>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              {currentUser.email}
            </div>
          </div>

          <div className="form-group">
            <label
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Access Role
            </label>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              Employee Account
            </div>
          </div>

          <div className="form-group">
            <label
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Department
            </label>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              {currentUser.department}
            </div>
          </div>

          <div className="form-group">
            <label
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Account Created
            </label>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              {formatDateDisplay(currentUser.created_at?.split('T')[0] || '')}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginTop: '10px'
          }}
        >
          <div
            className="stat-card glassmorphism"
            style={{
              background: 'rgba(255,255,255,0.02)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              className="stat-icon-wrapper color-indigo"
              style={{
                width: '40px',
                height: '40px'
              }}
            >
              <Timer
                style={{
                  width: '20px',
                  height: '20px'
                }}
              />
            </div>
            <div>
              <h4
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}
              >
                Approved Hours
              </h4>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 700
                }}
              >
                {approvedHrs.toFixed(1)} hrs
              </p>
            </div>
          </div>

          <div
            className="stat-card glassmorphism"
            style={{
              background: 'rgba(255,255,255,0.02)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              className="stat-icon-wrapper color-emerald"
              style={{
                width: '40px',
                height: '40px'
              }}
            >
              <ClipboardCheck
                style={{
                  width: '20px',
                  height: '20px'
                }}
              />
            </div>
            <div>
              <h4
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}
              >
                Total Shifts
              </h4>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 700
                }}
              >
                {empSheets.length} shifts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
