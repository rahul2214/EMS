'use client';

import React from 'react';
import {
  UserPlus, Trash2, User, Mail, Building2, KeyRound, UserCheck, X
} from 'lucide-react';
import { useChronos } from '../../../context/ChronosContext';

export default function AdminEmployees() {
  const {
    employees,
    timesheets,
    allClockStates,
    getInitials,

    // Modal state & inputs
    isAddModalOpen,
    setIsAddModalOpen,
    newEmpName,
    setNewEmpName,
    newEmpEmail,
    setNewEmpEmail,
    newEmpRole,
    setNewEmpRole,
    newEmpDept,
    setNewEmpDept,
    newEmpPassword,
    setNewEmpPassword,
    newEmpConfirmPassword,
    setNewEmpConfirmPassword,

    // Actions
    handleCreateEmployee,
    handleDeleteEmployee
  } = useChronos();

  return (
    <div className="content-view active-view">
      <div className="directory-header-row flex-row flex-between">
        <div>
          <h3>Employee Staff Directory</h3>
          <p className="section-subtitle">Manage company access, job descriptions, and view stats</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="add-emp-btn glow-button"
        >
          <UserPlus style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px' }} />
          <span>Add New Employee</span>
        </button>
      </div>

      <div className="directory-container glassmorphism mt-4">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role / Department</th>
                <th>Active Shift Status</th>
                <th>Approved Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const approvedTotal = timesheets
                  .filter(t => t.employee_id === emp.id && t.status === 'approved')
                  .reduce((sum, t) => sum + t.hours, 0);
                const active = allClockStates[emp.id]?.is_clocked_in;

                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="employee-info-cell">
                        <div className="directory-avatar">{getInitials(emp.name)}</div>
                        <h5>{emp.name}</h5>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td>
                      <div>
                        <strong>{emp.role}</strong>
                      </div>
                      <div className="text-sm text-muted">{emp.department}</div>
                    </td>
                    <td>
                      {active ? (
                        <span
                          className="text-success font-semibold flex-row"
                          style={{ gap: '6px', alignItems: 'center' }}
                        >
                          <span
                            className="live-dot pulse"
                            style={{ display: 'inline-block' }}
                          />{' '}
                          Clocked In
                        </span>
                      ) : (
                        <span className="text-muted">Offline</span>
                      )}
                    </td>
                    <td>
                      <strong>{approvedTotal.toFixed(1)} hrs</strong>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="action-btn reject"
                        title="Delete Account"
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted" style={{ textAlign: 'center' }}>
                    No employees registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glassmorphism animated-scale-up">
            <div className="modal-header">
              <h3>Add New Employee Account</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="modal-close-btn"
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="form-group">
                <label htmlFor="emp-name">
                  <User style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="emp-name"
                  required
                  placeholder="John Doe"
                  value={newEmpName}
                  onChange={e => setNewEmpName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp-email">
                  <Mail style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="emp-email"
                  required
                  placeholder="johndoe@company.com"
                  value={newEmpEmail}
                  onChange={e => setNewEmpEmail(e.target.value)}
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="emp-role">
                    <Building2 style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="emp-role"
                    required
                    placeholder="UI/UX Designer"
                    value={newEmpRole}
                    onChange={e => setNewEmpRole(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="emp-dept">
                    <Building2 style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                    Department
                  </label>
                  <select
                    id="emp-dept"
                    required
                    value={newEmpDept}
                    onChange={e => setNewEmpDept(e.target.value)}
                  >
                    <option value="">Select Dept</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="emp-password">
                    <KeyRound style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                    Login Password
                  </label>
                  <input
                    type="password"
                    id="emp-password"
                    required
                    placeholder="Min 6 characters"
                    minLength={6}
                    value={newEmpPassword}
                    onChange={e => setNewEmpPassword(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="emp-confirm-password">
                    <KeyRound style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="emp-confirm-password"
                    required
                    placeholder="Verify password"
                    minLength={6}
                    value={newEmpConfirmPassword}
                    onChange={e => setNewEmpConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn glow-button mt-4" style={{ width: '100%' }}>
                <UserCheck style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                <span>Register Account</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
