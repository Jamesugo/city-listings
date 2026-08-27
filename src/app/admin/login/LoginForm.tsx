'use client';

import { useState } from 'react';
import { login, signup } from './actions';
import styles from '../page.module.css';
import { Lock, Sparkles, ClipboardList, Eye } from '@/components/Icons';

export default function LoginForm({ error, message }: { error?: string; message?: string }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const isLogin = mode === 'login';

  return (
    <div className={styles.loginWrapper}>
      <form className={styles.loginCard}>
        <div className={styles.loginIcon} aria-hidden="true">
          {isLogin ? <Lock className={styles.iconElement} size={28} /> : <Sparkles className={styles.iconElement} size={28} />}
        </div>
        <h1 className={styles.loginTitle}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className={styles.loginDesc}>
          {isLogin ? 'Sign in to manage your business listings.' : 'Join NaijaList to discover or list your business.'}
        </p>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {message}
          </div>
        )}

        {/* Account Type — only shown during signup */}
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="accountType" className="form-label">I want to…</label>
            <select
              id="accountType"
              name="accountType"
              className="form-input form-select"
              defaultValue="owner"
              style={{ padding: '0.75rem' }}
            >
              <option value="owner">List my business on NaijaList</option>
              <option value="user">Browse &amp; review businesses</option>
            </select>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            required
            autoComplete="off"
            style={{ padding: '0.75rem' }}
          />
        </div>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            required
            autoComplete="new-password"
            style={{ padding: '0.75rem' }}
          />
        </div>
        
        <button 
          formAction={isLogin ? login : signup} 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, transition: 'all 0.2s ease' }}
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setMode(isLogin ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: '0.25rem' }}
          >
            {isLogin ? 'Sign up for free' : 'Log in instead'}
          </button>
        </div>
      </form>
    </div>
  );
}
