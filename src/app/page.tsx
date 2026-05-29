'use client';

import React from 'react';
import {
  Clock, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, Check, Info
} from 'lucide-react';
import { useChronos } from '../context/ChronosContext';

export default function Home() {
  const {
    currentUser,
    loading,
    authRole,
    setAuthRole,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    toasts,
    triggerToast,
    handleSignIn
  } = useChronos();

  if (loading) {
    return (
      <div className="flex-center flex-col" style={{ minHeight: '100vh', gap: '16px' }}>
        <Clock className="logo-icon animate-spin text-indigo" style={{ width: '48px', height: '48px' }} />
        <h4 className="text-muted">Loading Veltria Portal...</h4>
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="flex-center flex-col" style={{ minHeight: '100vh', gap: '16px' }}>
        <Clock className="logo-icon animate-spin text-indigo" style={{ width: '48px', height: '48px' }} />
        <h4 className="text-muted">Redirecting to Dashboard...</h4>
      </div>
    );
  }

  return (
    <div id="login-container">
      {/* Render Toasts */}
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

      <div className="login-card glassmorphism">
        <div className="login-header">
          <div className="logo-wrapper">
            
            <span className="logo-text">Veltria</span>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to manage your hours and workspace</p>
        </div>

        <div className="auth-toggle-group">
          <button
            type="button"
            className={`auth-toggle-btn ${authRole === 'employee' ? 'active' : ''}`}
            onClick={() => { setAuthRole('employee'); triggerToast("Employee Authorization Active"); }}
          >
            Employee
          </button>
          <button
            type="button"
            className={`auth-toggle-btn ${authRole === 'admin' ? 'active' : ''}`}
            onClick={() => { setAuthRole('admin'); triggerToast("Administrator Authorization Active"); }}
          >
            Administrator
          </button>
        </div>

        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="login-email"><Mail style={{ width: '14px', height: '14px' }} /> Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={authRole === 'admin' ? 'admin@company.com' : 'employee@company.com'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password"><Lock style={{ width: '14px', height: '14px' }} /> Password</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn glow-button">
            <span>Sign In</span>
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </form>

        <div className="login-footer">
          <p>Demo accounts:</p>
          <div className="demo-credentials">
            <div><span>Employee:</span> <code>employee@company.com</code> / <code>emp123</code></div>
            <div><span>Admin:</span> <code>admin@company.com</code> / <code>admin123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
