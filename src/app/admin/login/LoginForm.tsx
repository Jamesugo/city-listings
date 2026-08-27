'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { login, signup, resetPassword } from './actions';
import styles from '../page.module.css';
import { Lock, Sparkles, Loader2 } from '@/components/Icons';

function SubmitButton({ mode }: { mode: 'login' | 'signup' | 'forgot' }) {
  const { pending } = useFormStatus();
  
  const action = mode === 'login' ? login : mode === 'signup' ? signup : resetPassword;
  const loadingText = mode === 'login' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Sending Link...';
  const text = mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link';

  return (
    <button 
      formAction={action} 
      className="btn btn-primary" 
      disabled={pending}
      style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={18} /> 
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
}

export default function LoginForm({ error, message }: { error?: string; message?: string }) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const router = useRouter();
  const pathname = usePathname();
  
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';

  const toggleMode = () => {
    setMode(isLogin ? 'signup' : 'login');
    if (error || message) {
      router.replace(pathname); // Clears the query params
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <form className={styles.loginCard}>
        <div className={styles.loginIcon} aria-hidden="true">
          {isLogin ? <Lock className={styles.iconElement} size={28} /> : <Sparkles className={styles.iconElement} size={28} />}
        </div>
        <h1 className={styles.loginTitle}>
          {isLogin ? 'Welcome Back' : isSignup ? 'Create an Account' : 'Reset Password'}
        </h1>
        <p className={styles.loginDesc}>
          {isLogin ? 'Sign in to manage your business listings.' : isSignup ? 'Join NaijaList to discover or list your business.' : 'Enter your email and we will send you a reset link.'}
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
        {isSignup && (
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
        
        {!isForgot && (
          <div className="form-group" style={{ marginBottom: isLogin ? '0.5rem' : '1.5rem' }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              required={!isForgot}
              minLength={6}
              autoComplete="new-password"
              style={{ padding: '0.75rem' }}
            />
          </div>
        )}

        {isLogin && (
          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { setMode('forgot'); if (error || message) router.replace(pathname); }}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0' }}
            >
              Forgot Password?
            </button>
          </div>
        )}
        
        {isForgot && <div style={{ marginBottom: '1.5rem' }} />}
        
        <SubmitButton mode={mode} />
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
          {isSignup ? "Already have an account? " : isForgot ? "Remember your password? " : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => { setMode(isSignup || isForgot ? 'login' : 'signup'); if (error || message) router.replace(pathname); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: '0.25rem' }}
          >
            {isSignup || isForgot ? 'Log in instead' : 'Sign up for free'}
          </button>
        </div>
      </form>
    </div>
  );
}
